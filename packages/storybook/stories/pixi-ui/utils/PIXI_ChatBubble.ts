import { Text, Graphics, Container } from "pixi.js";
import { BaseAvatar, Shroom } from "@xggcrypto/shroom";
import { action } from "@storybook/addon-actions"; // Import for logging actions in Storybook

interface IChatBubbleOptions {
  textBubble: ITextBubbleOptions;
  textBorder?: ITextBorderOptions;
  x: number;
  y: number;
  shroom: Shroom;
}

interface ITextBubbleOptions {
  look: string;
  from: string;
  text: string;
  fontFamily?: string;
  fontSize?: number;
  color?: number;
  align?: "left" | "center" | "right";
}

interface ITextBorderOptions {
  radius?: number;
  height?: number;
  width?: number;
  color?: number;
  background?: number;
}

export class ChatBubble extends Container {
  private options: IChatBubbleOptions;
  private text: Text | undefined;
  private graphics: Graphics | undefined;
  private avatarHead: BaseAvatar | undefined;

  constructor(options: IChatBubbleOptions) {
    super();
    this.options = options;

    const { textBubble } = options;
    action("ChatBubble Created")(options);
    this.createAvatarHead(textBubble.look);
  }

  // Get the size of the avatar head, using default values if not available
  private getAvatarHeadSize(): { width: number; height: number } {
    if (!this.avatarHead) {
      action("AvatarHead Missing")("Using default size (33x35)");
      return { width: 33, height: 35 };
    }

    const { width, height } = this.avatarHead;
    if (width > 0 && height > 0) {
      action("AvatarHead Size Found")({ width, height });
      return { width, height };
    }

    const bounds = this.avatarHead.getBounds();
    action("AvatarHead Bounds")({ width: bounds.width, height: bounds.height });
    return bounds;
  }

  // Create the border around the text bubble
  private createBorder(graphic?: ITextBorderOptions) {
    const border = new Graphics();

    // Use default values if `graphic` is not defined or if specific properties are missing
    const borderWidth = graphic?.width || 2;
    const borderColor = graphic?.color || 0xffffff;
    const borderRadius = graphic?.radius || 10;
    const backgroundColor = graphic?.background || 0x000000;

    // Begin filling the background color if it exists
    if (graphic && graphic.background) {
      border.beginFill(backgroundColor);
      action("Border Background Set")(backgroundColor);
    }

    const avatarSize = this.getAvatarHeadSize();
    const textStartX = avatarSize.width + 9.5; // Adjust text start X position
    this.text!.position.set(textStartX, 10);

    const totalWidth = textStartX + this.text!.width + 10;
    const totalHeight = Math.max(avatarSize.height, this.text!.height) + 10;

    border
      .lineStyle(borderWidth, borderColor)
      .drawRoundedRect(0, 0, totalWidth, totalHeight, borderRadius);

    this.addChild(border, this.avatarHead!, this.text!);

    this.graphics = border;
    action("Border Created")({ totalWidth, totalHeight });
  }

  // Create the avatar head for the chat bubble
  private createAvatarHead(look: string) {
    this.avatarHead = BaseAvatar.fromShroom(this.options.shroom, {
      look: { look, actions: new Set(), direction: 4 },
      position: { x: -10.5, y: 64 },
      zIndex: 0,
      headOnly: true,
      onLoad: () => {
        const { textBorder, textBubble, x, y } = this.options;
        const message = `${textBubble.from}: ${textBubble.text}`;

        action("AvatarHead Loaded")("Creating Text and Border");
        this.createText(message);
        this.createBorder(textBorder!);

        this.position.set(x, y);
        action("ChatBubble Position Set")(this.position);
      },
    });
    action("AvatarHead Created")(look);
  }

  // Create the text for the chat bubble
  private createText(message: string) {
    const { textBubble } = this.options;

    this.text = new Text(message, {
      fontFamily: textBubble.fontFamily || "Arial",
      fontSize: textBubble.fontSize || 16,
      fill: textBubble.color || 0xffffff,
      align: textBubble.align || "left",
    });
    action("Text Created")(message);
  }

  // Update the text content of the chat bubble
  public setText(text: string) {
    if (this.text) {
      this.text.text = text;
      action("Text Updated")(text);
    }
  }

  // Update the text color of the chat bubble
  public setTextColor(color: number) {
    if (this.text) {
      this.text.style.fill = color;
      action("Text Color Updated")(color);
    }
  }

  // Update the font size of the chat bubble text
  public setFontSize(size: number) {
    if (this.text) {
      this.text.style.fontSize = size;
      action("Font Size Updated")(size);
    }
  }

  // Update the font family of the chat bubble text
  public setFontFamily(fontFamily: string) {
    if (this.text) {
      this.text.style.fontFamily = fontFamily;
      action("Font Family Updated")(fontFamily);
    }
  }

  // Get Pixi.js Application Ticker
  get applicationTicker() {
    return this.options.shroom.dependencies.application.ticker;
  }
  // Start checking if the chat bubble is off-screen
  public tick() {
    this.applicationTicker.add(this.isOffScreen);
    action("Tick Started")();
  }

  // Check if the chat bubble is off-screen and dispose of it if so
  private isOffScreen() {
    if (this.y < 0) {
      action("ChatBubble Off-Screen")("Destroying Chat Bubble");
      this.dispose();
    } else {
      this.y -= 1;
      action("ChatBubble Position Updated")(this.y);
    }
  }

  // Clean up resources when the chat bubble is destroyed
  public dispose() {
    this.applicationTicker.remove(this.isOffScreen);
    this.parent?.removeChild(this);
    this.destroy({ children: true, texture: true, baseTexture: true });

    this.avatarHead = undefined;
    this.text = undefined;
    this.graphics = undefined;

    action("ChatBubble Disposed")("Resources cleaned up");
  }
}
