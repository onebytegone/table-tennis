import { BaseSystem, ComponentMap } from './BaseSystem';
import { EventBus } from '../event-bus';
import { Position, isPosition } from '../components/Position';

interface ComponentSpec extends ComponentMap {
   position: Position;
   resetLocation: Position;
}

export class OffscreenResetSystem extends BaseSystem<ComponentSpec> {

   public constructor(eventBus: EventBus) {
      super(eventBus);

      eventBus.on('entityIsOffscreen', (entityID): void => {
         if (this._bundles[entityID]) {
            this._bundles[entityID].position.x = this._bundles[entityID].resetLocation.x;
            this._bundles[entityID].position.y = this._bundles[entityID].resetLocation.y;
         }
      });
   }

   public doesEntityHaveRequiredComponents(components: ComponentMap): boolean {
      return isPosition(components.position)
         && isPosition(components.resetLocation);
   }

   public update(): void {
      // noop
   }

}
