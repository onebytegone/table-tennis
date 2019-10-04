import { EventBus } from '../event-bus';
import { Component } from '../components/Component';

export interface ComponentMap {
   [name: string]: Component;
}

export abstract class BaseSystem<T extends ComponentMap> {

   protected _eventBus: EventBus;
   protected _bundles: T[] = [];

   public constructor(eventBus: EventBus) {
      this._eventBus = eventBus;
   }

   public addEntity(id: number, components: T): void {
      if (!this.doesEntityHaveRequiredComponents(components)) {
         return;
      }

      this._bundles[id] = components;
   }

   public abstract doesEntityHaveRequiredComponents(components: ComponentMap): boolean;

   public abstract update(delta: number): void;

}
