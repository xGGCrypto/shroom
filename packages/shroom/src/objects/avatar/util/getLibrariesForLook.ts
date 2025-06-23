import { IFigureData } from "../data/interfaces/IFigureData";
import { IFigureMapData } from "../data/interfaces/IFigureMapData";
import { ParsedLook } from "./parseLookString";


/**
 * Determines the required asset libraries for a given avatar look.
 * Efficiently collects all unique libraries needed for the look's parts.
 *
 * @param look - The parsed look map.
 * @param deps - Object containing figureMap and figureData.
 * @returns A set of library identifiers needed for the look.
 */
export function getLibrariesForLook(
  look: ParsedLook,
  {
    figureMap,
    figureData,
  }: { figureMap: IFigureMapData; figureData: IFigureData }
): Set<string> {
  const libraries = new Set<string>();

  // Collect all parts for the look
  const figureParts = Array.from(look).flatMap(([setType, { setId }]) =>
    figureData.getParts(setType, setId.toString())?.map((part) => ({ ...part, setId, setType })) ?? []
  );

  for (const part of figureParts) {
    // Try direct library lookup
    let libraryId = figureMap.getLibraryOfPart(part.id, part.type);
    // If not found, check all parts in the set for a valid library
    if (libraryId == null) {
      const checkParts = figureData.getParts(part.setType, part.setId.toString()) ?? [];
      for (const checkPart of checkParts) {
        libraryId = figureMap.getLibraryOfPart(checkPart.id, checkPart.type);
        if (libraryId != null) break;
      }
    }
    if (libraryId != null) libraries.add(libraryId);
  }

  // Add base libraries (always required)
  libraries.add("hh_human_face");
  libraries.add("hh_human_item");
  libraries.add("hh_human_body");

  return libraries;
}
