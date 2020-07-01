precision highp float;

varying vec3 vPosition;
varying float vPreAlpha;

uniform vec3 innerColor;
uniform vec3 outerColor;

float ndot(vec2 a, vec2 b) { return a.x*b.x - a.y*b.y; }
float sdRhombus(in vec2 p, in vec2 b) {
    vec2 q = abs(p);

    float h = clamp( (-2.0*ndot(q,b) + ndot(b,b) )/dot(b,b), -1.0, 1.0 );
    float d = length( q - 0.5*b*vec2(1.0-h,1.0+h) );
    d *= sign( q.x*b.y + q.y*b.x - b.x*b.y );
    
	return d;
}

void main() {
	vec2 st = (gl_PointCoord - vec2(0.5, 0.5)) * 2.0; // [-1,1]
	float r = sdRhombus(st, vec2(0.6, 0.2));
	float alpha = 1. - sign(r);
	vec3 col;
	col = mix(innerColor, outerColor, r);
	gl_FragColor = vec4(col, alpha * vPreAlpha);
}