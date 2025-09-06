import type { CircleInstance } from "./CircleInstance";
import particleShader from "../shaders/particle.wgsl";
import type { ResolutionSystem } from "../utils/ResolutionSystem";
import type { TimeStep } from "../utils/TimeStep";

export class Particles {
  private device!: GPUDevice;
  private particleCount!: number;
  private typeCount!: number;

  private circleInstance!: CircleInstance;
  private resolutionSystem!: ResolutionSystem;
  private aspectRatio!: number;

  private positions!: Float32Array;
  private velocities!: Float32Array;
  private types!: Uint32Array;

  private timeStep!: TimeStep;
  private bindGroupLayout!: GPUBindGroupLayout;
  private format!: GPUTextureFormat;
  private pipeline!: GPURenderPipeline;
  private positionsBuffer!: GPUBuffer;
  private velocitiesBuffer!: GPUBuffer;
  private typesBuffer!: GPUBuffer;

  constructor(
    device: GPUDevice,
    circleInstance: CircleInstance,
    resolutionSystem: ResolutionSystem,
    timeStep: TimeStep,
    particleCount: number,
    typeCount: number,
    format: GPUTextureFormat
  ) {
    this.device = device;
    this.circleInstance = circleInstance;
    this.resolutionSystem = resolutionSystem;
    this.timeStep = timeStep;
    this.particleCount = particleCount;
    this.typeCount = typeCount;
    this.format = format;
    this.aspectRatio = resolutionSystem.getAspectRatio();
    this.init();
  }

  init() {
    this.createParticleData();
    this.createBuffer();
    this.createPipeline();
  }

  private createParticleData() {
    this.positions = new Float32Array(this.particleCount * 4);
    this.velocities = new Float32Array(this.particleCount * 4);
    this.types = new Uint32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      this.positions[i * 4] = (Math.random() * 2 - 1) * this.aspectRatio;
      this.positions[i * 4 + 1] = Math.random() * 2 - 1.0;
      this.positions[i * 4 + 2] = 0;
      this.positions[i * 4 + 3] = 0;

      this.velocities[i * 4] = (Math.random() - 0.5) * 0.1;
      this.velocities[i * 4 + 1] = (Math.random() - 0.5) * 0.1;
      this.velocities[i * 4 + 2] = 0;
      this.velocities[i * 4 + 3] = 0;

      this.types[i] = Math.floor(Math.random() * this.typeCount);
    }
  }

  private createBuffer() {
    const usage =
      GPUBufferUsage.COPY_DST |
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC;
    this.positionsBuffer = this.device.createBuffer({
      size: this.positions.byteLength,
      usage: usage,
    });

    this.velocitiesBuffer = this.device.createBuffer({
      size: this.velocities.byteLength,
      usage: usage,
    });

    this.typesBuffer = this.device.createBuffer({
      size: this.types.byteLength,
      usage: usage,
    });

    this.device.queue.writeBuffer(this.positionsBuffer, 0, this.positions);
    this.device.queue.writeBuffer(this.velocitiesBuffer, 0, this.velocities);
    this.device.queue.writeBuffer(this.typesBuffer, 0, this.types);
  }

  private createPipeline() {
    this.bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" }, //transformParams
        },
        {
          binding: 1,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" }, //timeStep
        },
        {
          binding: 2,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "read-only-storage" }, //position
        },
        {
          binding: 3,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "read-only-storage" }, //velocity
        },
        {
          binding: 4,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "read-only-storage" }, //type
        },
      ],
    });

    const pipelineLayout = this.device.createPipelineLayout({
      bindGroupLayouts: [this.bindGroupLayout],
    });

    this.pipeline = this.device.createRenderPipeline({
      vertex: {
        module: this.device.createShaderModule({ code: particleShader }),
        entryPoint: "vs_main",
        buffers: [this.circleInstance.getVertexBufferLayout()],
      },
      fragment: {
        module: this.device.createShaderModule({ code: particleShader }),
        entryPoint: "fs_main",
        targets: [{ format: this.format }],
      },
      primitive: {
        topology: "triangle-list",
      },
      layout: pipelineLayout,
    });
  }

  private makeBindGroup(): GPUBindGroup {
    return this.device.createBindGroup({
      layout: this.bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: this.resolutionSystem.getBuffer() },
        },
        {
          binding: 1,
          resource: { buffer: this.timeStep.getBuffer() },
        },
        {
          binding: 2,
          resource: { buffer: this.positionsBuffer },
        },
        {
          binding: 3,
          resource: { buffer: this.velocitiesBuffer },
        },
        {
          binding: 4,
          resource: { buffer: this.typesBuffer },
        },
      ],
    });
  }

  draw(pass: GPURenderPassEncoder) {
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, this.makeBindGroup());
    pass.setVertexBuffer(0, this.circleInstance.getVertexBuffer());
    pass.setIndexBuffer(this.circleInstance.getIndexBuffer(), "uint16");
    pass.drawIndexed(this.circleInstance.getIndexCount(), this.particleCount);
  }

  getPositions() {
    return this.positions;
  }
  getPositionsBuffer() {
    return this.positionsBuffer;
  }

  getVelocities() {
    return this.velocities;
  }

  getVelocitiesBuffer() {
    return this.velocitiesBuffer;
  }

  getTypes() {
    return this.types;
  }

  getTypesBuffer() {
    return this.typesBuffer;
  }

  getParticleCount() {
    return this.particleCount;
  }

  dispose() {
    this.positionsBuffer.destroy();
    this.velocitiesBuffer.destroy();
    this.typesBuffer.destroy();
  }
}
