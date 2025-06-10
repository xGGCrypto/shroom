import type { Meta } from "@storybook/react";
import { ShroomComponent, roomModels } from "./common";

const meta: Meta<typeof ShroomComponent> = {
  title: "Playground / General",
  component: ShroomComponent,
  argTypes: {
    wallColor: { control: "color" },
    floorColor: { control: "color" },
    floorTile: { control: "select", options: ["tile1", "tile2"] },
    wallTile: { control: "select", options: ["tile1", "tile2"] },
    hideFloor: { control: "boolean" },
    hideTileCursor: { control: "boolean" },
    wallDepth: { control: "number" },
    wallHeight: { control: "number" },
    hideWalls: { control: "boolean" },
    roomModel: {
      control: { type: "select" },
      options: Object.keys(roomModels),
      mapping: roomModels,
    },
    roomCamera: { control: "boolean" },
    avatarEnabled: { control: "boolean" },
    avatarLook: { control: "text" },
    floorFurni: { control: "object" },
    customResourcesEnabled: { control: "boolean" },
    customResourcesLink: { control: "text" },
  },
  args: {
    floorTile: "tile1",
    hideFloor: false,
    hideTileCursor: false,
    wallDepth: 10,
    wallHeight: 128,
    hideWalls: false,
    roomCamera: false,
    avatarEnabled: true,
    floorFurni: [
      { type: "club_sofa", roomX: 2, roomY: 1, roomZ: 0, direction: 4 },
      { type: "edice", roomX: 5, roomY: 1, roomZ: 0, direction: 4 },
      { type: "party_discol", roomX: 3, roomY: 3, roomZ: 0, direction: 4 },
    ],
    customResourcesEnabled: false,
    customResourcesLink: "",
  },
};

export default meta;
export const Primary = {};
