varying vec2 vUv;
uniform float time;
uniform float opacity;

float sdRing(vec2 p, float r1, float r2) {
    float len = length(p);
    float outer = step(len-r1, 0.);
    float inner = step(len-r2, 0.);
    return outer - inner;
}

void main() {
	vec2 st = (vUv * 2.0 - 1.0); // [-1, 1]
    st *= 1. + abs(sin(time)) / 5.;
    float r1 = sdRing(st, .85, 0.8);
    float r2 = sdRing(st, .95, 0.9);
    
	float alpha = r1 + r2;

	vec3 col = vec3(1.);

	gl_FragColor = vec4(col, alpha * opacity);
}