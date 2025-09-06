struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) center: vec2<f32>,
  @location(2) localPos: vec2<f32>,
}

struct Resolution {
  resolution: vec2<f32>
};

struct TimeStep {
  timeStep: f32,
  _pad0: f32,
  _pad1: f32,
  _pad2: f32
};


@group(0) @binding(0) var<uniform> res: Resolution;
@group(0) @binding(1) var<uniform> timeStep: TimeStep;
@group(0) @binding(2) var<storage, read> positions: array<vec4<f32>>;
@group(0) @binding(3) var<storage, read> velocities: array<vec4<f32>>;
@group(0) @binding(4) var<storage, read> types: array<u32>;



// const palette : array<vec4<f32>, 6> = array<vec4<f32>, 6>(
//     vec4<f32>(1.0, 0.2, 0.5, 1.0), // コーラルピンク
//     vec4<f32>(0.2, 1.0, 0.7, 1.0), // エメラルドグリーン
//     vec4<f32>(0.2, 0.8, 1.0, 1.0), // ターコイズブルー
//     vec4<f32>(0.5, 0.2, 0.8, 1.0), // ディープパープル
//     vec4<f32>(0.8, 1.0, 0.2, 1.0), // ライムイエロー
//     vec4<f32>(1.0, 1.0, 0.9, 1.0)  // ソフトホワイト
// );
const palette : array<vec4<f32>, 6> = array<vec4<f32>, 6>(
    vec4<f32>(1.0, 0.1, 0.8, 1.0), // パステルピンク
    vec4<f32>(0.6, 0.8, 1.0, 1.0), // パステルブルー
    vec4<f32>(0.0, 1.0, 0., 1.0), // パステルグリーン
    vec4<f32>(1.0, 1.0, 1.0, 1.0), // パステルイエロー
    vec4<f32>(0.8, 0.6, 1.0, 1.0), // パステルパープル
    vec4<f32>(1.0, 0.9, 0.8, 1.0)  // ホワイトピーチ
);
// const palette : array<vec4<f32>, 6> = array<vec4<f32>, 6>(
//     vec4<f32>(1.0, 0.2, 0.0, 1.0), // ファイアレッド
//     vec4<f32>(1.0, 0.5, 0.0, 1.0), // オレンジフレア
//     vec4<f32>(1.0, 1.0, 0.0, 1.0), // ソーライエロー
//     vec4<f32>(0.3, 0.7, 1.0, 1.0), // アイスブルー
//     vec4<f32>(0.0, 1.0, 0.8, 1.0), // ディープシアン
//     vec4<f32>(0.7, 0.2, 1.0, 1.0)  // コズミックパープル
// );

fn getColor(particleType: u32) -> vec4<f32> {
  if (particleType == 0u) {
    return palette[0];
  } else if (particleType == 1u) {
    return palette[1];
  } else if (particleType == 2u) {
    return palette[2];
  } else if (particleType == 3u) {
    return palette[3];
  } else if (particleType == 4u) {
    return palette[4];
  } else if (particleType == 5u) {
    return palette[5];
  } else{
    return vec4<f32>(1.0,1.0,1.0, 1.0);
  }
}

const RADIUS = 0.008;

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
  output.center = center.xy;
  output.localPos = vertPos.xy;
  return output;
}

@fragment
fn fs_main(
  @builtin(position) fragCoord: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) center: vec2<f32>,
  @location(2) localPos: vec2<f32>
) -> @location(0) vec4<f32> {
  let dist = length(localPos);
  let glow = 1.0 - smoothstep(0.0, 1.0, dist);
  let emission = color.rgb * glow * 1.0;    // 中心を強調
  return vec4<f32>(emission, glow);
}