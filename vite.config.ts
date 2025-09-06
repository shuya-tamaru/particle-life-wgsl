import { defineConfig } from "vite";
import { string } from "rollup-plugin-string";

export default defineConfig({
  base: "/particle-life-wgsl/",
  plugins: [
    string({
      include: "**/*.wgsl",
    }),
  ],
});
