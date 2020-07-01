uniform sampler2D inputBuffer;
uniform sampler2D perturbationMap;

uniform bool active;
uniform float columns;
uniform float random;
uniform vec2 seed;
uniform vec2 distortion;

varying vec2 vUv;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
	vec2 uv = vUv;
	if(active) {
		// Columns effect
		if(uv.y < distortion.x + columns && uv.y > distortion.x - columns * random) {
			float sx = clamp(ceil(seed.x), 0.0, 1.0);
			uv.y = sx * (1.0 - (uv.y + distortion.y)) + (1.0 - sx) * distortion.y;
		}
		if(uv.x < distortion.y + columns && uv.x > distortion.y - columns * random) {
			float sy = clamp(ceil(seed.y), 0.0, 1.0);
			uv.x = sy * distortion.x + (1.0 - sy) * (1.0 - (uv.x + distortion.x));
		}

		// RGB shift effect
		vec2 normal = texture2D(perturbationMap, uv * random * random).rg;
		uv += normal * seed * (random * 0.2);

		// Snow noise effect
		// float amount = 1.;
		// float xs = floor(gl_FragCoord.x / 0.5);
		// float ys = floor(gl_FragCoord.y / 0.5);
		// vec4 snow = amount*vec4(rand(vec2(xs * random,ys * random*50.))*0.2);
	}
	
	gl_FragColor = texture2D(inputBuffer, uv);
	// gl_FragColor = gl_FragColor + snow;
}
