import {
  ShroomApplication,
  ShroomContainer,
  ShroomInteractionEvent,
  ShroomTexture,
} from "../../pixi-proxy";
import { IAnimationTicker } from "../../interfaces/IAnimationTicker";
import { IAvatarLoader } from "../../interfaces/IAvatarLoader";
import { IConfiguration } from "../../interfaces/IConfiguration";
import { IFurnitureData } from "../../interfaces/IFurnitureData";
import { IFurnitureLoader } from "../../interfaces/IFurnitureLoader";
import { IRoomGeometry } from "../../interfaces/IRoomGeometry";
import { IRoomObject } from "../../interfaces/IRoomObject";
import { IRoomObjectContainer } from "../../interfaces/IRoomObjectContainer";
import { RoomPosition } from "../../types/RoomPosition";
import { TileType } from "../../types/TileType";
import { ParsedTileType } from "../../util/parseTileMap";
import { parseTileMapString } from "../../util/parseTileMapString";
import { Shroom } from "../Shroom";
import { ITileMap } from "../../interfaces/ITileMap";
import { RoomObjectContainer } from "./RoomObjectContainer";
import { RoomModelVisualization } from "./RoomModelVisualization";
import { ParsedTileMap } from "./ParsedTileMap";
import { getTileColors, getWallColors } from "./util/getTileColors";
import { EventManager } from "../events/EventManager";
import { IEventManagerEvent } from "../events/interfaces/IEventManagerEvent";

/**
 * Dependencies required to construct a Room instance.
 */
export interface Dependencies {
  /** Animation ticker for driving room updates. */
  animationTicker: IAnimationTicker;
  /** Loader for avatar assets. */
  avatarLoader: IAvatarLoader;
  /** Loader for furniture assets. */
  furnitureLoader: IFurnitureLoader;
  /** Room configuration. */
  configuration: IConfiguration;
  /** Optional furniture data. */
  furnitureData?: IFurnitureData;
  /** The Pixi.js application instance. */
  application: ShroomApplication;
}

type TileMap = TileType[][] | string;

/**
 * Options for creating a Room instance.
 */
interface CreateOptions {
  /**
   * A tilemap string or 2d-array. This should have the following format:
   *
   * xxxx  <- Upper padding
   * x000  <- Tiles
   * x000
   * x000
   *
   * |
   * |
   * Side padding
   */
  tilemap: TileMap;
}

/**
 * The main Room class, representing a rendered room with geometry, objects, and visualization.
 * Provides APIs for managing room state, objects, events, and appearance.
 */
export class Room
  extends ShroomContainer
  implements IRoomGeometry, IRoomObjectContainer, ITileMap {
  /** The Pixi.js application instance. */
  public readonly application: ShroomApplication;

  /** Internal container for room objects. */
  private _roomObjectContainer: RoomObjectContainer;
  /** The visualization component for the room. */
  private _visualization: RoomModelVisualization;

  private _animationTicker: IAnimationTicker;
  private _avatarLoader: IAvatarLoader;
  private _furnitureLoader: IFurnitureLoader;
  private _eventManager: EventManager;
  private _configuration: IConfiguration;

  private _wallTexture: Promise<ShroomTexture> | ShroomTexture | undefined;
  private _floorTexture: Promise<ShroomTexture> | ShroomTexture | undefined;

  private _wallColor: string | undefined;
  private _floorColor: string | undefined;

  private _currentWallTexture: ShroomTexture | undefined;

  private _onTileClick:
    | ((position: RoomPosition, event: IEventManagerEvent) => void)
    | undefined;

  private _application: ShroomApplication;

  /**
   * Emits when the active tile changes (see RoomModelVisualization).
   */
  public get onActiveTileChange() {
    return this._visualization.onActiveTileChange;
  }

  /**
   * Emits when the active wall changes (see RoomModelVisualization).
   */
  public get onActiveWallChange() {
    return this._visualization.onActiveWallChange;
  }

  /**
   * Constructs a new Room instance.
   * @param deps All dependencies and options for the room.
   */
  constructor({
    animationTicker,
    avatarLoader,
    furnitureLoader,
    tilemap,
    configuration,
    application,
  }: {
    tilemap: TileMap;
  } & Dependencies) {
    super();
    const normalizedTileMap =
      typeof tilemap === "string" ? parseTileMapString(tilemap) : tilemap;

    this._application = application;
    this._animationTicker = animationTicker;
    this._furnitureLoader = furnitureLoader;
    this._avatarLoader = avatarLoader;
    this._eventManager = new EventManager();
    this._configuration = configuration;
    this.application = application;

    this._visualization = new RoomModelVisualization(
      this._eventManager,
      this.application,
      new ParsedTileMap(normalizedTileMap)
    );

    this._roomObjectContainer = new RoomObjectContainer();
    this._roomObjectContainer.context = {
      geometry: this,
      visualization: this._visualization,
      animationTicker: this._animationTicker,
      furnitureLoader: this._furnitureLoader,
      roomObjectContainer: this,
      avatarLoader: this._avatarLoader,
      eventManager: this._eventManager,
      configuration: this._configuration,
      tilemap: this,
      landscapeContainer: this._visualization,
      application: this._application,
      room: this,
    };

    this.addChild(this._visualization);

    this._visualization.onTileClick.subscribe((value) => {
      this.onTileClick && this.onTileClick(value.position, value.event);
    });
  }

  /**
   * Creates a new Room instance from a Shroom and options.
   * @param shroom A Shroom instance containing dependencies.
   * @param options Room creation options.
   * @returns A new Room instance.
   */
  static create(shroom: Shroom, { tilemap }: CreateOptions) {
    return new Room({ ...shroom.dependencies, tilemap });
  }

  /**
   * Returns the set of room objects currently attached to the room.
   */
  public get roomObjects() {
    return this._roomObjectContainer.roomObjects;
  }

  /**
   * When set to true, hides the walls.
   */
  public get hideWalls() {
    return this._visualization.hideWalls;
  }

  public set hideWalls(value) {
    this._visualization.hideWalls = value;
  }

  /**
   * When set to true, hides the floor. This will also hide the walls.
   */
  public get hideFloor() {
    return this._visualization.hideFloor;
  }

  public set hideFloor(value) {
    this._visualization.hideFloor = value;
  }

  /**
   * When set to true, hides the tile cursor.
   */
  public get hideTileCursor() {
    return this._visualization.hideTileCursor;
  }

  public set hideTileCursor(value) {
    this._visualization.hideTileCursor = value;
  }

  /**
   * Height of the walls in the room.
   */
  public get wallHeight() {
    return this._visualization.wallHeight;
  }

  public set wallHeight(value) {
    this._visualization.wallHeight = value;
  }

  /**
   * Height of the tile.
   */
  public get tileHeight() {
    return this._visualization.tileHeight;
  }

  public set tileHeight(value) {
    this._visualization.tileHeight = value;
  }

  /**
   * Depth of the wall.
   */
  public get wallDepth() {
    return this._visualization.wallDepth;
  }

  public set wallDepth(value) {
    this._visualization.wallDepth = value;
  }

  /**
   * A callback which is called with the tile position when a tile is clicked.
   */
  get onTileClick() {
    return this._onTileClick;
  }

  set onTileClick(value) {
    this._onTileClick = value;
  }

  /**
   * Texture of the wall.
   */
  get wallTexture() {
    return this._wallTexture;
  }

  set wallTexture(value) {
    this._wallTexture = value;
    this._loadWallTextures();
  }

  /**
   * Texture of the floor.
   */
  get floorTexture() {
    return this._floorTexture;
  }

  set floorTexture(value) {
    this._floorTexture = value;
    this._loadFloorTextures();
  }

  /**
   * Color of the wall.
   */
  get wallColor() {
    return this._wallColor;
  }

  set wallColor(value) {
    this._wallColor = value;
    this._updateWallColor();
  }

  /**
   * Color of the floor.
   */
  get floorColor() {
    return this._floorColor;
  }

  set floorColor(value) {
    this._floorColor = value;
    this._updateTileColor();
  }

  /**
   * Height of the room.
   */
  public get roomHeight() {
    return this._visualization.rectangle.height;
  }

  /**
   * Width of the room.
   */
  public get roomWidth() {
    return this._visualization.rectangle.width;
  }

  /**
   * Returns the visualization component for the room.
   */
  public get visualization(): RoomModelVisualization {
    return this._visualization;
  }

  /**
   * Returns the event manager for the room.
   */
  public get eventManager(): EventManager {
    return this._eventManager;
  }

  /**
   * Changes the tile map for the room, updating the visualization and preserving key properties.
   * @param tileMap The new tile map to use.
   */
  changeTileMap(tileMap: TileType[][]): void {
    this._visualization = new RoomModelVisualization(
      this._eventManager,
      this.application,
      new ParsedTileMap(tileMap)
    );

    const currentVisualization = this.children[0] as RoomModelVisualization;

    ["hideWalls", "wallDepth", "tileHeight", "wallHeight"].forEach(
      (property) => {
        // @ts-ignore
        this._visualization[property] = currentVisualization[property];
      }
    );

    this.removeChildAt(0);
    this.addChild(this._visualization);

    // refresh visualization data
    this.floorColor = this.floorColor;
    this.wallColor = this.wallColor;
    this.floorTexture = this.floorTexture;
    this.wallTexture = this.wallTexture;
  }

  /**
   * Returns the parsed tile types for the current tile map.
   */
  getParsedTileTypes(): ParsedTileType[][] {
    return this._visualization.parsedTileMap.parsedTileTypes;
  }

  /**
   * Adds and registers a room object to the room.
   * @param object The room object to attach.
   */
  addRoomObject(object: IRoomObject) {
    this._roomObjectContainer.addRoomObject(object);
  }

  /**
   * Removes and destroys a room object from the room.
   * @param object The room object to remove.
   */
  removeRoomObject(object: IRoomObject) {
    this._roomObjectContainer.removeRoomObject(object);
  }

  /**
   * Gets the screen position for a given room coordinate.
   * @param roomX The X coordinate in room space.
   * @param roomY The Y coordinate in room space.
   * @param roomZ The Z coordinate in room space.
   * @returns The screen position as an object with x and y.
   */
  getPosition(
    roomX: number,
    roomY: number,
    roomZ: number
  ): { x: number; y: number } {
    return this._visualization.getScreenPosition(roomX, roomY, roomZ);
  }

  /**
   * Gets the tile type at the given room coordinates.
   * @param roomX The X coordinate in room space.
   * @param roomY The Y coordinate in room space.
   * @returns The tile type, or undefined if not found.
   */
  getTileAtPosition(roomX: number, roomY: number) {
    const { x, y } = this._getObjectPositionWithOffset(roomX, roomY);

    const row = this._visualization.parsedTileMap.parsedTileTypes[y];
    if (row == null) return;
    if (row[x] == null) return;

    return row[x];
  }

  /**
   * Destroys the room and all attached objects and visualization.
   */
  destroy() {
    super.destroy();
    this.roomObjects.forEach((object) => this.removeRoomObject(object));
    this._visualization.destroy();
  }

  /**
   * Sets a callback for background click events.
   */
  public set onBackgroundClick(
    value: ((event: ShroomInteractionEvent) => void) | undefined
  ) {
    this._eventManager.onBackgroundClick = value;
  }

  /**
   * Gets the object position with any necessary offset (currently passthrough).
   * @private
   */
  private _getObjectPositionWithOffset(roomX: number, roomY: number) {
    return {
      x: roomX,
      y: roomY,
    };
  }

  /**
   * Loads and applies the wall texture asynchronously.
   * @private
   */
  private _loadWallTextures() {
    Promise.resolve(this.wallTexture).then((texture) => {
      this._currentWallTexture = texture;
      this._visualization.wallTexture = texture;
    });
  }

  /**
   * Loads and applies the floor texture asynchronously.
   * @private
   */
  private _loadFloorTextures() {
    Promise.resolve(this.floorTexture).then((texture) => {
      this._visualization.floorTexture = texture;
    });
  }

  /**
   * Updates the wall color tints in the visualization.
   * @private
   */
  private _updateWallColor() {
    const wallColors = getWallColors(this._getWallColor());
    this._visualization.wallLeftColor = wallColors.rightTint;
    this._visualization.wallRightColor = wallColors.leftTint;
    this._visualization.wallTopColor = wallColors.topTint;
  }

  /**
   * Updates the tile color tints in the visualization.
   * @private
   */
  private _updateTileColor() {
    if (this._floorColor != null) {
      const tileColors = getTileColors(this._floorColor);
      this._visualization.tileTopColor = tileColors.tileTint;
      this._visualization.tileLeftColor = tileColors.borderRightTint;
      this._visualization.tileRightColor = tileColors.borderLeftTint;
    } else {
      this._visualization.tileTopColor = undefined;
      this._visualization.tileLeftColor = undefined;
      this._visualization.tileRightColor = undefined;
    }
  }

  /**
   * Gets the wall color, using defaults if not set.
   * @private
   */
  private _getWallColor() {
    if (this.wallColor == null && this._currentWallTexture != null) {
      return "#ffffff";
    }
    if (this.wallColor == null && this._currentWallTexture == null) {
      return "#b6b8c7";
    }
    return this.wallColor ?? "#ffffff";
  }
}
