import { IFurniture, IFurnitureBehavior, Shroom } from "@xggcrypto/shroom";
import { action } from "@storybook/addon-actions";

export class MultiStateBehavior implements IFurnitureBehavior {
  private furniture?: IFurniture; // Reference to the furniture this behavior is attached to
  private currentState: number = 0; // Tracks the current state (animation) of the furniture
  private validAnimations: number[] = []; // Stores the list of valid animations for the furniture

  constructor(private shroom: Shroom) {} // Injects the Shroom instance

  // Updates the state of the furniture based on the current animation
  private updateState() {
    if (!this.furniture) return; // Exit if furniture is not set

    if (this.validAnimations.length === 0) {
      // Log if no valid animations are found
      action(`${this.furniture.type}_no_valid_animations`)(
        this.validAnimations
      );
      return;
    }

    const currentIndex = this.currentStateIndex ?? 0; // Get current state index or default to 0
    this.currentState = this.validAnimations[currentIndex]; // Set the current state based on the index
    this.furniture.animation = this.currentState.toString(); // Update the furniture's animation

    // Log the updated state
    action(`${this.furniture.type}_state_updated`)(
      this.validAnimations,
      `New State: ${this.currentState}`
    );
  }

  // Sets the parent furniture and initializes the behavior
  setParent(furniture: IFurniture): void {
    this.furniture = furniture;
    // Load the animation list and set up the double-click event
    this.loadAnimationList().then(() => {
      furniture.onDoubleClick = this.handleDoubleClick.bind(this);
    });
  }

  // Handles double-clicks to cycle through animations
  private handleDoubleClick() {
    this.currentState = this.validAnimations[this.nextStateIndex]; // Move to the next state
    this.updateState(); // Update the furniture with the new state
  }

  // Loads the list of valid animations for the furniture
  private async loadAnimationList() {
    if (!this.furniture) return;
    let furni_type = this.furniture.type;
    let furniFetch: FurnitureFetch = furni_type
      ? { type: furni_type, kind: "type" }
      : {
          id: this.furniture.id!,
          kind: "id",
          placementType: this.furniture.placementType,
        };

    const loadFurni = await this.shroom.dependencies.furnitureLoader.loadFurni(
      furniFetch
    );

    // Retrieve the animation IDs and store them
    this.validAnimations = loadFurni.visualizationData.getAnimationIds(64);
  }

  // Retrieves the index of the current state in the animation list
  private get currentStateIndex(): number | null {
    const index = this.validAnimations.indexOf(this.currentState);
    return this.isValidIndex(index) ? index : null; // Return index if valid, otherwise null
  }

  // Retrieves the index of the next state, looping back to the start if necessary
  private get nextStateIndex(): number {
    const nextIndex = (this.currentStateIndex ?? -1) + 1;
    return this.isValidIndex(nextIndex) ? nextIndex : 0; // Return valid next index, or 0
  }

  // Checks if the index is valid (not negative and within the bounds of the animation list)
  private isValidIndex(index: number): boolean {
    return index >= 0 && index < this.validAnimations.length;
  }
}

export type FurnitureFetch =
  | {
      kind: "id";
      id: string | number;
      placementType: "wall" | "floor";
    }
  | {
      kind: "type";
      type: string;
    };
