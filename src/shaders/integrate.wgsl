struct TimeStep {
  timeStep: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32
};

struct ParticleParams {
  particleCount: u32
};

struct Resolution {
  resolution: vec2<f32>
};

const DAMPING = 0.99;

@group(0) @binding(0) var<storage, read_write> positions: array<vec4<f32>>;
@group(0) @binding(1) var<storage, read_write> velocities: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> forces: array<vec4<f32>>;
@group(0) @binding(3) var<uniform> ts: TimeStep;
@group(0) @binding(4) var<uniform> pp: ParticleParams;
@group(0) @binding(5) var<uniform> res: Resolution;

@compute @workgroup_size(64)
fn cs_main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let i = global_id.x;
  if(global_id.x >= pp.particleCount) {
    return;
  }

  let f = forces[i].xy;
  var v_xy = vec2<f32>(
      velocities[i].x + f.x * ts.timeStep,
      velocities[i].y + f.y * ts.timeStep
  );

  var p = positions[i];
  var p_xy = vec2<f32>(
      p.x + v_xy.x * ts.timeStep,
      p.y + v_xy.y * ts.timeStep
  );

let aspectRatio = res.resolution.x / res.resolution.y;
let frictionFactor = pow(0.5, ts.timeStep / 0.02);

if (p_xy.x < -1.0 * aspectRatio) { p_xy.x += 2.0 * aspectRatio; }
if (p_xy.x >  1.0 * aspectRatio) { p_xy.x -= 2.0 * aspectRatio; }
if (p_xy.y < -1.0) { p_xy.y += 2.0; }
if (p_xy.y >  1.0) { p_xy.y -= 2.0; }

  velocities[i] = vec4<f32>(v_xy, velocities[i].z, velocities[i].w);
  velocities[i] *= frictionFactor;
  positions[i] = vec4<f32>(p_xy, positions[i].z, positions[i].w);
}