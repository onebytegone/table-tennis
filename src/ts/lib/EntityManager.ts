import { SystemManager } from './SystemManager';
import { ComponentMap } from '../systems/BaseSystem';

export class EntityManager {

   protected _entities: { [id: number]: ComponentMap } = [];

   public constructor(private _systemManager: SystemManager) {}

   public createEntity(components: ComponentMap): number {
      const id = Object.keys(this._entities).length + 1;

      this.addEntity(id, components);
      return id;
   }

   public addEntity(id: number, components: ComponentMap): void {
      if (this._entities[id]) {
         throw new Error(`Entity with ID ${id} already exists`);
      }

      this._entities[id] = components;
      this._systemManager.systems.forEach((system) => {
         system.addEntity(id, components);
      });
   }

}
