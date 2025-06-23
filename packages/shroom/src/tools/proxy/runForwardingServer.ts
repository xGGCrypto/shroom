import WebSocket from "ws";
import { createConnection } from "net";
import ByteBuffer from "bytebuffer";

import { createServer } from "https";
import { readFileSync } from "fs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const frame = require("frame-stream");
import { Socket } from "net";

/**
 * Starts a WebSocket forwarding server that proxies messages to a TCP target (e.g., an emulator server).
 * Supports optional TLS, debug logging, and length-prefixed message framing.
 *
 * @param options.wsPort - The port to listen for WebSocket connections.
 * @param options.targetPort - The TCP port to forward traffic to.
 * @param options.debug - Enable verbose debug logging.
 * @param options.targetHost - The TCP host to forward traffic to (default: localhost).
 * @param options.prependLengthPrefix - If true, prepend a length prefix to forwarded messages.
 * @param options.keyPath - Path to TLS private key (enables HTTPS/WSS if provided with certPath).
 * @param options.certPath - Path to TLS certificate (enables HTTPS/WSS if provided with keyPath).
 * @returns An object with a `close` method to stop the server.
 */
export function runForwardingServer({
  wsPort,
  targetPort,
  debug = false,
  prependLengthPrefix = false,
  targetHost,
  keyPath,
  certPath
}: {
  wsPort: number;
  targetPort: number;
  debug?: boolean;
  targetHost?: string;
  prependLengthPrefix?: boolean;
  keyPath?: string,
  certPath?: string,
}) {
  let webSocketOptions: WebSocket.ServerOptions;
  if (keyPath && certPath) {
    try {
      webSocketOptions = {
        server: createServer({
          key: readFileSync(keyPath),
          cert: readFileSync(certPath)
        })
      };
      webSocketOptions.server?.listen(wsPort);
    } catch (err) {
      console.error("Failed to start secure server:", err);
      throw err;
    }
  } else {
    webSocketOptions = {
      port: wsPort
    };
  }

  const server = new WebSocket.Server(webSocketOptions);

  const targetHostStr =
    targetHost == null ? `:${targetPort}` : `${targetHost}:${targetPort}`;
  console.log(
    `${webSocketOptions.server ? 'Secure' : ''} WebSocket Server started on port ${wsPort}. Forwarding traffic to ${targetHostStr}.`
  );

  let idCounter = 0;

  server.on("connection", (ws) => {
    const id = ++idCounter;
    if (debug) console.log(`[${id}] Forwarding WebSocket Client connection`);

    // Defensive: handle connection errors
    let connection: Socket;
    try {
      connection = createConnection({ port: targetPort, host: targetHost });
    } catch (err) {
      ws.close();
      console.error(`[${id}] Failed to connect to target:`, err);
      return;
    }

    // Defensive: handle socket errors
    connection.on("error", (err) => {
      ws.close();
      if (debug) console.error(`[${id}] TCP connection error:`, err);
    });
    ws.on("error", (err) => {
      connection.end();
      if (debug) console.error(`[${id}] WebSocket error:`, err);
    });

    // Pipe to the frame-stream decoder to handle length prefixed messages
    connection.pipe(frame.decode()).on("data", (buffer: Buffer) => {
      try {
        if (prependLengthPrefix) {
          const framedBuffer = buffer as any;
          const baseBuffer = new ByteBuffer();
          baseBuffer.writeInt(framedBuffer.frameLength);
          baseBuffer.append(buffer);
          ws.send(baseBuffer.flip().toBuffer());
        } else {
          ws.send(buffer);
        }
        if (debug) console.log(`[${id}] Server => Client:`, buffer);
      } catch (err) {
        if (debug) console.error(`[${id}] Error sending to WebSocket:`, err);
      }
    });

    // Forward close event from server to websocket client
    connection.on("close", () => {
      if (ws.readyState === ws.OPEN || ws.readyState === ws.CONNECTING) ws.close();
      if (debug) console.log(`[${id}] Server closed the connection`);
    });

    // Forward messages sent by the websocket client to the emulator server
    ws.on("message", (message) => {
      try {
        const buffer = message as Buffer;
        const data = new ByteBuffer();
        // Write an int to the payload with the size of the buffer we are sending
        data.writeInt(buffer.length);
        data.append(buffer);
        const sendBuffer = data.flip().toBuffer();
        connection.write(new Uint8Array(sendBuffer));
        if (debug) console.log(`[${id}] Client => Server:`, sendBuffer);
      } catch (err) {
        if (debug) console.error(`[${id}] Error forwarding client message:`, err);
      }
    });

    // Forward close event to the emulator server
    ws.on("close", () => {
      if (!connection.destroyed) connection.end();
      if (debug) console.log(`[${id}] WebSocket closed the connection`);
    });
  });

  return {
    close() {
      server.close();
    },
  };
}
