struct TimeStep {
  timeStep: f32,
  deltaTime: f32,
  _pad1: f32,
  _pad2: f32
};

struct ParticleParams {
  particleRadius: f32,
  particleCount: u32,
  _pad0: f32,
  _pad1: f32
};

const interactionMatrix: array<f32, 36> = array<f32, 36>(
   0.2,  0.1, -0.1,  0.0,  0.03,  0.0,   // 赤 → 緑/紫に惹かれる
  -0.2,  0.2,  0.1,  0.0,  0.0,  0.0,   // 緑 → 青に惹かれる
   0.0, -0.2,  0.2,  0.0,  0.03,  0.0,   // 青 → 緑/紫に惹かれる
   0.0,  0.001, 0.001,  0.001,  0.001 ,0.001,   // 黄 → 全体をやや引き寄せる
   0.3,  0.0,  0.2, -0.2,  0.2,  0.0,   // 紫 → 赤/青に惹かれる
   0.0,  0.0,  0.0,  0.3,  0.0,  0.2    // 白 → 黄に惹かれる
);

fn getInteractionMatrix(ti: u32, tj: u32) -> f32 {
  return interactionMatrix[ti * 4 + tj];
}

const INTERACTION_RADIUS = 0.1;
const BETA = 0.45;
fn forceKernel(r:f32, a:f32) -> f32 {
  if(r < BETA){
    return r / BETA - 1.0;
  }else if(r < 1.0){
    return a * (1.0 - abs(2.0 * r -1.0 - BETA) / (1.0 - BETA));
  }else{
    return 0.0;
  }
}
const FORCE_SCALE = 20.0;


@group(0) @binding(0) var<storage, read> positions: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read> velocities: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> types: array<u32>;
@group(0) @binding(3) var<storage, read_write> forces: array<vec4<f32>>;
@group(0) @binding(4) var<uniform> timeStep: TimeStep;
@group(0) @binding(5) var<uniform> pp: ParticleParams;

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let i = global_id.x;
  if(global_id.x >= pp.particleCount) {
    return;
  }

  var f = vec2<f32>(0.0, 0.0);
  let pi = positions[i].xy;
  let ti = types[i];

  for (var j: u32 = 0u; j < pp.particleCount; j++) {
    if (i == j) { continue; }

    let pj = positions[j].xy;
    let tj = types[j];

    let d = pj - pi;
    let dist = length(d);

    if(dist > INTERACTION_RADIUS) { continue; }

    let dir = normalize(d);
    let k = getInteractionMatrix(ti, tj);
    let r = dist / INTERACTION_RADIUS;
    let w = forceKernel(r, k);
    f+= dir * w * FORCE_SCALE;
  }

  forces[i] = vec4<f32>(f, 0.0, 0.0);
  
}