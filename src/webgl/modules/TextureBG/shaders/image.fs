precision highp float;

uniform float time;
uniform sampler2D texture;
uniform vec2 resolution;
uniform float progress;
varying vec2 vUv;
uniform bool isNext;
uniform vec2 uvTransformSpeed; // [down, up]
uniform float opacity;

uniform float vignetteDarkness;
uniform float vignetteOffset;

void main(void) {
	vec2 uv = vUv;

	float y = gl_FragCoord.y / resolution.y; // [0, 1]
	float offset = progress;
	if(isNext){
        offset = 1. - progress;
		uv.y += offset / uvTransformSpeed.x;
    }else{
		uv.y -= offset / uvTransformSpeed.y;
	}
	vec4 texColor = texture2D(texture, uv);

	// Vignette
	const vec2 center = vec2(0.5);
	float d = distance(uv, center);
	texColor *= smoothstep(0.8, vignetteOffset * 0.799, d * (vignetteDarkness + vignetteOffset));

	texColor.a *= opacity;
	
	gl_FragColor = texColor;
}
