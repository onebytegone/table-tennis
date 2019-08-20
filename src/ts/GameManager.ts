import InputManager, { PlayerInput } from './InputManager';
import FrameRateTracker from './FrameRateTracker';
import PerformanceTimer from './PerformanceTimer';


interface GameState {
   player1: {
      pixelsPerSecond: number;
      origin: Point;
   };
   player2: {
      pixelsPerSecond: number;
      origin: Point;
   };
   ball: {
      origin: Point;
      velocity: Velocity;
   };
}

interface Point {
   x: number;
   y: number;
}

interface Velocity {
   x: number;
   y: number;
}

interface Size {
   width: number;
   height: number;
}

enum EntityShape {
   Rectangle = 'rectangle',
   Circle = 'circle',
}

interface RenderState {
   entities: ({
      shape: EntityShape.Rectangle;
      origin: Point;
      width: number;
      height: number;
   } | {
      shape: EntityShape.Circle;
      origin: Point;
      radius: number;
   })[];
   debug?: {
      fps?: number;
      delta?: number;
   };
}

export default class GameManager {

   protected _canvas: HTMLCanvasElement;
   protected _context: CanvasRenderingContext2D;

   protected _frameSize: Size;
   protected _paddleSize: Size;
   protected _ballRadius: number;
   protected _nextTickID: number | undefined;
   protected _inputManager = new InputManager();
   protected _frameRateTracker = new FrameRateTracker();
   protected _gameState: GameState;

   public constructor(canvas: HTMLCanvasElement) {
      this._canvas = canvas;

      const ctx = this._canvas.getContext('2d');

      if (!ctx) {
         throw new Error('Could not get 2D context from provided canvas');
      }

      this._context = ctx;
      this._frameSize = {
         width: this._canvas.width,
         height: this._canvas.height,
      };
      this._inputManager.setup();

      this._ballRadius = Math.round(this._frameSize.height / 72);
      this._paddleSize = {
         width: Math.round(this._frameSize.width / 64),
         height: Math.round(this._frameSize.height / 8),
      };
      this._gameState = {
         player1: {
            pixelsPerSecond: this._frameSize.height,
            origin: {
               x: Math.round(this._frameSize.width / 64),
               y: Math.round(this._frameSize.height / 2) - this._paddleSize.height / 2,
            },
         },
         player2: {
            pixelsPerSecond: this._frameSize.height / 2,
            origin: {
               x: this._frameSize.width - Math.round(this._frameSize.width / 64) - this._paddleSize.width,
               y: Math.round(this._frameSize.height / 2) - this._paddleSize.height / 2,
            },
         },
         ball: {
            origin: {
               x: Math.round(this._frameSize.width / 2),
               y: Math.round(this._frameSize.height / 2),
            },
            velocity: {
               x: this._frameSize.width / 4,
               y: this._frameSize.width / 4,
            },
         },
      };
   }

   public startGame(): void {
      let lastTick = performance.now(),
          ticks = 0,
          inputTimer = new PerformanceTimer('input'),
          updateTimer = new PerformanceTimer('update'),
          renderTimer = new PerformanceTimer('render');

      const tick = (now: number): void => {
         const delta = (now - lastTick) / 1000;

         ticks += 1;
         lastTick = now;
         this._frameRateTracker.tick(now);

         inputTimer.start();
         const input = this._inputManager.getPlayerInput();

         inputTimer.pause();

         updateTimer.start();
         this._gameState.player1.origin = this._movePlayer(
            this._gameState.player1.origin,
            input.player1,
            this._gameState.player1.pixelsPerSecond,
            delta
         );
         this._gameState.player2.origin = this._movePlayer(
            this._gameState.player2.origin,
            input.player2,
            this._gameState.player2.pixelsPerSecond,
            delta
         );
         this._gameState.ball = this._moveBall(this._gameState.ball.origin, this._gameState.ball.velocity, delta);
         updateTimer.pause();

         renderTimer.start();
         this._render({
            entities: [
               {
                  shape: EntityShape.Rectangle,
                  origin: this._gameState.player1.origin,
                  width: this._paddleSize.width,
                  height: this._paddleSize.height,
               },
               {
                  shape: EntityShape.Rectangle,
                  origin: this._gameState.player2.origin,
                  width: this._paddleSize.width,
                  height: this._paddleSize.height,
               },
               {
                  shape: EntityShape.Circle,
                  origin: this._gameState.ball.origin,
                  radius: this._ballRadius,
               },
            ],
            debug: {
               fps: this._frameRateTracker.getFPS(),
               delta: delta,
            },
         });
         renderTimer.pause();

         if (ticks % 1800 === 0) {
            inputTimer.logStats();
            updateTimer.logStats();
            renderTimer.logStats();
         }

         this._nextTickID = window.requestAnimationFrame(tick);
      };

      tick(performance.now());
   }

   public stopGame(): void {
      if (this._nextTickID !== undefined) {
         window.cancelAnimationFrame(this._nextTickID);
      }
   }

   protected _movePlayer(currentPosition: Point, input: PlayerInput, pixelsPerSecond: number, timeDelta: number): Point {
      let velocity = 0;

      if (input.up && !input.down) {
         velocity = -pixelsPerSecond;
      } else if (!input.up && input.down) {
         velocity = pixelsPerSecond;
      }

      return {
         x: currentPosition.x,
         y: Math.min(Math.max(currentPosition.y + (velocity * timeDelta), 0), this._frameSize.height - this._paddleSize.height),
      };
   }

   protected _moveBall(currentPosition: Point, velocity: Velocity, timeDelta: number): { origin: Point; velocity: Velocity } {
      let newPosition: Point;

      newPosition = {
         x: currentPosition.x + (velocity.x * timeDelta),
         y: currentPosition.y + (velocity.y * timeDelta),
      };

      if (newPosition.x < this._ballRadius) {
         velocity.x = velocity.x * -1;
         newPosition.x = 1 + (velocity.x * timeDelta);
      } else if (newPosition.x > this._frameSize.width - this._ballRadius) {
         velocity.x = velocity.x * -1;
         newPosition.x = this._frameSize.width - this._ballRadius + (velocity.x * timeDelta);
      }

      if (newPosition.y < this._ballRadius) {
         velocity.y = velocity.y * -1;
         newPosition.y = this._ballRadius + (velocity.y * timeDelta);
      } else if (newPosition.y > this._frameSize.height - this._ballRadius) {
         velocity.y = velocity.y * -1;
         newPosition.y = this._frameSize.height - this._ballRadius + (velocity.y * timeDelta);
      }

      return {
         origin: newPosition,
         velocity: velocity,
      };
   }

   protected _render(state: RenderState): void {
      this._context.clearRect(0, 0, this._frameSize.width, this._frameSize.height);
      this._context.fillStyle = 'rgb(200, 100, 0)';

      state.entities.forEach((entity) => {
         if (entity.shape === EntityShape.Rectangle) {
            this._context.fillRect(
               entity.origin.x,
               entity.origin.y,
               entity.width,
               entity.height
            );
         } else if (entity.shape === EntityShape.Circle) {
            this._context.beginPath();
            this._context.arc(
               entity.origin.x,
               entity.origin.y,
               entity.radius,
               0,
               Math.PI * 2,
               true
            );
            this._context.fill();
         }
      });

      if (state.debug) {
         this._context.fillText(`FPS: ${state.debug.fps || 'n/a'}`, 30, 30);
         this._context.fillText(`Δ: ${Number(state.debug.delta).toPrecision(3) || 'n/a'}`, 30, 40);
      }
   }

}
