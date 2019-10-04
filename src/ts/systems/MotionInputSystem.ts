import { BaseSystem, ComponentMap } from './BaseSystem';
import { Motion, isMotion } from '../components/Motion';
import InputManager from '../lib/InputManager';
import { EventBus } from '../event-bus';
import { PlayerInput, isPlayerInput } from '../components/PlayerInput';

interface ComponentSpec extends ComponentMap {
   motion: Motion;
   input: PlayerInput;
}

export class MotionInputSystem extends BaseSystem<ComponentSpec> {

   protected _inputManager: InputManager;

   public constructor(eventBus: EventBus, inputManager: InputManager) {
      super(eventBus);
      this._inputManager = inputManager;
   }

   public doesEntityHaveRequiredComponents(components: ComponentMap): boolean {
      return isMotion(components.motion)
         && isPlayerInput(components.input);
   }

   public update(): void {
      const playerInput = this._inputManager.getPlayerInput();

      this._bundles.forEach((components, id) => {
         if (!playerInput[id]) {
            return;
         }

         if (playerInput[id].up && !playerInput[id].down) {
            components.motion.velocity.y = -components.input.speed;
         } else if (!playerInput[id].up && playerInput[id].down) {
            components.motion.velocity.y = components.input.speed;
         } else {
            components.motion.velocity.y = 0;
         }
      });
   }

}
