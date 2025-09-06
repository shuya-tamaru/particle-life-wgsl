import type { Simulator } from "../compute/Simulator";
import type { Scene } from "../scene/Scene";
import { debugReadBuffer } from "../utils/debugReadBuffer";
import type { ResolutionSystem } from "../utils/ResolutionSystem";

export class Renderer {
  private device: GPUDevice;
  private context: GPUCanvasContext;

  private scene!: Scene;
  private bgColor!: { r: number; g: number; b: number; a: number };
  private resolutionSystem!: ResolutionSystem;
  private simulator!: Simulator;

  constructor(
    device: GPUDevice,
    context: GPUCanvasContext,
    _canvas: HTMLCanvasElement,
    bgColor: { r: number; g: number; b: number; a: number },
    scene: Scene,
    resolutionSystem: ResolutionSystem,
    simulator: Simulator
  ) {
    this.device = device;
    this.context = context;
    this.scene = scene;
    this.bgColor = bgColor;
    this.resolutionSystem = resolutionSystem;
    this.simulator = simulator;
  }

  async init() {}

  update() {
    // 2Dでは特に更新処理は不要
  }

  onResize(_w: number, _h: number) {
    this.resolutionSystem.resize(_w, _h);
  }

  render() {
    const encoder = this.device.createCommandEncoder();
    this.simulator.compute(encoder);
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: this.context.getCurrentTexture().createView(),
          clearValue: this.bgColor,
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    this.scene.draw(pass);
    pass.end();
    this.device.queue.submit([encoder.finish()]);

    // debug;
    // this.debug(
    //   this.simulator.getInstance().forceAccumulation.getForcesBuffer(),
    //   "float32"
    // );
  }

  debug(buffer: GPUBuffer, type: "uint32" | "float32") {
    this.device.queue
      .onSubmittedWorkDone()
      .then(() => debugReadBuffer(this.device, buffer, buffer.size))
      .then((data) => {
        const dataView = new (type === "uint32" ? Uint32Array : Float32Array)(
          data
        );
        console.log(dataView);
      });
  }
}
