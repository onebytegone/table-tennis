import FrameRateTracker from '../util/FrameRateTracker';
import { BaseSystem } from './BaseSystem';
import { EventBus } from '../event-bus';

export class DebugRenderSystem extends BaseSystem<never> {

   protected _canvas: HTMLCanvasElement;
   protected _context: CanvasRenderingContext2D;
   protected _frameRateTracker = new FrameRateTracker();
   protected _fontSize: number;

   public constructor(eventBus: EventBus, canvas: HTMLCanvasElement) {
      super(eventBus);

      const ctx = canvas.getContext('2d');

      if (!ctx) {
         throw new Error('Could not get 2D context from provided canvas');
      }

      this._canvas = canvas;
      this._context = ctx;
      this._fontSize = canvas.height / 20;
   }

   public doesEntityHaveRequiredComponents(): boolean {
      return false;
   }

   public update(delta: number): void {
      this._frameRateTracker.tick(performance.now());

      this._context.font = `${this._fontSize}px Arial`;
      this._context.fillText(`FPS: ${this._frameRateTracker.getFPS() || 'n/a'}`, 30, this._fontSize);
      this._context.fillText(`Δ: ${Number(delta * 1000).toPrecision(4)}`, 30, this._fontSize * 2 + this._fontSize * 0.1);
   }

}
