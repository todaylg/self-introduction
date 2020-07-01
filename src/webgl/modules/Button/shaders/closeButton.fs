varying vec2 vUv;
uniform float time;
uniform float opacity;

float sdRing(vec2 p, float r1, float r2) {
    float len = length(p);
    float outer = step(len-r1, 0.);
    float inner = step(len-r2, 0.);
    return outer - inner;
}

float sdRoundedX(in vec2 p, in float w, in float r){
    p = abs(p);
    return length(p-min(p.x+p.y,w)*0.5) - r;
}

void main() {
	vec2 st = (vUv * 2.0 - 1.0); // [-1, 1]

    float alpha = sdRoundedX(st, .8, .03);
    alpha = 1. - sign(alpha);

    st *= 1. + abs(sin(time)) / 10.;
    float r1 = sdRing(st, 1., 0.9);
    alpha += r1;

	vec3 col = vec3(1.);

	gl_FragColor = vec4(col, alpha * opacity);
}