struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) center: vec2<f32>,
  @location(2) localPos: vec2<f32>,
  @location(3) @interpolate(flat) ptype: u32
}

struct Resolution {
  resolution: vec2<f32>
};

struct ParticleParams {
  particleRadius: f32,
  particleCount: u32,
  _pad0: f32,
  _pad1: f32
};

struct TimeStep {
  timeStep: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32
};

struct ColorPallet {
  palette: array<vec4<f32>, 6>
};


@group(0) @binding(0) var<uniform> res: Resolution;
@group(0) @binding(1) var<uniform> timeStep: TimeStep;
@group(0) @binding(2) var<uniform> pp: ParticleParams;
@group(0) @binding(3) var<uniform> cp: ColorPallet;
@group(0) @binding(4) var<storage, read> positions: array<vec4<f32>>;
@group(0) @binding(5) var<storage, read> velocities: array<vec4<f32>>;
@group(0) @binding(6) var<storage, read> types: array<u32>;


fn getColor(particleType: u32) -> vec4<f32> {
  if (particleType >= 6u) {
    return vec4<f32>(1.0,1.0,1.0, 1.0);
  }else {
    return cp.palette[particleType];
  }
}

@vertex
fn vs_main(
  @location(0) vertPos: vec4<f32>,
  @builtin(instance_index) iid: u32
 ) -> VertexOutput {
  var output: VertexOutput;
  let center = positions[iid];
  var worldPos = center.xy + vertPos.xy * pp.particleRadius;
  let aspectRatio = res.resolution.x / res.resolution.y;

  worldPos = vec2<f32>(worldPos.x / aspectRatio, worldPos.y);
  output.position = vec4<f32>(worldPos,0.0, 1.0);
  output.color = getColor(types[iid]);
  output.center = center.xy;
  output.localPos = vertPos.xy;
  output.ptype = types[iid];
  return output;
}

@fragment
fn fs_main(
  @builtin(position) fragCoord: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) center: vec2<f32>,
  @location(2) localPos: vec2<f32>,
  @location(3) @interpolate(flat) ptype: u32
) -> @location(0) vec4<f32> {
  let dist = length(localPos);
  var glow = 0.0;
  if (ptype == 0u) {
    glow =  smoothstep(0.0, 1.0, dist);
  } else if (ptype == 1u) {
    glow = 1.0- smoothstep(0.0, 1.0, dist);
  } else if (ptype == 2u) {
    glow = smoothstep(0.0, 1.0, dist);
  } else if (ptype == 3u) {
    glow = smoothstep(0.0, 1.0, dist);
  } else if (ptype == 4u) {
    glow =1.0- smoothstep(0.0, 1.0, dist);
  } else if (ptype == 5u) {
    glow = 1.0 -smoothstep(0.0, 1.0, dist);
  }

  let emission = color.rgb * glow * 1.5;    // 中心を強調
  return vec4<f32>(emission, glow);
}