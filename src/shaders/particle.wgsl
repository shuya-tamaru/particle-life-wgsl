struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
}

struct Resolution {
  resolution: vec2<f32>
};


@group(0) @binding(0) var<uniform> res: Resolution;
@group(0) @binding(1) var<storage, read> positions: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> velocities: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> types: array<u32>;


const palette : array<vec4<f32>, 3> = array<vec4<f32>, 3>(
    vec4<f32>(1.0, 0.0, 0.0, 1.0), // 赤
    vec4<f32>(0.0, 1.0, 0.0, 1.0), // 緑
    vec4<f32>(0.0, 0.0, 1.0, 1.0)  // 青
);

fn getColor(particleType: u32) -> vec4<f32> {
  if (particleType == 0u) {
    return palette[0];
  } else if (particleType == 1u) {
    return palette[1];
  } else if (particleType == 2u) {
    return palette[2];
  } else{
    return vec4<f32>(1.0,1.0,1.0, 1.0);
  }
}

const RADIUS = 0.003;

@vertex
fn vs_main(
  @location(0) vertPos: vec4<f32>,
  @builtin(instance_index) iid: u32
 ) -> VertexOutput {
  var output: VertexOutput;
  let center = positions[iid];
  var worldPos = center.xy + vertPos.xy * RADIUS;
  let aspectRatio = res.resolution.x / res.resolution.y;

  worldPos = vec2<f32>(worldPos.x / aspectRatio, worldPos.y);
  output.position = vec4<f32>(worldPos,0.0, 1.0);
  output.color = getColor(types[iid]);
  return output;
}

@fragment
fn fs_main(@location(0) color: vec4<f32>) -> @location(0) vec4<f32> {
  return color;
}