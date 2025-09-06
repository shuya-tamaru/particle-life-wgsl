import { ResolutionSystem } from "../utils/ResolutionSystem";
import { MouseSystem } from "../utils/MouseSystem";
import { TimeStep } from "../utils/TimeStep";
import { CircleInstance } from "./CircleInstance";
import { Particles } from "./Particles";
import { ParticleUniforms } from "./unofrorms/ParticleUniforms";

export function createAssets(
  device: GPUDevice,
  format: GPUTextureFormat,
  canvas: HTMLCanvasElement
) {
  const timeStep = new TimeStep(device);
  const resolutionSystem = new ResolutionSystem(device);
  const mouseSystem = new MouseSystem(device, canvas);

  const circleInstance = new CircleInstance(device);
  const particleUniforms = new ParticleUniforms(device, 10000);
  const particles = new Particles(
    device,
    circleInstance,
    resolutionSystem,
    timeStep,
    particleUniforms,
    6,
    format
  );

  return {
    resolutionSystem,
    mouseSystem,
    timeStep,
    circleInstance,
    particles,
    particleUniforms,
  };
}
