import { ResolutionSystem } from "../utils/ResolutionSystem";
import { MouseSystem } from "../utils/MouseSystem";
import { TimeStep } from "../utils/TimeStep";
import { Uniforms } from "../utils/Uniforms";
import { CircleInstance } from "./CircleInstance";
import { Particles } from "./Particles";

export function createAssets(
  device: GPUDevice,
  format: GPUTextureFormat,
  canvas: HTMLCanvasElement
) {
  const timeStep = new TimeStep(device);
  const uniforms = new Uniforms(device);
  const resolutionSystem = new ResolutionSystem(device);
  const mouseSystem = new MouseSystem(device, canvas);

  const circleInstance = new CircleInstance(device);
  const particles = new Particles(
    device,
    circleInstance,
    resolutionSystem,
    3000,
    3,
    format
  );

  return {
    resolutionSystem,
    mouseSystem,
    timeStep,
    uniforms,
    circleInstance,
    particles,
  };
}
