import GUI from "lil-gui";
import { ParticleUniforms } from "../gfx/unofrorms/ParticleUniforms";
import { ComputeUniforms } from "../compute/ComputeUniforms";

export class Gui {
  private gui!: GUI;
  private particleUniforms!: ParticleUniforms;
  private computeUniforms!: ComputeUniforms;
  private bgColor!: { r: number; g: number; b: number; a: number };

  constructor(
    particleUniforms: ParticleUniforms,
    computeUniforms: ComputeUniforms,
    bgColor: { r: number; g: number; b: number; a: number }
  ) {
    this.gui = new GUI({ title: "Controls " });
    this.particleUniforms = particleUniforms;
    this.computeUniforms = computeUniforms;
    this.bgColor = bgColor;
    this.init();
  }

  init() {
    const colorFolder = this.gui.addFolder("Color Settings");
    const computeFolder = this.gui.addFolder("Compute Settings");
    colorFolder
      .addColor(this, "bgColor" as keyof this)
      .name("Background Color")
      .onChange((color: { r: number; g: number; b: number; a: number }) => {
        this.bgColor = color;
      });

    Array.from({ length: 6 }).forEach((_, index) => {
      colorFolder
        .addColor(
          this.particleUniforms,
          `color${index}` as keyof ParticleUniforms
        )
        .name(`Color ${index}`)
        .onChange((color: { r: number; g: number; b: number; a: number }) => {
          this.particleUniforms.updateColorByIndex(index, color);
        });
    });

    computeFolder
      .add(this.computeUniforms, "forceScale", 0.0, 100.0)
      .name("Force Scale")
      .onChange((value: number) => {
        this.computeUniforms.updateForceParams(
          value,
          this.computeUniforms.interactionRadius,
          this.computeUniforms.transitionRadius
        );
      });
    computeFolder
      .add(this.computeUniforms, "interactionRadius", 0.0, 1.0)
      .name("Interaction Radius")
      .onChange((value: number) => {
        this.computeUniforms.updateForceParams(
          this.computeUniforms.forceScale,
          value,
          this.computeUniforms.transitionRadius
        );
      });
    computeFolder
      .add(this.computeUniforms, "transitionRadius", 0.1, 1.0)
      .name("Transition Radius")
      .onChange((value: number) => {
        this.computeUniforms.updateForceParams(
          this.computeUniforms.forceScale,
          this.computeUniforms.interactionRadius,
          value
        );
      });
  }

  dispose() {
    this.gui.destroy();
  }
}
