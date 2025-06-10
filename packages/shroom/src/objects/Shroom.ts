import { AnimationTicker } from "./animation/AnimationTicker";
import { AvatarLoader } from "./avatar/AvatarLoader";
import { FurnitureLoader } from "./furniture/FurnitureLoader";
import { FurnitureData } from "./furniture/FurnitureData";
import { Dependencies } from "./room/Room";
import { ShroomApplication } from "../pixi-proxy";
/**
 * Main entry point for creating and managing Shroom application dependencies.
 * Provides factory methods for instantiating and sharing core services.
 */
export class Shroom {
  /**
   * Constructs a new Shroom instance with the given dependencies.
   * @param dependencies The core dependencies for the Shroom application.
   */
  constructor(public readonly dependencies: Dependencies) {}

  /**
   * Create a shroom instance for a specific application.
   * @param options Options including resourcePath, application, and partial dependencies.
   */
  static create(
    options: {
      resourcePath?: string;
      application: ShroomApplication;
    } & Partial<Dependencies>
  ) {
    return this.createShared(options).for(options.application);
  }

  /**
   * Create a shared shroom instance. This is useful if you have multiple
   * `ShroomApplication` which all share the same shroom dependencies.
   * @param options Options including resourcePath and partial dependencies.
   * @returns An object with a `for` method to bind to a specific application.
   */
  static createShared({
    resourcePath,
    configuration,
    animationTicker,
    avatarLoader,
    furnitureData,
    furnitureLoader,
  }: {
    resourcePath?: string;
  } & Partial<Dependencies>) {
    const _furnitureData = furnitureData ?? FurnitureData.create(resourcePath);
    const _avatarLoader =
      avatarLoader ?? AvatarLoader.createForAssetBundle(resourcePath);
    const _furnitureLoader =
      furnitureLoader ??
      FurnitureLoader.createForJson(_furnitureData, resourcePath);
    const _configuration = configuration ?? {};

    return {
      /**
       * Binds the shared dependencies to a specific ShroomApplication instance.
       * @param application The application instance to bind.
       * @returns A new Shroom instance with all dependencies.
       */
      for: (application: ShroomApplication) => {
        const _animationTicker =
          animationTicker ?? AnimationTicker.create(application);

        const realDependencies: Dependencies = {
          animationTicker: _animationTicker,
          avatarLoader: _avatarLoader,
          furnitureLoader: _furnitureLoader,
          configuration: _configuration,
          furnitureData: _furnitureData,
          application,
        };

        return new Shroom(realDependencies);
      },
    };
  }
}
