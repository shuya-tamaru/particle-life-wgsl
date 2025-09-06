import { Particles } from "../gfx/Particles";
import { TimeStep } from "../utils/TimeStep";
import { ForceAccumulation } from "./ForceAccumulation";
import integrateShader from "../shaders/integrate.wgsl";
import type { ResolutionSystem } from "../utils/ResolutionSystem";

export class Integrate {
  private device!: GPUDevice;
  private particles!: Particles;
  private forceAccumulation!: ForceAccumulation;
  private timeStep!: TimeStep;
  private resolutionSystem!: ResolutionSystem;

  private pipeline!: GPUComputePipeline;
  private bindGroupLayout!: GPUBindGroupLayout;

  constructor(
    device: GPUDevice,
    particles: Particles,
    timeStep: TimeStep,
    forceAccumulation: ForceAccumulation,
    resolutionSystem: ResolutionSystem
  ) {
    this.device = device;
    this.particles = particles;
    this.timeStep = timeStep;
    this.forceAccumulation = forceAccumulation;
    this.resolutionSystem = resolutionSystem;
    this.init();
  }

  private init() {
    this.createBufferLayout();
  }

  private createBufferLayout() {
    const module = this.device.createShaderModule({
      code: integrateShader,
    });

    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "storage" }, // positionsBuffer
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "storage" }, // velocitiesBuffer
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "read-only-storage" }, // forcesBuffer
        },
        {
          binding: 3,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" }, // timeStep
        },
        {
          binding: 4,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" }, // particleParamsBuffer
        },
        {
          binding: 5,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" }, // resolutionSystem
        },
      ],
    });

    this.pipeline = this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout],
      }),
      compute: { module, entryPoint: "cs_main" },
    });
  }

  private makeBindGroup(): GPUBindGroup {
    return this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [
        { binding: 0, resource: this.particles.getPositionsBuffer() },
        { binding: 1, resource: this.particles.getVelocitiesBuffer() },
        { binding: 2, resource: this.forceAccumulation.getForcesBuffer() },
        { binding: 3, resource: this.timeStep.getBuffer() },
        { binding: 4, resource: this.particles.getParticleParamsBuffer() },
        { binding: 5, resource: this.resolutionSystem.getBuffer() },
      ],
    });
  }

  buildIndex(encoder: GPUCommandEncoder) {
    const pass = encoder.beginComputePass();
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.makeBindGroup());
    pass.dispatchWorkgroups(Math.ceil(this.particles.getParticleCount() / 64));
    pass.end();
  }
}
