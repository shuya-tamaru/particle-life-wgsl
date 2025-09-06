struct TimeStep {
  timeStep: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32
};

struct ParticleParams {
  particleCount: u32
};

const INTERACTION_RADIUS = 0.1;
const interactionMatrix: array<f32, 3 * 3> = array<f32, 3 * 3>(
     0.5, -0.3,  0.2,
    -0.3,  0.5, -0.1,
     0.2, -0.1,  0.5
);

fn getInteractionMatrix(ti: u32, tj: u32) -> f32 {
  return interactionMatrix[ti * 3 + tj];
}


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

    if (dist > 0.0 && dist < INTERACTION_RADIUS) {
      let dir = normalize(d);
      let k = getInteractionMatrix(ti, tj);
      let w = 1.0 - dist / INTERACTION_RADIUS;
      f+= dir * k * w;
    }
  }

  forces[i] = vec4<f32>(f, 0.0, 0.0);
  
}