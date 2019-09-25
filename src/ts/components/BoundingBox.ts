import { Point, Size, isSize, isPoint } from '../lib/Geometry';
import { isObject, isNumber } from 'util';
import { Component } from './Component';

export interface BoundingRectangle extends Component{
   size: Size;
   origin: Point;
}

export function isBoundingRectangle(obj: any): obj is BoundingRectangle {
   return isObject(obj)
      && isSize(obj.size)
      && isPoint(obj.origin);
}

export interface BoundingCircle extends Component{
   radius: number;
   origin: Point;
}

export function isBoundingCircle(obj: any): obj is BoundingCircle {
   return isObject(obj)
      && isNumber(obj.radius)
      && isPoint(obj.origin);
}

export type BoundingBox = BoundingRectangle | BoundingCircle;

export function isBoundingBox(obj: any): obj is BoundingBox {
   return isBoundingCircle(obj) || isBoundingRectangle(obj);
}
