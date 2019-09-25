import { isObject, isNumber } from 'util';
import { Component } from './Component';

export interface PlayerInput extends Component {
   speed: number;
}

export function isPlayerInput(obj: any): obj is PlayerInput {
   return isObject(obj)
      && isNumber(obj.speed);
}
