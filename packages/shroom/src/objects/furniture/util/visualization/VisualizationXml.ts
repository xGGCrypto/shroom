/**
 * Type representing the root visualization XML structure for furniture.
 * @category FurnitureVisualization
 */
export type VisualizationXml = {
  visualizationData: {
    graphics: {
      visualization: VisualizationXmlVisualization[];
    }[];
  };
};

/**
 * Type representing a single visualization entry in the XML.
 * @category FurnitureVisualization
 */
export type VisualizationXmlVisualization = {
  /** Attributes for this visualization (size, layerCount, etc). */
  $: { size: string; layerCount: string };
  /** Layer definitions for this visualization. */
  layers:
    | {
        layer: {
          $: {
            id: string;
            z: string | undefined;
            ink: string | undefined;
            tag: string | undefined;
            ignoreMouse: string | undefined;
            alpha: string | undefined;
          };
        }[];
      }[]
    | undefined;
  /** Direction overrides for this visualization. */
  directions: {
    direction: {
      $: { id: string };
      layer:
        | {
            $: {
              id: string;
              z: string | undefined;
              ink: string | undefined;
              tag: string | undefined;
            };
          }[]
        | undefined;
    }[];
  }[];
  /** Color definitions for this visualization. */
  colors:
    | {
        color: {
          $: {
            id: string;
          };
          colorLayer: {
            $: {
              id: string;
              color: string;
            };
          }[];
        }[];
      }[]
    | undefined;
  /** Animation definitions for this visualization. */
  animations:
    | {
        animation: {
          $: { id: string };
          animationLayer: {
            $: { id: string; frameRepeat: string | undefined };
            frameSequence: {
              frame: {
                $: {
                  id: string;
                };
              }[];
            }[];
          }[];
        }[];
      }[]
    | undefined;
};
