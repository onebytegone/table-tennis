import { isObject, isNumber } from 'util';

export interface Point {
   x: number;
   y: number;
}

export function isPoint(obj: any): obj is Point {
   return isObject(obj)
      && isNumber(obj.x)
      && isNumber(obj.y);
}

export interface Vector {
   x: number;
   y: number;
}

export function isVector(obj: any): obj is Vector {
   return isObject(obj)
      && isNumber(obj.x)
      && isNumber(obj.y);
}

export interface Size {
   width: number;
   height: number;
}

export function isSize(obj: any): obj is Size {
   return isObject(obj)
      && isNumber(obj.width)
      && isNumber(obj.height);
}

export interface Rectangle {
   origin: Point;
   size: Size;
}

export interface Circle {
   origin: Point;
   radius: number;
}

export enum Shape {
   Rectangle = 'rectangle',
   Circle = 'circle',
}

export function isInRange(val: number, start: number, size: number): boolean {
   return start <= val && val <= start + size;
}

export function isPointInRectangle(point: Point, rect: Rectangle): boolean {
   return isInRange(point.x, rect.origin.x, rect.size.width)
      && isInRange(point.y, rect.origin.y, rect.size.height);
}

export function isPointInCircle(point: Point, circle: Circle): boolean {
   return Math.sqrt(Math.pow(point.x - circle.origin.x, 2) + Math.pow(point.y - circle.origin.y, 2)) < circle.radius;
}
