import type { Particles } from "../gfx/Particles";
import type { ParticleUniforms } from "../gfx/unofrorms/ParticleUniforms";

export class Scene {
  private particles!: Particles;

  constructor(particles: Particles) {
    this.particles = particles;
  }

  draw(pass: GPURenderPassEncoder) {
    this.particles.draw(pass);
  }
}
