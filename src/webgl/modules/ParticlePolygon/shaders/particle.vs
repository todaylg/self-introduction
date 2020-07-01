precision highp float;

attribute float pindex;
attribute vec3 position;
attribute vec3 offset;
attribute vec3 random; // rotation/scale/alpha
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float time;
uniform float size;

varying vec2 vUv;
varying float vPreAlpha;

void rotate2d(inout vec2 v, float a){
    mat2 m = mat2(cos(a), -sin(a), sin(a),  cos(a));
    v = m * v;
}

void main() {
	vUv = uv;

	// displacement
	vec3 displaced = offset;

	// rotate around z axis
	vec3 pos = position;
    rotate2d(pos.xy, random.x * .5 + time * (random.y - 0.5) / 4.);

	vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
	mvPosition.xyz += pos * clamp(0.1, 1., size * random.y);
	vec4 finalPosition = projectionMatrix * mvPosition;

	vPreAlpha = random.z;
	gl_Position = finalPosition;
}
