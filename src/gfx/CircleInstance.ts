export class CircleInstance {
  private device!: GPUDevice;

  private vertexBuffer!: GPUBuffer;
  private vertexBufferLayout!: GPUVertexBufferLayout;
  private indexBuffer!: GPUBuffer;

  private vertices!: number[];
  private indices!: number[];
  private indexCount!: number;

  constructor(device: GPUDevice) {
    this.device = device;
    this.init();
  }

  init() {
    this.createCircleGeometry();
    this.createVertexBuffer();
    this.createIndexBuffer();
    this.createVertexBufferLayout();
  }

  private createCircleGeometry(radius: number = 1.0, segments: number = 64) {
    const vertices = [];
    const indices = [];

    // 中心点を追加
    vertices.push(0, 0); // x, y

    // 円周上の点を生成
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      vertices.push(x, y);
    }

    // インデックスを生成（三角形ファン）
    for (let i = 1; i <= segments; i++) {
      indices.push(0, i, i + 1);
    }

    this.vertices = vertices;
    this.indices = indices;
    this.indexCount = indices.length;
  }

  private createVertexBuffer() {
    const vertexData = new Float32Array(this.vertices);

    this.vertexBuffer = this.device.createBuffer({
      label: "Circle Vertex Buffer",
      size: vertexData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    this.device.queue.writeBuffer(this.vertexBuffer, 0, vertexData);
  }

  private createIndexBuffer() {
    const indexData = new Uint16Array(this.indices);

    this.indexBuffer = this.device.createBuffer({
      label: "Circle Index Buffer",
      size: indexData.byteLength,
      usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });

    this.device.queue.writeBuffer(this.indexBuffer, 0, indexData);
  }

  private createVertexBufferLayout() {
    this.vertexBufferLayout = {
      arrayStride: 2 * 4,
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x2",
        },
      ],
    };
  }

  getVertexBuffer(): GPUBuffer {
    return this.vertexBuffer;
  }

  getIndexBuffer(): GPUBuffer {
    return this.indexBuffer;
  }

  getIndexCount(): number {
    return this.indexCount;
  }

  getVertexBufferLayout(): GPUVertexBufferLayout {
    return this.vertexBufferLayout;
  }

  destroy() {
    this.vertexBuffer?.destroy();
    this.indexBuffer?.destroy();
  }
}
