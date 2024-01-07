import * as PIXI from "pixi.js";
import { Shroom } from "@xggcrypto/shroom";
import React from "react";

type CleanupFn = () => void;
type CallbackOptions = {
  application: PIXI.Application;
  shroom: Shroom;
  container: HTMLDivElement;
  [key: string]: any;
};

export function createShroom(
  cb: (options: CallbackOptions) => CleanupFn | void
) {
  const App = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
      const element = canvasRef.current;
      const container = containerRef.current;
      if (element == null) return;
      if (container == null) return;

      const application = new PIXI.Application({
        view: element,
        width: window?.innerWidth ?? 1400,
        height: window?.innerHeight ?? 850,
      });

      const resourcePath = process.env.resourcePath || "./resources";
      const shroom = Shroom.create({
        resourcePath,
        application: application,
        configuration: {
          placeholder: PIXI.Texture.from("./images/placeholder.png"),
        },
      });

      const cleanup = cb({ application, shroom, container });

      return () => {
        cleanup && cleanup();

        application.destroy();
      };
    }, []);

    return (
      <div ref={containerRef}>
        <canvas ref={canvasRef} />
      </div>
    );
  };

  return <App />;
}
