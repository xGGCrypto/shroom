import path from "path";
import { IFigureMapData } from "../../objects/avatar/data/interfaces/IFigureMapData";
import { promises as fs } from "fs";
import { AvatarManifestData } from "../../objects/avatar/data/AvatarManifestData";
import { ProgressBar } from "./ProgressBar";
import { Logger } from "./Logger";

/**
 * Generates an offsets.json file with asset offsets from avatar figure manifests.
 * Defensive: Skips missing/invalid manifest files and logs errors.
 *
 * @param downloadPath The base path where figure assets are stored.
 * @param figureMap The figure map data object.
 * @param logger Logger instance for progress and errors.
 */
export async function createOffsetFile(
  downloadPath: string,
  figureMap: IFigureMapData,
  logger: Logger
): Promise<void> {
  const assets = figureMap.getLibraries();
  const object: { [key: string]: { offsetX: number; offsetY: number } } = {};
  const progress = new ProgressBar(
    logger,
    assets.length,
    (current, count, data) => {
      if (data != null) {
        return `Figure Offsets: ${current} / ${count} (${data})`;
      } else {
        return `Figure Offsets: ${current} / ${count}`;
      }
    }
  );

  for (const asset of assets) {
    try {
      const manifestPath = path.join(
        downloadPath,
        "figure",
        asset,
        "manifest.bin"
      );
      const manifestFile = await fs.readFile(manifestPath, "utf-8");
      const manifest = new AvatarManifestData(manifestFile);

      manifest.getAssets().forEach((asset) => {
        object[asset.name] = { offsetX: asset.x, offsetY: asset.y };
      });
      progress.increment(asset);
    } catch (err) {
      logger.error(`Failed to process manifest for asset '${asset}': ${err}`);
      progress.increment(asset);
      continue;
    }
  }

  progress.done();

  try {
    await fs.writeFile(
      path.join(downloadPath, "offsets.json"),
      JSON.stringify(object, null, 2)
    );
    logger.info(`Offsets file written to ${path.join(downloadPath, "offsets.json")}`);
  } catch (err) {
    logger.error(`Failed to write offsets.json: ${err}`);
  }
}
