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
  deltaTime: f32,
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

fn rand(seed: vec2<f32>) -> f32 {
    let dotVal = dot(seed, vec2<f32>(12.9898, 78.233));
    return fract(sin(dotVal) * 43758.5453);
}

fn randRange(seed: vec2<f32>, minVal: f32, maxVal: f32) -> f32 {
    return mix(minVal, maxVal, rand(seed));
}


@vertex
fn vs_main(
  @location(0) vertPos: vec4<f32>,
  @builtin(instance_index) iid: u32
 ) -> VertexOutput {
  var output: VertexOutput;
  let center = positions[iid];
  let seed = vec2<f32>(f32(iid), f32(iid));
  var radius = pp.particleRadius;
  if (types[iid] > 3u) {
    radius = pp.particleRadius * randRange(seed, 0.4, 1.2);
  }
  var worldPos = center.xy + vertPos.xy * radius;
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
  let innerGlow = (ptype == 1u || ptype == 4u || ptype == 5u);
  
  let glow = select(
    smoothstep(0.0, 1.0, dist),           // 外側が明るい
    1.0 - smoothstep(0.0, 1.0, dist),    // 内側が明るい
    innerGlow
  );

  let emission = color.rgb * glow * 2.0;    // 中心を強調
  return vec4<f32>(emission, glow);
}