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

struct ForceParams {
  forceScale: f32,
  interactionRadius: f32,
  transitionRadius: f32,
  _pad0: f32
};


@group(0) @binding(0) var<storage, read> positions: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read> velocities: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> types: array<u32>;
@group(0) @binding(3) var<storage, read_write> forces: array<vec4<f32>>;
@group(0) @binding(4) var<uniform> timeStep: TimeStep;
@group(0) @binding(5) var<uniform> pp: ParticleParams;
@group(0) @binding(6) var<uniform> fp: ForceParams;
@group(0) @binding(7) var<storage, read> imatrix: array<f32, 36>;


fn forceKernel(r:f32, a:f32) -> f32 {
  let beta = fp.transitionRadius;
  if(r < beta) {
    return r / beta - 1.0;
  }else if(r < 1.0){
    return a * (1.0 - abs(2.0 * r -1.0 - beta) / (1.0 - beta));
  }else{
    return 0.0;
  }
}

fn getInteractionMatrix(ti: u32, tj: u32) -> f32 {
  return imatrix[ti * 4 + tj];
}

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

    if(dist > fp.interactionRadius) { continue; }

    let dir = normalize(d);
    let k = getInteractionMatrix(ti, tj);
    let r = dist / fp.interactionRadius;
    let w = forceKernel(r, k);
    f+= dir * w * fp.forceScale;
  }

  forces[i] = vec4<f32>(f, 0.0, 0.0);
  
}