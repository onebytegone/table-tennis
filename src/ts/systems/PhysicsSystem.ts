import { BaseSystem, ComponentMap } from './BaseSystem';
import { Motion, isMotion } from '../components/Motion';
import { Point, Rectangle } from '../lib/Geometry';
import { BoundingBox, BoundingRectangle, isBoundingRectangle, isBoundingBox } from '../components/BoundingBox';
import { Physics, isPhysics } from '../components/Physics';
import { EventBus } from '../event-bus';
import { Position, isPosition } from '../components/Position';

enum CollisionDirection {
   None = 0,
   North = (1 << 0), // eslint-disable-line no-bitwise
   East = (1 << 1), // eslint-disable-line no-bitwise
   South = (1 << 2), // eslint-disable-line no-bitwise
   West = (1 << 3), // eslint-disable-line no-bitwise
}

interface ComponentSpec extends ComponentMap {
   motion: Motion;
   position: Position;
   bounds: BoundingBox;
   physics: Physics;
}

export class PhysicsSystem extends BaseSystem<ComponentSpec> {

   protected _bounds: Rectangle;

   public constructor(eventBus: EventBus, bounds: Rectangle) {
      super(eventBus);
      this._bounds = bounds;
   }

   public doesEntityHaveRequiredComponents(components: ComponentMap): boolean {
      return isMotion(components.motion)
         && isPosition(components.position)
         && isBoundingBox(components.bounds)
         && isPhysics(components.physics);
   }

   public update(): void {
      // 1. find collisions
      const collisions = this._bundles.reduce((detectedCollisions, partialEntity, id) => {
         const normalizedBoundingBox = this._normalizeBoundingBox(partialEntity);

         if (this._isOffscreen(normalizedBoundingBox)) {
            this._eventBus.emit('entityIsOffscreen', id);
         }

         return this._bundles.reduce((memo, targetPartialEntity, targetID) => {
            if (targetID !== id) { // Don't compare an entity with itself
               const collisionDirection = this._getCollisionDirection(
                  normalizedBoundingBox,
                  this._normalizeBoundingBox(targetPartialEntity)
               );

               if (collisionDirection !== CollisionDirection.None) {
                  memo.push({
                     entityID: id,
                     entity: partialEntity,
                     targetID: targetID,
                     target: targetPartialEntity,
                     direction: collisionDirection,
                  });
               }
            }

            return memo;
         }, detectedCollisions);
      }, [] as { entityID: number; entity: ComponentSpec; targetID: number; target: ComponentSpec; direction: number }[]);

      // 2. resolve collisions
      const collisionEvents = collisions.reduce((memo, collision) => {
         const ids = [ collision.entityID, collision.targetID ].sort();

         if (!collision.entity.physics.isSensor && !collision.target.physics.isSensor) {
            this._resolveCollision(collision.entity, collision.target, collision.direction);
         }

         memo[ids.join(':')] = ids;
         return memo;
      }, {} as { [index: string]: number[] });

      Object.keys(collisionEvents).forEach((key) => {
         this._eventBus.emit('collision', collisionEvents[key]);
      });
   }

   protected _getCollisionDirection(entity: BoundingBox, target: BoundingBox): number {
      if (isBoundingRectangle(entity) && isBoundingRectangle(target)) {
         return this._getRectangleRectangleCollisionDirection(entity, target);
      }

      throw new Error(`unsupported collision test between objects ${entity}, ${target}`);
   }

   protected _isOffscreen(obj: BoundingBox): boolean {
      if (isBoundingRectangle(obj)) {
         return obj.origin.x + obj.size.width < this._bounds.origin.x
            || obj.origin.x > this._bounds.origin.x + this._bounds.size.width
            || obj.origin.y + obj.size.height < this._bounds.origin.y
            || obj.origin.y > this._bounds.origin.y + this._bounds.size.height;
      }

      throw new Error(`unsupported OOB collision test for object ${obj}`);
   }

   protected _testRectangleRectangleCollision(obj1: BoundingRectangle, obj2: BoundingRectangle): boolean {
      return this._calculateCollisionForAxis(obj1.origin.x, obj1.size.width, obj2.origin.x, obj2.size.width)
         && this._calculateCollisionForAxis(obj1.origin.y, obj1.size.height, obj2.origin.y, obj2.size.height);
   }

   protected _calculateCollisionForAxis(obj1Position: number, obj1Size: number, obj2Position: number, obj2Size: number): boolean {
      return obj1Position <= obj2Position + obj2Size && obj1Position + obj1Size >= obj2Position;
   }

   protected _normalizeBoundingBox(obj: { position: Point; bounds: BoundingBox }): BoundingBox {
      return Object.assign({}, obj.bounds, {
         origin: {
            x: obj.position.x + obj.bounds.origin.x,
            y: obj.position.y + obj.bounds.origin.y,
         },
      });
   }

   protected _getRectangleRectangleCollisionDirection(entity: BoundingRectangle, target: BoundingRectangle): number {
      if (!this._testRectangleRectangleCollision(entity, target)) {
         return 0;
      }

      const entityCenter = { x: entity.origin.x + entity.size.width / 2, y: entity.origin.y + entity.size.height / 2 },
            targetCenter = { x: target.origin.x + target.size.width / 2, y: target.origin.y + target.size.height / 2 },
            targetIsEastOfEntity = entityCenter.x < targetCenter.x,
            targetIsSouthOfEntity = entityCenter.y < targetCenter.y;

      const absOverlapX = targetIsEastOfEntity ? (entity.origin.x + entity.size.width - target.origin.x)
         : (target.origin.x + target.size.width - entity.origin.x);

      const absOverlapY = targetIsSouthOfEntity ? (entity.origin.y + entity.size.height - target.origin.y)
         : (target.origin.y + target.size.height - entity.origin.y);

      const overlayRatio = absOverlapX / absOverlapY;

      if (overlayRatio > 1) { // More of x-axises are "touching", north/south collision
         return targetIsSouthOfEntity ? CollisionDirection.South : CollisionDirection.North;
      }

      if (overlayRatio < 1) { // More of y-axises are "touching", east/west collision
         return targetIsEastOfEntity ? CollisionDirection.East : CollisionDirection.West;
      }

      // The same for x/y, diagonal collision
      // eslint-disable-next-line no-bitwise
      return (targetIsEastOfEntity ? CollisionDirection.East : CollisionDirection.West)
         | (targetIsSouthOfEntity ? CollisionDirection.South : CollisionDirection.North);
   }

   protected _resolveCollision(entity: ComponentSpec, target: ComponentSpec, collisionDirection: number): void {
      if (!isBoundingRectangle(entity.bounds) || !isBoundingRectangle(target.bounds)) {
         throw new Error('cannot resolve collisions with non-rectangle bounding boxes');
      }

      // eslint-disable-next-line no-bitwise
      if (collisionDirection & CollisionDirection.North && entity.motion.velocity.y < 0) { // is moving north
         entity.position.y = target.position.y + target.bounds.origin.y + target.bounds.size.height - entity.bounds.origin.y;
         entity.motion.velocity.y *= -1 * entity.physics.bounciness;
      }

      // eslint-disable-next-line no-bitwise
      if (collisionDirection & CollisionDirection.South && entity.motion.velocity.y > 0) { // is moving south
         entity.position.y = target.position.y + target.bounds.origin.y - entity.bounds.size.height - entity.bounds.origin.y;
         entity.motion.velocity.y *= -1 * entity.physics.bounciness;
      }

      // eslint-disable-next-line no-bitwise
      if (collisionDirection & CollisionDirection.West && entity.motion.velocity.x < 0) { // is moving west
         entity.position.x = target.position.x + target.bounds.origin.x + target.bounds.size.width - entity.bounds.origin.x;
         entity.motion.velocity.x *= -1 * entity.physics.bounciness;
      }

      // eslint-disable-next-line no-bitwise
      if (collisionDirection & CollisionDirection.East && entity.motion.velocity.x > 0) { // is moving east
         entity.position.x = target.position.x + target.bounds.origin.x - entity.bounds.size.width - entity.bounds.origin.x;
         entity.motion.velocity.x *= -1 * entity.physics.bounciness;
      }
   }

}
