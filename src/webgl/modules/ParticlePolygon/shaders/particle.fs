precision highp float;
varying vec2 vUv;
varying float vPreAlpha;
uniform vec3 color;
uniform float type;

// https://www.shadertoy.com/view/llVyWW
float sdPentagon(vec2 p, float r){
    const vec3 k = vec3(0.809016994,0.587785252,0.726542528); // pi/5: cos, sin, tan
    p.y = -p.y;
    p.x = abs(p.x);
    p -= 2.0*min(dot(vec2(-k.x,k.y),p),0.0)*vec2(-k.x,k.y);
    p -= 2.0*min(dot(vec2( k.x,k.y),p),0.0)*vec2( k.x,k.y);
	p -= vec2(clamp(p.x,-r*k.z,r*k.z),r);    
    return length(p)*sign(p.y);
}

// Heart curve suggested by IQ, improved by Dave_Hoskins.
float heart(vec2 p) {
    // Center it more, vertically:
    p.y += .6;
    // This offset reduces artifacts on the center vertical axis.
    const float offset = .3;
    // (x^2+(1.2*y-sqrt(abs(x)))^2−1)
    float k = 1.2 * p.y - sqrt(abs(p.x) + offset);
    return p.x * p.x + k * k - 1.;
}

float sdStar(in vec2 p, in float r, in float rf){
    const vec2 k1 = vec2(0.809016994375, -0.587785252292);
    const vec2 k2 = vec2(-k1.x,k1.y);

    // repeat domain 5x
    p.x = abs(p.x);
    p -= 2.0*max(dot(k1,p),0.0)*k1;
    p -= 2.0*max(dot(k2,p),0.0)*k2;
    p.x = abs(p.x);
    
    // draw triangle
    p.y -= r;
    vec2 ba = rf*vec2(-k1.y,k1.x) - vec2(0,1);
	float h = clamp( dot(p,ba)/dot(ba,ba), 0.0, r );
    return length(p-ba*h) * sign(p.y*ba.x-p.x*ba.y);
}

void main() {
	vec2 st = (vUv * 2.0 - 1.0); // [-1, 1]
    float r;

    if(type>1.1)
        r = sdStar(st, 1., .5);
    else if(type>0.1)
        r = heart(st);
    else
        r = sdPentagon(st, .5);
    
	float alpha = 1. - sign(r);

	vec3 col = color;

	gl_FragColor = vec4(col, alpha * vPreAlpha);
}