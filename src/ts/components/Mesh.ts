import { Size, Point, isSize, isPoint } from '../lib/Geometry';
import { isObject, isNumber } from 'util';
import { Component } from './Component';

export interface RectangleMesh extends Component {
   size: Size;
   origin: Point;
}

export function isRectangleMesh(obj: any): obj is RectangleMesh {
   return isObject(obj)
      && isSize(obj.size)
      && isPoint(obj.origin);
}

export interface CircleMesh extends Component{
   radius: number;
   origin: Point;
}

export function isCircleMesh(obj: any): obj is CircleMesh {
   return isObject(obj)
      && isNumber(obj.radius)
      && isPoint(obj.origin);
}

export type Mesh = RectangleMesh | CircleMesh;

export function isMesh(obj: any): obj is Mesh {
   return isRectangleMesh(obj) || isCircleMesh(obj);
}
