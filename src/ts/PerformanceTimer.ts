export default class PerformanceTimer {

   protected _start: number = 0;
   protected _total: number = 0;
   protected _count: number = 0;
   protected _mean: number = 0;
   protected _min: number = 0;
   protected _max: number = 0;
   protected _name: string = '';

   public constructor(name: string) {
      this._name = name;
   }

   public start(): void {
      this._start = performance.now();
   }

   public pause(): void {
      const duration = performance.now() - this._start;

      this._count += 1;
      this._total += duration;
      this._mean = this._mean + (duration - this._mean) / this._count;
      this._min = Math.min(this._min, duration);
      this._max = Math.max(this._max, duration);

      this._start = 0;
   }

   public logStats(): void {
      // eslint-disable-next-line no-console
      console.table({
         name: this._name,
         total: `${this._total}ms`,
         count: this._count,
         mean: `${this._mean}ms`,
         min: `${this._min}ms`,
         max: `${this._max}ms`,
      });
   }

}
