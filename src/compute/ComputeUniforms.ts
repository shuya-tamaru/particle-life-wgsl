export class ComputeUniforms {
  private device!: GPUDevice;
  private forceParamsBuffer!: GPUBuffer;
  private interactionMatrixBuffer!: GPUBuffer;
  private forceParams!: Float32Array;
  private interactionMatrix!: Float32Array;

  public forceScale!: number;
  public interactionRadius!: number;
  public transitionRadius!: number;

  constructor(device: GPUDevice) {
    this.device = device;
    this.forceScale = 20.0;
    this.interactionRadius = 0.1;
    this.transitionRadius = 0.45;

    //prettier-ignore
    this.interactionMatrix = new Float32Array([
      0.2,  0.1, -0.1,  0.0,  0.03,  0.0,           //0番目の粒子
      -0.2,  0.2,  0.1,  0.0,  0.0,  0.0,           //1番目の粒子
      0.0, -0.2,  0.2,  0.0,  0.03,  0.0,           //2番目の粒子
      0.0,  0.001, 0.001,  0.001,  0.001 ,0.001,    //3番目の粒子
      0.3,  0.0,  0.2, -0.2,  0.2,  0.0,            //4番目の粒子
      0.0,  0.0,  0.0,  0.3,  0.0,  0.2             //5番目の粒子
    ]);

    this.init();
  }

  private init() {
    this.createBuffer();
  }

  private createBuffer() {
    this.forceParams = new Float32Array([
      this.forceScale,
      this.interactionRadius,
      this.transitionRadius,
      0.0,
    ]);
    this.forceParamsBuffer = this.device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(this.forceParamsBuffer, 0, this.forceParams);

    this.interactionMatrixBuffer = this.device.createBuffer({
      size: this.interactionMatrix.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(
      this.interactionMatrixBuffer,
      0,
      this.interactionMatrix
    );
  }

  getForceParamsBuffer() {
    return this.forceParamsBuffer;
  }

  getInteractionMatrixBuffer() {
    return this.interactionMatrixBuffer;
  }

  updateForceParams(
    forceScale: number,
    interactionRadius: number,
    transitionRadius: number
  ) {
    this.forceScale = forceScale;
    this.interactionRadius = interactionRadius;
    this.transitionRadius = transitionRadius;
    this.forceParams = new Float32Array([
      this.forceScale,
      this.interactionRadius,
      this.transitionRadius,
      0.0,
    ]);
    this.device.queue.writeBuffer(this.forceParamsBuffer, 0, this.forceParams);
  }

  dispose() {
    this.forceParamsBuffer.destroy();
    this.interactionMatrixBuffer.destroy();
  }
}
