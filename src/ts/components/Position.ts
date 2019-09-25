import { isObject } from 'util';
import { Component } from './Component';

export interface Position extends Component {
   x: number;
   y: number;
}

export function isPosition(obj: any): obj is Position {
   return isObject(obj);
}
