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

   public setup(): void {
      document.addEventListener('keydown', this._onKeyPress.bind(this), false);
      document.addEventListener('keyup', this._onKeyPress.bind(this), false);
   }

   public getPlayerInput(): { player1: PlayerInput; player2: PlayerInput } {
      return {
         player1: {
            up: !!this._keysPressed[KeyCode.Up],
            down: !!this._keysPressed[KeyCode.Down],
         },
         player2: {
            up: !!this._keysPressed[KeyCode.KeyW],
            down: !!this._keysPressed[KeyCode.KeyS],
         },
      };
   }

   // protected _getUserInput(): {} {
   //    const gamepads = navigator.getGamepads(),
   //    gamepadLabel = document.getElementById('gamepadLabel');

   //    if (gamepads.length && gamepadLabel) {
   //       const gamepad = gamepads[0];

   //       if (gamepad) {
   //          gamepadLabel.innerText = gamepad.id;
   //       }
   //    }

   //    document.addEventListener('keydown', keyDownHandler, false);
   //    document.addEventListener('keyup', keyUpHandler, false);

   //    return {};
   // }

   protected _onKeyPress(event: KeyboardEvent): void {
      if (this._keysHandled.includes(event.keyCode)) {
         event.preventDefault();
         // TODO: clean up type checking here
         this._keysPressed[event.keyCode as KeyCode] = (event.type === 'keydown');
      }
   }

}
