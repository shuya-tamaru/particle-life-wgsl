import GUI from "lil-gui";
import { ParticleUniforms } from "../gfx/unofrorms/ParticleUniforms";

export class Gui {
  private gui!: GUI;
  private particleUniforms!: ParticleUniforms;
  private bgColor!: { r: number; g: number; b: number; a: number };

  constructor(
    particleUniforms: ParticleUniforms,
    bgColor: { r: number; g: number; b: number; a: number }
  ) {
    this.gui = new GUI({ title: "Controls " });
    this.particleUniforms = particleUniforms;
    this.bgColor = bgColor;
    this.init();
  }

  init() {
    this.gui
      .addColor(this, "bgColor" as keyof this)
      .name("Background Color")
      .onChange((color: { r: number; g: number; b: number; a: number }) => {
        this.bgColor = color;
      });

    Array.from({ length: 6 }).forEach((_, index) => {
      this.gui
        .addColor(
          this.particleUniforms,
          `color${index}` as keyof ParticleUniforms
        )
        .name(`Color ${index}`)
        .onChange((color: { r: number; g: number; b: number; a: number }) => {
          this.particleUniforms.updateColorByIndex(index, color);
        });
    });
  }

  dispose() {
    this.gui.destroy();
  }
}
