export interface PlayerInput {
   up: boolean;
   down: boolean;
}

enum KeyCode {
   Up = 38,
   Down = 40,
   KeyW = 87,
   KeyS = 83,
}

export default class InputManager {

   protected _keysHandled = [ KeyCode.Up, KeyCode.Down, KeyCode.KeyW, KeyCode.KeyS ];
   protected _keysPressed: { [key in KeyCode]?: boolean } = {};

   // TODO: supply a key map
   public constructor() {
      document.addEventListener('keydown', this._onKeyPress.bind(this), false);
      document.addEventListener('keyup', this._onKeyPress.bind(this), false);
   }

   public getPlayerInput(): { [id: number]: PlayerInput } {
      return {
         1: {
            up: !!this._keysPressed[KeyCode.Up],
            down: !!this._keysPressed[KeyCode.Down],
         },
         2: {
            up: !!this._keysPressed[KeyCode.KeyW],
            down: !!this._keysPressed[KeyCode.KeyS],
         },
      };
   }

   protected _onKeyPress(event: KeyboardEvent): void {
      if (this._keysHandled.includes(event.keyCode)) {
         event.preventDefault();
         // TODO: clean up type checking here
         this._keysPressed[event.keyCode as KeyCode] = (event.type === 'keydown');
      }
   }

}
