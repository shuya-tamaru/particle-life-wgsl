import type { Particles } from "../gfx/Particles";
import forceAccumulationShader from "../shaders/forceAccumulation.wgsl";

export class ForceAccumulation {
  private device!: GPUDevice;
  private particles!: Particles;
  private forces!: Float32Array;
  private forcesBuffer!: GPUBuffer;
  private bindGroupLayout!: GPUBindGroupLayout;
  private pipeline!: GPUComputePipeline;

  constructor(device: GPUDevice, particles: Particles) {
    this.device = device;
    this.particles = particles;
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
          buffer: { type: "storage" }, // forcesBuffer
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
          resource: { buffer: this.forcesBuffer },
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
