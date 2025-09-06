import { Particles } from "../gfx/Particles";
import { ParticleUniforms } from "../gfx/unofrorms/ParticleUniforms";
import { ResolutionSystem } from "../utils/ResolutionSystem";
import { TimeStep } from "../utils/TimeStep";
import { ComputeUniforms } from "./ComputeUniforms";
import { ForceAccumulation } from "./ForceAccumulation";
import { Integrate } from "./Integrate";

export class Simulator {
  private device!: GPUDevice;
  private particles!: Particles;
  private particleUniforms!: ParticleUniforms;
  private timeStep!: TimeStep;
  private resolutionSystem!: ResolutionSystem;

  private computeUniforms!: ComputeUniforms;
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
    this.computeUniforms = new ComputeUniforms(this.device);
    this.forceAccumulation = new ForceAccumulation(
      this.device,
      this.particles,
      this.particleUniforms,
      this.computeUniforms,
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
      integrate: this.integrate,
      computeUniforms: this.computeUniforms,
    };
  }

  compute(encoder: GPUCommandEncoder) {
    this.forceAccumulation.buildIndex(encoder);
    this.integrate.buildIndex(encoder);
  }

  resetSimulation() {
    this.computeUniforms.dispose();
    this.forceAccumulation.dispose();
    this.computeUniforms.init();
    this.forceAccumulation.init();
    this.integrate.init();
  }
}
