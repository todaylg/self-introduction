precision highp float;

uniform vec3 baseColor;
uniform vec3 area1Color;
uniform vec3 area2Color;
uniform vec2 area1Position;
uniform vec2 area2Position;
uniform float strengthFactor;
uniform float area1Radius;
uniform float area2Radius;
uniform float noiseStrength;
uniform float opacity;
varying vec2 vUv;

// https://www.shadertoy.com/view/4djSRW
float random (vec2 st) {
	return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec3 color = baseColor;
    color += strengthFactor * area1Color * (1.0 - smoothstep(0.0, area1Radius, distance(vUv + random(vUv) * noiseStrength, area1Position)));
    color += strengthFactor * area2Color * (1.0 - smoothstep(0.0, area2Radius, distance(vUv + random(vUv) * noiseStrength, area2Position)));
    gl_FragColor = vec4(color, opacity);
}