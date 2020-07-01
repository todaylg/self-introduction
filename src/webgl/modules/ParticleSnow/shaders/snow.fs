precision highp float;

varying vec3 vPosition;
varying float vPreAlpha;

uniform vec3 innerColor;
uniform vec3 outerColor;

// pos orign r.ab
float ellipse(vec2 p, vec2 o, vec2 r) { 
    vec2 lp = (p - o) / r;
    return length(lp);
}

void main() {
	vec2 st = (gl_PointCoord - vec2(0.5, 0.5)) * 2.0; // [-1,1]
	float r = ellipse(st, vec2(0.), vec2(1.));
	float alpha = 1. - r;
	vec3 col;
	col = mix(innerColor, outerColor, r);
	gl_FragColor = vec4(col, alpha * vPreAlpha);
}