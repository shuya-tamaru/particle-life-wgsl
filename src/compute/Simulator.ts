import { Particles } from "../gfx/Particles";
import type { ParticleUniforms } from "../gfx/unofrorms/ParticleUniforms";
import type { ResolutionSystem } from "../utils/ResolutionSystem";
import { TimeStep } from "../utils/TimeStep";
import { ForceAccumulation } from "./ForceAccumulation";
import { Integrate } from "./Integrate";

export class Simulator {
  private device!: GPUDevice;
  private particles!: Particles;
  private particleUniforms!: ParticleUniforms;
  private timeStep!: TimeStep;
  private resolutionSystem!: ResolutionSystem;
  private forceAccumulation!: ForceAccumulation;
  private integrate!: Integrate;

  constructor(
    device: GPUDevice,
    particles: Particles,
    particleUniforms: ParticleUniforms,
    timeStep: TimeStep,
    resolutionSystem: ResolutionSystem
  ) {
    this.device = device;
    this.particles = particles;
    this.particleUniforms = particleUniforms;
    this.timeStep = timeStep;
    this.resolutionSystem = resolutionSystem;
    this.init();
  }

  private init() {
    this.createInstances();
  }

  private createInstances() {
    this.forceAccumulation = new ForceAccumulation(
      this.device,
      this.particles,
      this.particleUniforms,
      this.timeStep
    );
    this.integrate = new Integrate(
      this.device,
      this.particles,
      this.particleUniforms,
      this.timeStep,
      this.forceAccumulation,
      this.resolutionSystem
    );
  }

  getInstance() {
    return {
      forceAccumulation: this.forceAccumulation,
    };
  }

  compute(encoder: GPUCommandEncoder) {
    this.forceAccumulation.buildIndex(encoder);
    this.integrate.buildIndex(encoder);
  }

  resetSimulation() {
    this.forceAccumulation.destroy();
  }
}
