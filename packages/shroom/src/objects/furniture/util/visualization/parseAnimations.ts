import { VisualizationXmlVisualization } from "./VisualizationXml";

/**
 * Data for a single animation layer's frames.
 * @category FurnitureVisualization
 */
export type FramesData = {
  /** List of frame ids for this layer. */
  frames: string[];
  /** Optional repeat count for each frame. */
  frameRepeat?: number;
};

/**
 * Data for a complete animation, including all layers and frame counts.
 * @category FurnitureVisualization
 */
export type AnimationData = {
  /** Total number of frames in the animation. */
  frameCount: number;
  /** Map of layer id to frame data. */
  layerToFrames: Map<string, FramesData>;
};

/**
 * Parses animation data from a VisualizationXmlVisualization and populates the callback with each animation found.
 * @param visualization The XML visualization object
 * @param set Callback to receive each animation's id and data
 * @category FurnitureVisualization
 */
export function parseAnimations(
  visualization: VisualizationXmlVisualization,
  set: (id: string, animation: AnimationData) => void
): void {
  const animations = visualization.animations
    ? visualization.animations[0].animation
    : undefined;

  if (!animations) return;

  for (const animation of animations) {
    const animationId = animation["$"]?.id;
    if (!animationId) continue;

    const animationLayers = animation.animationLayer;
    const layerToFrames = new Map<string, FramesData>();
    let frameCount = 1;

    for (const layer of animationLayers) {
      const layerId = layer["$"]?.id;
      if (!layerId) continue;

      if (layer.frameSequence != null) {
        const frameSequenceFrames = layer.frameSequence[0].frame;
        const frames = frameSequenceFrames.map((frame) => frame["$"]?.id).filter(Boolean);
        const frameRepeatString = layer["$"]?.frameRepeat;

        layerToFrames.set(layerId, {
          frames,
          frameRepeat: frameRepeatString != null ? Number(frameRepeatString) : undefined,
        });

        if (frames.length > frameCount) {
          frameCount = frames.length;
        }
      }
    }

    set(animationId, {
      frameCount,
      layerToFrames,
    });
  }
}
