import GameManager from './GameManager';

document.body.onload = function() {
   const fullscreenBtn = document.getElementById('fullscreenBtn'),
         canvas = document.getElementById('canvas');

   if (!canvas) {
      throw new Error('Could not get canvas');
   }

   if (fullscreenBtn) {
      fullscreenBtn.onclick = () => {
         canvas.requestFullscreen();
      };
   }

   const gameManager = new GameManager(canvas as HTMLCanvasElement);

   gameManager.startGame();
};
