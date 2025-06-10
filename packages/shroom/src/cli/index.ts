#!/usr/bin/env node

import yargs from "yargs";
import { JSDOM } from "jsdom";

import { dump } from "../tools/dump/dump";
import { runForwardingServer } from "../tools/proxy/runForwardingServer";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { hideBin } = require("yargs/helpers");

const jsdom = new JSDOM();

global.DOMParser = jsdom.window.DOMParser;

yargs(hideBin(process.argv))
  .command(
    "dump",
    "dump external variables",
    (yargs) => {
      yargs
        .option("url", {
          type: "string",
          describe: "Url to external variables",
        })
        .option("location", {
          type: "string",
          describe: "Path to store the extracted resources",
        })
        .demandOption(
          ["location"],
          "Provide a location to store the extracted resources"
        );
    },
    async (options: { url?: string; location: string }) => {
      try {
        await dump({
          externalVariables: options.url,
          downloadPath: options.location,
        });
      } catch (err) {
        console.error('[CLI] Error in dump command:', err);
        process.exit(1);
      }
    }
  )
  .command(
    "proxy",
    "host a proxy server forwarding WebSocket traffic to an emulator",
    (yargs) => {
      yargs
        .option("port", {
          type: "number",
          describe: "Port for the WebSocket server",
        })
        .option("target-port", {
          type: "number",
          describe: "Port to forward to",
        })
        .option("target-host", {
          type: "string",
          describe: "Target host address",
        })
        .option("prepend-length-prefix", {
          type: "boolean",
          default: false,
          describe: "Sends the length integer as a prefix to the message",
        })
        .option("key", {
          type: "string",
          describe: "Path to key for secure websocket"
        })
        .option("cert", {
          type: "string",
          describe: "Certificate for secure websocket"
        })
        .option("debug", {
          type: "boolean",
          describe: "Run in debug mode",
          default: false,
        })
        .demandOption(["port"], "Provide a port for the WebSocket server")
        .demandOption(
          ["target-port"],
          "Provide a target port to forward the traffic to"
        );
    },
    async (options: {
      _: string[];
      targetPort: number;
      port: number;
      prependLengthPrefix: boolean;
      debug: boolean;
      cert?: string;
      key?: string;
      targetHost?: string;
    }) => {
      try {
        // Validate port numbers
        if (isNaN(options.port) || options.port <= 0 || options.port > 65535) {
          throw new Error('Invalid port number for --port');
        }
        if (isNaN(options.targetPort) || options.targetPort <= 0 || options.targetPort > 65535) {
          throw new Error('Invalid port number for --target-port');
        }
        await runForwardingServer({
          wsPort: options.port,
          targetPort: options.targetPort,
          debug: options.debug,
          prependLengthPrefix: options.prependLengthPrefix,
          targetHost: options.targetHost,
          keyPath: options.key,
          certPath: options.cert,
        });
      } catch (err) {
        console.error('[CLI] Error in proxy command:', err);
        process.exit(1);
      }
    }
  )
  .strict()
  .demandCommand(1).argv;
