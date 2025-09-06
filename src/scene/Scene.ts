import type { Particles } from "../gfx/Particles";

export class Scene {
  private particles!: Particles;

  constructor(particles: Particles) {
    this.particles = particles;
  }

  draw(pass: GPURenderPassEncoder) {
    this.particles.draw(pass);
  }
}
