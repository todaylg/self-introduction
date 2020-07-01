#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision highp float;
uniform float opacity;
uniform vec3 color;
uniform sampler2D map;
varying vec2 vUv;
uniform float time;
uniform vec2 resolution;

uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec3 color4;

// https://iquilezles.org/www/articles/palettes/palettes.htm
vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
  return a + b*cos( 6.28318*(c*t+d) );
}

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main() {
  vec3 sample = texture2D(map, vUv).rgb;
  float sigDist = median(sample.r, sample.g, sample.b) - 0.5;
  float alpha = clamp(sigDist/abs(dFdx(sigDist)) + abs(dFdy(sigDist)) + 0.5, 0.0, 1.0);

  float speed = .5;
  vec2 p = gl_FragCoord.xy * 0.01 + 0.5;
  p.x *= .3;
  p.y *= .8;
  // float scale = 10.0;
  // vec2 p = vUv * scale + 0.5;

  for(int i = 1; i < 10; i++) {
    p.x += 0.45 / float(i) * sin(float(i) * 3.0 * p.y + time * speed);
    p.y += 0.45 / float(i) * cos(float(i) * 3.0 * p.x + time * speed);
  }

  float r = cos(p.x + p.y + 1.0) * .5 + 0.5;

  // Color mixing
  vec3 palette = palette(r, color1, color2, color3, color4);

  gl_FragColor = vec4(palette, alpha * opacity);
  if (gl_FragColor.a < 0.0001) discard;
}