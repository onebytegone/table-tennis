import Example from './Example';

const example = new Example();

console.log(example.doSomething());

document.body.onload = function() {
   const canvas = document.getElementById('canvas') as HTMLCanvasElement;

   if (canvas) {
      const ctx = canvas.getContext('2d');

      if (ctx) {
         ctx.fillStyle = 'rgb(200, 100, 0)';
         ctx.fillRect(0, 0, 640, 360);
         ctx.fillStyle = 'rgb(200, 0, 0)';
         ctx.fillRect(10, 10, 50, 50);
         ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
         ctx.fillRect(30, 30, 50, 50);
      }
   }
};

const fullscreenBtn = document.getElementById('fullscreenBtn');

if (fullscreenBtn) {
   fullscreenBtn.onclick = function() {
      const canvas = document.getElementById('canvas');

      if (canvas) {
         canvas.requestFullscreen();
      }
   };
}

function tick() {
   const gamepads = navigator.getGamepads(),
         gamepadLabel = document.getElementById('gamepadLabel');

   if (gamepads.length && gamepadLabel) {
      const gamepad = gamepads[0];

      if (gamepad) {
         gamepadLabel.innerText = gamepad.id;
      }
   }

   window.requestAnimationFrame(() => tick());
 }
 tick();
