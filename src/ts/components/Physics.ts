import { isBoolean, isObject, isNumber } from 'util';
import { Component } from './Component';

export interface Physics extends Component {
   isSensor: boolean;
   bounciness: number;
}

export function isPhysics(obj: any): obj is Physics {
   return isObject(obj)
      && isBoolean(obj.isSensor)
      && isNumber(obj.bounciness);
}
