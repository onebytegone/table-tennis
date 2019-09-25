import { Point, Size } from './lib/Geometry';
import InputManager from './lib/InputManager';
import { SystemManager } from './lib/SystemManager';
import { MotionInputSystem } from './systems/MotionInputSystem';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { RenderSystem } from './systems/RenderSystem';
import { DebugRenderSystem } from './systems/DebugRenderSystem';
import eventBus from './event-bus';
import { OffscreenResetSystem } from './systems/OffscreenResetSystem';
import { EntityManager } from './lib/EntityManager';
import { MotionSystem } from './systems/MotionSystem';
import { Motion } from './components/Motion';
import { Physics } from './components/Physics';
import { Mesh } from './components/Mesh';
import { BoundingBox } from './components/BoundingBox';
import { Position } from './components/Position';
import { PlayerInput } from './components/PlayerInput';
import { ComponentMap } from './systems/BaseSystem';

export default class GameManager {

   protected _entityManager: EntityManager;
   protected _systemManager: SystemManager;

   protected _nextTickID: number | undefined;

   public constructor(canvas: HTMLCanvasElement) {
      const bounds = {
         origin: { x: 0, y: 0 },
         size: { width: canvas.width, height: canvas.height },
      };

      this._systemManager = new SystemManager([
         new MotionInputSystem(eventBus, new InputManager()),
         new MotionSystem(eventBus),
         new PhysicsSystem(eventBus, bounds),
         new RenderSystem(eventBus, canvas),
         new DebugRenderSystem(eventBus, canvas),
         new OffscreenResetSystem(eventBus),
      ]);
      this._entityManager = new EntityManager(this._systemManager);

      const paddleSize = {
         width: Math.round(canvas.width / 64),
         height: Math.round(canvas.height / 8),
      };

      this._createPaddle({
         x: canvas.width / 64,
         y: canvas.height / 2 - paddleSize.height / 2,
      }, paddleSize, canvas.height);
      this._createPaddle({
         x: canvas.width - paddleSize.width - canvas.width / 64,
         y: canvas.height / 2 - paddleSize.height / 2,
      }, paddleSize, canvas.height / 2);
      this._createBall({
         x: canvas.width / 2,
         y: canvas.height / 2,
      }, Math.round(canvas.height / 72), canvas.width / 4);
      this._createWalls({ width: canvas.width, height: canvas.height });
   }

   public startGame(): void {
      let lastTick = performance.now();

      const tick = (now: number): void => {
         const delta = (now - lastTick) / 1000;

         lastTick = now;
         this._systemManager.update(delta);
         this._nextTickID = window.requestAnimationFrame(tick);
      };

      tick(performance.now());
   }

   public stopGame(): void {
      if (this._nextTickID !== undefined) {
         window.cancelAnimationFrame(this._nextTickID);
      }
   }

   protected _createPaddle(position: Point, size: Size, speed: number): void {
      interface Paddle extends ComponentMap {
         motion: Motion;
         physics: Physics;
         mesh: Mesh;
         bounds: BoundingBox;
         position: Position;
         input: PlayerInput;
      }

      const paddle: Paddle = {
         motion: { velocity: { x: 0, y: 0 } },
         physics: { isSensor: false, bounciness: 0 },
         mesh: { size: Object.assign({}, size), origin: { x: 0, y: 0 } },
         bounds: {
            origin: { x: 0, y: 0 },
            size: Object.assign({}, size),
         },
         input: {
            speed: speed,
         },
         position: Object.assign({}, position),
      };

      this._entityManager.createEntity(paddle);
   }

   protected _createBall(position: Point, radius: number, speed: number): void {
      interface Ball extends ComponentMap {
         motion: Motion;
         physics: Physics;
         mesh: Mesh;
         bounds: BoundingBox;
         position: Position;
         resetLocation: Position;
      }

      const ball: Ball = {
         motion: { velocity: { x: speed, y: speed } },
         physics: { isSensor: false, bounciness: 1 },
         mesh: { radius: radius, origin: { x: 0, y: 0 } },
         bounds: {
            origin: { x: -radius, y: -radius },
            size: { width: radius * 2, height: radius * 2 },
         },
         position: Object.assign({}, position),
         resetLocation: Object.assign({}, position),
      };

      this._entityManager.createEntity(ball);
   }

   protected _createWalls(size: Size): void {
      const wallThickness = 10;

      interface Wall extends ComponentMap {
         // TODO: `motion` is needed for PhysicsSystem, but this is a static object. Is
         // there a better way to handle walls?
         motion: Motion;
         physics: Physics;
         bounds: BoundingBox;
         position: Position;
      }

      const north: Wall = {
         motion: { velocity: { x: 0, y: 0 } },
         physics: { isSensor: false, bounciness: 0 },
         bounds: {
            origin: { x: 0, y: 0 },
            size: { width: size.width, height: wallThickness },
         },
         position: {
            x: 0,
            y: -wallThickness,
         },
      };

      const south: Wall = {
         motion: { velocity: { x: 0, y: 0 } },
         physics: { isSensor: false, bounciness: 0 },
         bounds: {
            origin: { x: 0, y: 0 },
            size: { width: size.width, height: wallThickness },
         },
         position: {
            x: 0,
            y: size.height,
         },
      };

      this._entityManager.createEntity(north);
      this._entityManager.createEntity(south);
   }

}
