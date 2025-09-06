import { Particles } from "../gfx/Particles";
import { TimeStep } from "../utils/TimeStep";
import { ForceAccumulation } from "./ForceAccumulation";

export class Simulator {
  private device!: GPUDevice;
  private particles!: Particles;
  private timeStep!: TimeStep;
  private forceAccumulation!: ForceAccumulation;

  constructor(device: GPUDevice, particles: Particles, timeStep: TimeStep) {
    this.device = device;
    this.particles = particles;
    this.timeStep = timeStep;
    this.init();
  }

  private init() {
    this.createInstances();
  }

  private createInstances() {
    this.forceAccumulation = new ForceAccumulation(
      this.device,
      this.particles,
      this.timeStep
    );
  }

  getInstance() {
    return {
      forceAccumulation: this.forceAccumulation,
    };
  }

  compute(encoder: GPUCommandEncoder) {
    this.forceAccumulation.buildIndex(encoder);
  }

  resetSimulation() {
    this.forceAccumulation.destroy();
  }
}
