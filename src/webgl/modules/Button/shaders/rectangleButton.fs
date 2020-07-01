varying vec2 vUv;
uniform float time;
uniform float opacity;

float sdRoundBox( in vec2 p, in vec2 b, in vec4 r ) {
    r.xy = (p.x>0.0)?r.xy : r.zw;
    r.x  = (p.y>0.0)?r.x  : r.y;
    
    vec2 q = abs(p)-b+r.x;
    float box = min(max(q.x,q.y),0.0) + length(max(q,0.0)) - r.x;
    float boxLine = abs(box) - 0.01;
    return 1. - sign(boxLine);
}

void main() {
	vec2 st = (vUv * 2.0 - 1.0); // [-1, 1]
    
    vec2 si1 = vec2(0.8,0.35);
    vec4 ra1 = vec4(0.35);
	float alpha = sdRoundBox(st, si1, ra1);

    float animeAlpha = 0.2 + abs(sin(time)) / 5.;
	vec3 col = vec3(1.);

	gl_FragColor = vec4(col, alpha * animeAlpha * opacity);
}