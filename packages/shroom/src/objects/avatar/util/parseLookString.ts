
/**
 * Represents a parsed avatar look, mapping part type strings (e.g., "hd", "ch")
 * to their set and color IDs.
 */
export type ParsedLook = Map<string, { setId: number; colorId: number }>;


/**
 * Parses a Habbo-style avatar look string into a map of part types to set/color IDs.
 *
 * The look string format is: "type1-setId1-colorId1.type2-setId2-colorId2..."
 * For example: "hd-180-1.ch-255-66.lg-280-110"
 *
 * @param look - The avatar look string to parse.
 * @returns A ParsedLook map where each key is a part type (e.g., "hd") and the value is an object with setId and colorId.
 */
export function parseLookString(look: string): ParsedLook {
  return new Map(
    look.split(".").map((str) => {
      const partData = str.split("-");

      return [
        partData[0],
        {
          setId: Number(partData[1]),
          colorId: Number(partData[2]),
        },
      ] as const;
    })
  );
}
