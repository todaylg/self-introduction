varying vec2 vUv;
uniform float time;
uniform float opacity;

float sdLine(in vec2 p, in vec2 a, in vec2 b){
    vec2 ba = b-a;
    vec2 pa = p-a;
    float h =clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    float line = length(pa-h*ba) - 0.1;
    return 1. - sign(line);
}

void main() {
	vec2 st = (vUv * 2.0 - 1.0); // [-1, 1]
    st *= 1.4;
    vec2 v1 = vec2(-1.0,-1.0);
	vec2 v2 = vec2(.5,0.);
    float line1 = sdLine( st, v1, v2 );

    vec2 v3 = vec2(-1.0,1.0);
	vec2 v4 = vec2(.5,0.);
    float line2 = sdLine( st, v3, v4 );

	float alpha = line1 + line2;
    float common = line1 * line2 / 2.;
    alpha -= common;

    float animeAlpha = 0.3 + abs(sin(time)) / 5.;

	vec3 col = vec3(1.);

	gl_FragColor = vec4(col, alpha * opacity * animeAlpha);
}