// import Stats from "stats.js";
import { Device } from "../core/Device";
import { Renderer } from "../core/Renderer";
import { attachResize, sizeCanvas } from "./resize";
import { createAssets } from "../gfx/createAssets";
import { Scene } from "../scene/Scene";
import { Gui } from "../utils/Gui";
import { Simulator } from "../compute/Simulator";

export async function bootstrap() {
  const canvas = document.querySelector<HTMLCanvasElement>("#app");
  if (!canvas) {
    showWebGPUError();
    return;
  }

  sizeCanvas(canvas);

  try {
    //setup
    const { device, context, format } = await Device.init(canvas);

    //create assets
    const { resolutionSystem, timeStep, particles, particleUniforms } =
      createAssets(device, format, canvas);

    //compute
    const simulator = new Simulator(
      device,
      particles,
      particleUniforms,
      timeStep,
      resolutionSystem
    );

    //create scene
    const scene = new Scene(particles);

    //gui
    const bgColor = { r: 0.05, g: 0.07, b: 0.1, a: 1.0 };
    new Gui(particleUniforms, simulator.getInstance().computeUniforms, bgColor);

    const renderer = new Renderer(
      device,
      context,
      canvas,
      bgColor,
      scene,
      resolutionSystem,
      simulator
    );
    await renderer.init();

    attachResize(canvas, (w, h) => {
      renderer.onResize(w, h);
    });

    // const stats = new Stats();
    // stats.showPanel(0);
    // document.body.appendChild(stats.dom);
    let last = 0;
    let totalTime = 0;

    const loop = (t: number) => {
      // stats?.begin();
      const dt = t - last;
      last = t;

      totalTime += dt;
      timeStep.set(totalTime);

      // last = t;
      renderer.update();
      renderer.render();

      // stats?.end();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  } catch (error) {
    showWebGPUError();
    return;
  }
}

function showWebGPUError() {
  const errorElement = document.getElementById("webgpu-error");
  const canvas = document.querySelector<HTMLCanvasElement>("#app");

  if (errorElement) {
    errorElement.style.display = "flex";
  }
  if (canvas) {
    canvas.style.display = "none";
  }
}
