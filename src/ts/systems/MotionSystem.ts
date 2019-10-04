import { BaseSystem, ComponentMap } from './BaseSystem';
import { Motion, isMotion } from '../components/Motion';
import { Position, isPosition } from '../components/Position';

interface ComponentSpec extends ComponentMap{
   position: Position;
   motion: Motion;
}

export class MotionSystem extends BaseSystem<ComponentSpec> {

   public doesEntityHaveRequiredComponents(components: ComponentMap): boolean {
      return isPosition(components.position)
         && isMotion(components.motion);
   }

   public update(delta: number): void {
      this._bundles.forEach((partialEntity) => {
         partialEntity.position.x += partialEntity.motion.velocity.x * delta;
         partialEntity.position.y += partialEntity.motion.velocity.y * delta;
      });
   }

}
