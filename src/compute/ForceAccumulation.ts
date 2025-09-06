import { Particles } from "../gfx/Particles";
import { ParticleUniforms } from "../gfx/unofrorms/ParticleUniforms";
import forceAccumulationShader from "../shaders/forceAccumulation.wgsl";
import { TimeStep } from "../utils/TimeStep";
import { ComputeUniforms } from "./ComputeUniforms";

export class ForceAccumulation {
  private device!: GPUDevice;
  private particles!: Particles;
  private particleUniforms!: ParticleUniforms;
  private computeUniforms!: ComputeUniforms;
  private timeStep!: TimeStep;
  private forces!: Float32Array;
  private forcesBuffer!: GPUBuffer;
  private bindGroupLayout!: GPUBindGroupLayout;
  private pipeline!: GPUComputePipeline;

  constructor(
    device: GPUDevice,
    particles: Particles,
    particleUniforms: ParticleUniforms,
    computeUniforms: ComputeUniforms,
    timeStep: TimeStep
  ) {
    this.device = device;
    this.particles = particles;
    this.particleUniforms = particleUniforms;
    this.computeUniforms = computeUniforms;
    this.timeStep = timeStep;
    this.init();
  }

  init() {
    this.createBuffer();
    this.createBufferLayout();
  }

  private createBuffer() {
    this.forces = new Float32Array(this.particles.getParticleCount() * 4);
    this.forcesBuffer = this.device.createBuffer({
      size: this.forces.byteLength,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC,
    });
  }

  private createBufferLayout() {
    const module = this.device.createShaderModule({
      code: forceAccumulationShader,
    });

    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "read-only-storage" }, // positionsBuffer
        },
        {
          binding: 1,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "read-only-storage" }, // velocitiesBuffer
        },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "read-only-storage" }, // typesBuffer
        },
        {
          binding: 3,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "storage" }, // forcesBuffer
        },
        {
          binding: 4,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" }, // timeStep
        },
        {
          binding: 5,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" }, // particleParamsBuffer
        },
        {
          binding: 6,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "uniform" }, // forceParamsBuffer
        },
        {
          binding: 7,
          visibility: GPUShaderStage.COMPUTE,
          buffer: { type: "read-only-storage" }, // interactionMatrixBuffer
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
        {
          binding: 0,
          resource: { buffer: this.particles.getPositionsBuffer() },
        },
        {
          binding: 1,
          resource: { buffer: this.particles.getVelocitiesBuffer() },
        },
        {
          binding: 2,
          resource: { buffer: this.particles.getTypesBuffer() },
        },
        {
          binding: 3,
          resource: { buffer: this.forcesBuffer },
        },
        {
          binding: 4,
          resource: { buffer: this.timeStep.getBuffer() },
        },
        {
          binding: 5,
          resource: { buffer: this.particleUniforms.getParticleParamsBuffer() },
        },
        {
          binding: 6,
          resource: { buffer: this.computeUniforms.getForceParamsBuffer() },
        },
        {
          binding: 7,
          resource: {
            buffer: this.computeUniforms.getInteractionMatrixBuffer(),
          },
        },
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

  getForcesBuffer() {
    return this.forcesBuffer;
  }

  destroy() {
    this.forcesBuffer.destroy();
  }
}
