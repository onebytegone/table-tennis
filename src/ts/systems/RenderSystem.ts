import { BaseSystem, ComponentMap } from './BaseSystem';
import { Mesh, isCircleMesh, isMesh, isRectangleMesh } from '../components/Mesh';
import { EventBus } from '../event-bus';
import { Position, isPosition } from '../components/Position';

interface ComponentSpec extends ComponentMap {
   position: Position;
   mesh: Mesh;
}

export class RenderSystem extends BaseSystem<ComponentSpec> {

   protected _canvas: HTMLCanvasElement;
   protected _context: CanvasRenderingContext2D;

   public constructor(eventBus: EventBus, canvas: HTMLCanvasElement) {
      const ctx = canvas.getContext('2d');

      if (!ctx) {
         throw new Error('Could not get 2D context from provided canvas');
      }

      super(eventBus);
      this._canvas = canvas;
      this._context = ctx;
   }

   public doesEntityHaveRequiredComponents(components: ComponentMap): boolean {
      return isPosition(components.position)
         && isMesh(components.mesh);
   }

   public update(): void {
      this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
      this._context.fillStyle = 'rgb(200, 100, 0)';

      this._bundles.forEach((components) => {
         if (isRectangleMesh(components.mesh)) {
            this._context.fillRect(
               components.position.x,
               components.position.y,
               components.mesh.size.width,
               components.mesh.size.height
            );
         } else if (isCircleMesh(components.mesh)) {
            this._context.beginPath();
            this._context.arc(
               components.position.x,
               components.position.y,
               components.mesh.radius,
               0,
               Math.PI * 2,
               true
            );
            this._context.fill();
         }
      });
   }

}
