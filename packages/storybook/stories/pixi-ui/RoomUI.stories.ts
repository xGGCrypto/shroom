import { createShroom } from "../common/createShroom";
import { ChatBubble } from "./utils/PIXI_ChatBubble";
import { action } from "@storybook/addon-actions";

export default {
  title: "Pixi UI/RoomUI",
  argTypes: {
    sender: { control: "text" },
    message: { control: "text" },
    look: { control: "text" },
  },
  args: {
    sender: "USER_NAME",
    message: "Hello World!",
    look: "hr-3163-39.hd-180-2.lg-3202-1322.ch-215-1331",
  },
};

export const RoomUI_Chat_Bubble = (args: any) => {
  return createShroom((options) => {
    const { application, container, shroom } = options;

    let currentChatBubble: ChatBubble | undefined;

    const createChatBubble = () => {
      currentChatBubble = new ChatBubble({
        shroom,
        x: application.screen.width / 2,
        y: application.screen.height / 2,
        textBubble: {
          from: args?.sender ?? "USER_NAME",
          text: args?.message ?? "Hello World!",
          look: args?.look ?? "hr-3163-39.hd-180-2.lg-3202-1322.ch-215-1331",
        },
      });

      application.stage.addChild(currentChatBubble);
    };

    const pushUpChatBubble = () => {
      if (!currentChatBubble) {
        createChatBubble();
      }

      currentChatBubble!.y -= 1; // Move the chat bubble up
      if (currentChatBubble!.y <= 0) {
        currentChatBubble!.y = application.screen.height / 2;
      }
    };

    application.ticker.add(pushUpChatBubble);

    return () => {
      if (currentChatBubble) {
        application.ticker.remove(pushUpChatBubble);
        application.stage.removeChild(currentChatBubble);
      }
    };
  });
};
