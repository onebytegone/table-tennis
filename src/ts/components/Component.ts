import { isObject } from 'util';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Component {}

export function isComponent(obj: any): obj is Component {
   return isObject(obj);
}
