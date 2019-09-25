import { EventEmitter } from './lib/EventEmitter';

export interface GameEvents {
   collision: number[];
   entityIsOffscreen: number;
   pause: void;
}

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type EventBus = EventEmitter<GameEvents>;

export default new EventEmitter<GameEvents>();
