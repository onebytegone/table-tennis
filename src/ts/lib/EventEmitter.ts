export class EventEmitter<T> {

   private _listeners: { [event: string]: ((payload: any) => void)[] } = {};

   public on<K extends keyof T & string>(event: K, listener: (payload: T[K]) => void): this {
      if (!this._listeners[event]) {
         this._listeners[event] = [];
      }

      this._listeners[event].push(listener);
      return this;
   }

   public emit<K extends keyof T & string>(event: K, payload: T[K]): void {
      if (!this._listeners[event]) {
         return;
      }

      this._listeners[event].forEach((listener) => {
         listener(payload);
      });
   }

}
