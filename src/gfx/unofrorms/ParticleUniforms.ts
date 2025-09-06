import { colorSet } from "./colorSet";

export class ParticleUniforms {
  private device: GPUDevice;
  private colorBuffer!: GPUBuffer;
  private particleParamsBuffer!: GPUBuffer;

  public particleRadius!: number;
  public particleCount!: number;

  public palette0!: { r: number; g: number; b: number; a: number }[];
  public color0!: { r: number; g: number; b: number; a: number };
  public color1!: { r: number; g: number; b: number; a: number };
  public color2!: { r: number; g: number; b: number; a: number };
  public color3!: { r: number; g: number; b: number; a: number };
  public color4!: { r: number; g: number; b: number; a: number };
  public color5!: { r: number; g: number; b: number; a: number };

  public currentPalette!: { r: number; g: number; b: number; a: number }[];
  public pallet1!: { r: number; g: number; b: number; a: number }[];
  public pallet2!: { r: number; g: number; b: number; a: number }[];

  constructor(device: GPUDevice, particleCount: number) {
    this.device = device;
    this.particleCount = particleCount;

    this.currentPalette = colorSet.palette0;

    this.color0 = this.currentPalette[0];
    this.color1 = this.currentPalette[1];
    this.color2 = this.currentPalette[2];
    this.color3 = this.currentPalette[3];
    this.color4 = this.currentPalette[4];
    this.color5 = this.currentPalette[5];

    this.particleRadius = 0.008;
    this.init();
  }

  private init() {
    this.createBuffer();
  }

  private createBuffer() {
    const params_float = new Float32Array([this.particleRadius]);
    const params_uint = new Uint32Array([this.particleCount, 0, 0]);
    this.particleParamsBuffer = this.device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(this.particleParamsBuffer, 0, params_float);
    this.device.queue.writeBuffer(this.particleParamsBuffer, 4, params_uint);

    const colors = new Float32Array(
      [
        this.color0,
        this.color1,
        this.color2,
        this.color3,
        this.color4,
        this.color5,
      ].flatMap((color) => [color.r, color.g, color.b, color.a])
    );

    this.colorBuffer = this.device.createBuffer({
      size: 16 * 6,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.device.queue.writeBuffer(this.colorBuffer, 0, colors);
  }

  updateColorPallet(palette: { r: number; g: number; b: number; a: number }[]) {
    this.currentPalette = palette;
    this.color0 = this.currentPalette[0];
    this.color1 = this.currentPalette[1];
    this.color2 = this.currentPalette[2];
    this.color3 = this.currentPalette[3];
    this.color4 = this.currentPalette[4];
    this.color5 = this.currentPalette[5];

    const colors = new Float32Array(
      [
        this.color0,
        this.color1,
        this.color2,
        this.color3,
        this.color4,
        this.color5,
      ].flatMap((color) => [color.r, color.g, color.b, color.a])
    );
    this.device.queue.writeBuffer(this.colorBuffer, 0, colors);
  }

  updateColorByIndex(
    index: number,
    color: { r: number; g: number; b: number; a: number }
  ) {
    if (index === 0) {
      this.color0 = color;
    } else if (index === 1) {
      this.color1 = color;
    } else if (index === 2) {
      this.color2 = color;
    } else if (index === 3) {
      this.color3 = color;
    } else if (index === 4) {
      this.color4 = color;
    } else if (index === 5) {
      this.color5 = color;
    }

    const colors = new Float32Array(
      [
        this.color0,
        this.color1,
        this.color2,
        this.color3,
        this.color4,
        this.color5,
      ].flatMap((color) => [color.r, color.g, color.b, color.a])
    );
    this.device.queue.writeBuffer(this.colorBuffer, 0, colors);
  }

  getParticleParamsBuffer() {
    return this.particleParamsBuffer;
  }

  getColorBuffer() {
    return this.colorBuffer;
  }
}
