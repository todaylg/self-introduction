attribute vec2 uv;
attribute vec4 position;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
varying vec2 vUv;
uniform float time;

#pragma glslify: snoise = require(glsl-noise/simplex/4d);

void main() {
  vUv = uv;
  vec3 p = vec3(position.x, position.y, position.z);
  float n = snoise(vec4(p, 1.0 + time * 0.5)) * 2.0;
  p.y += n * 0.5;
  p.z += n * 0.5;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}