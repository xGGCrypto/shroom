import { EventManagerNode } from "./EventManagerNode";
import { IEventManagerNode } from "./interfaces/IEventManagerNode";
import { IEventTarget } from "./interfaces/IEventTarget";
import RBush from "rbush";
import {
  EventGroupIdentifierParam,
  IEventManagerEvent,
} from "./interfaces/IEventManagerEvent";
import {
  EventGroupIdentifier,
  IEventGroup,
  TILE_CURSOR,
} from "./interfaces/IEventGroup";
import { IEventManager } from "./interfaces/IEventManager";
import { ShroomInteractionEvent } from "../../pixi-proxy";

/**
 * Manages event nodes, hit testing, and event propagation for interactive objects.
 * Handles pointer/click events, hit testing, and event bubbling/propagation.
 */
export class EventManager {
  private _nodes = new Map<IEventTarget, EventManagerNode>();
  private _bush = new RBush<EventManagerNode>();
  private _currentOverElements: Set<EventManagerNode> = new Set();
  private _pointerDownElements: Set<EventManagerNode> = new Set();
  private _onBackgroundClick:
    | ((event: ShroomInteractionEvent) => void)
    | undefined = undefined;

  /**
   * Sets the callback for background click events.
   */
  public set onBackgroundClick(
    value: ((event: ShroomInteractionEvent) => void) | undefined
  ) {
    this._onBackgroundClick = value;
  }

  /**
   * Handles a click event at the given coordinates.
   * @param event - The interaction event.
   * @param x - The x coordinate.
   * @param y - The y coordinate.
   */
  click(event: ShroomInteractionEvent, x: number, y: number) {
    const elements = this._performHitTest(x, y);
    new Propagation(event, elements.activeNodes, (target, event) =>
      target.triggerClick(event)
    );
  }

  /**
   * Handles a pointer down event at the given coordinates.
   * @param event - The interaction event.
   * @param x - The x coordinate.
   * @param y - The y coordinate.
   */
  pointerDown(event: ShroomInteractionEvent, x: number, y: number) {
    const elements = this._performHitTest(x, y);

    this._pointerDownElements = new Set(elements.activeNodes);

    new Propagation(event, elements.activeNodes, (target, event) =>
      target.triggerPointerDown(event)
    );
  }

  /**
   * Handles a pointer up event at the given coordinates.
   * @param event - The interaction event.
   * @param x - The x coordinate.
   * @param y - The y coordinate.
   */
  pointerUp(event: ShroomInteractionEvent, x: number, y: number) {
    const elements = this._performHitTest(x, y);

    const elementsSet = new Set(elements.activeNodes);
    const clickedNodes = new Set<EventManagerNode>();
    this._pointerDownElements.forEach((node) => {
      if (elementsSet.has(node)) {
        clickedNodes.add(node);
      }
    });

    if (
      elements.activeNodes.length === 0 &&
      clickedNodes.size === 0 &&
      this._onBackgroundClick
    ) {
      this._onBackgroundClick(event);
    }

    new Propagation(event, elements.activeNodes, (target, event) =>
      target.triggerPointerUp(event)
    );

    new Propagation(event, Array.from(clickedNodes), (target, event) => {
      target.triggerClick(event);
    });
  }

  /**
   * Handles pointer move events, updating over/out state and triggering events as needed.
   * @param event - The interaction event.
   * @param x - The x coordinate.
   * @param y - The y coordinate.
   */
  move(event: ShroomInteractionEvent, x: number, y: number) {
    const elements = this._performHitTest(x, y);
    const current = new Set(
      elements.activeNodes.filter(
        (node, index) =>
          // Only interested in the top most element
          index === 0 ||
          // or the tile cursor
          node.target.getGroup().getEventGroupIdentifier() === TILE_CURSOR
      )
    );
    const previous = this._currentOverElements;

    const added = new Set<EventManagerNode>();
    current.forEach((node) => {
      if (!previous.has(node)) {
        added.add(node);
      }
    });

    const removed = new Set<EventManagerNode>();
    previous.forEach((node) => {
      if (!current.has(node)) {
        removed.add(node);
      }
    });

    const addedGroups = new Set<IEventGroup>();
    added.forEach((node) => {
      addedGroups.add(node.target.getGroup());
    });

    const removedButGroupPresent = new Set<EventManagerNode>();
    const actualRemoved = new Set<EventManagerNode>();

    removed.forEach((node) => {
      if (addedGroups.has(node.target.getGroup())) {
        removedButGroupPresent.add(node);
      }

      actualRemoved.add(node);
    });

    this._currentOverElements = current;

    new Propagation(
      event,
      Array.from(removedButGroupPresent),
      (target, event) => {
        target.triggerPointerTargetChanged(event);
      }
    );

    new Propagation(event, Array.from(actualRemoved), (target, event) =>
      target.triggerPointerOut(event)
    );

    new Propagation(event, Array.from(added), (target, event) =>
      target.triggerPointerOver(event)
    );
  }

  /**
   * Registers a new event target and returns its node.
   * @param target - The event target to register.
   * @returns The created EventManagerNode.
   */
  register(target: IEventTarget): IEventManagerNode {
    if (this._nodes.has(target)) throw new Error("Target already registered");

    const node = new EventManagerNode(target, this._bush);
    this._nodes.set(target, node);

    return node;
  }

  /**
   * Removes an event target from the event manager.
   * @param target - The event target to remove.
   */
  remove(target: IEventTarget) {
    const current = this._nodes.get(target);
    if (current == null) throw new Error("Target isn't in the event manager");

    current.destroy();
  }

  /**
   * Performs a hit test at the given coordinates, returning active nodes and groups.
   * @param x - The x coordinate.
   * @param y - The y coordinate.
   * @returns An object with activeNodes and activeGroups.
   */
  private _performHitTest(x: number, y: number) {
    const qualifyingElements = this._bush.search({
      minX: x,
      minY: y,
      maxX: x,
      maxY: y,
    });

    const sortedElements = qualifyingElements
      .sort((a, b) => b.target.getEventZOrder() - a.target.getEventZOrder())
      .filter((node) => node.target.hits(x, y));

    const groups = new Map<unknown, EventManagerNode>();
    const groupElements: EventManagerNode[] = [];

    sortedElements.forEach((node) => {
      const group = node.target.getGroup();
      if (group != null && groups.has(group)) return;

      groupElements.push(node);

      if (group != null) {
        groups.set(group, node);
      }
    });

    return {
      activeNodes: groupElements,
      activeGroups: groups,
    };
  }
}

class Propagation {
  private _skip = new Set<EventGroupIdentifier>();
  private _allow = new Set<EventGroupIdentifier>();
  private _stopped = false;

  constructor(
    private event: ShroomInteractionEvent,
    private path: EventManagerNode[],
    private _trigger: (target: IEventTarget, event: IEventManagerEvent) => void
  ) {
    this._propagate();
  }

  private _propagate() {
    const event = this._createEvent();
    for (let i = 0; i < this.path.length; i++) {
      if (this._stopped) return;
      const node = this.path[i];
      const eventGroupIdentifier = node.target
        .getGroup()
        .getEventGroupIdentifier();

      if (
        this._skip.has(eventGroupIdentifier) &&
        !this._allow.has(eventGroupIdentifier)
      ) {
        continue;
      }

      if (this._allow.size > 0 && !this._allow.has(eventGroupIdentifier)) {
        continue;
      }

      this._trigger(this.path[i].target, event);
    }
  }

  private _createEvent(): IEventManagerEvent {
    return {
      interactionEvent: this.event,
      mouseEvent: this.event.data.originalEvent,
      stopPropagation: () => {
        this._stopped = true;
      },
      skip: (...identifiers) => {
        const add = (identifier: EventGroupIdentifierParam) => {
          if (Array.isArray(identifier)) {
            identifier.forEach((value) => add(value));
          } else {
            this._skip.add(identifier);
          }
        };

        add(identifiers);
      },
      skipExcept: (...identifiers) => {
        const add = (identifier: EventGroupIdentifierParam) => {
          if (Array.isArray(identifier)) {
            identifier.forEach((value) => add(value));
          } else {
            this._allow.add(identifier);
          }
        };

        add(identifiers);
      },
    };
  }
}

export const NOOP_EVENT_MANAGER: IEventManager = {
  register: (): IEventManagerNode => {
    return {
      destroy: () => {
        // Do nothing
      },
    };
  },
  remove: () => {
    // Do nothing
  },
};
