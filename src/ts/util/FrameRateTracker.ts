export default class FrameRateTracker {

   protected _frames: number[] = [];

   public tick(now: number): void {
      while (this._frames.length > 0 && this._frames[0] <= now - 1000) {
         this._frames.shift();
      }
      this._frames.push(now);
   }

   public getFPS(): number {
      return this._frames.length;
   }

}
