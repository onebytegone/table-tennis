import { Vector, isVector } from '../lib/Geometry';
import { isObject } from 'util';
import { Component } from './Component';

export interface Motion extends Component{
   velocity: Vector;
}

export function isMotion(obj: any): obj is Motion {
   return isObject(obj)
      && isVector(obj.velocity);
}
