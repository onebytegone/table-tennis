import { BaseSystem } from '../systems/BaseSystem';

export class SystemManager {

   public readonly systems: BaseSystem<any>[];

   public constructor(systems: BaseSystem<any>[]) {
      this.systems = systems;
   }

   public update(delta: number): void {
      this.systems.forEach((system) => {
         system.update(delta);
      });
   }

}
