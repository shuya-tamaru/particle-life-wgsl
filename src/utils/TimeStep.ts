export class TimeStep {
  private device: GPUDevice;
  private buffer: GPUBuffer;
  private deltaTime: number;

  constructor(device: GPUDevice) {
    this.device = device;
    this.buffer = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.deltaTime = 1 / 150;
  }

  set(value: number) {
    this.device.queue.writeBuffer(
      this.buffer,
      0,
      new Float32Array([value, this.deltaTime, 0, 0])
    );
  }

  getBuffer() {
    return this.buffer;
  }
}
