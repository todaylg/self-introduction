uniform sampler2D inputBuffer;
uniform float offset;
uniform float darkness;

varying vec2 vUv;

void main() {
	vec2 uv = vUv;
	const vec2 center = vec2(0.5);
	vec4 texel = texture2D(inputBuffer, vUv);
	vec3 color = texel.rgb;

	#ifdef ESKIL
	// Eskil's vignette
	vec2 coord = (uv - center) * vec2(offset);
	color = mix(color, vec3(1.0 - darkness), dot(coord, coord));
	#else
	// alternative version from glfx.js
	// this one makes more "dusty" look (as opposed to "burned")
	float d = distance(uv, center);
	color *= smoothstep(0.8, offset * 0.799, d * (darkness + offset));
	#endif
	
	gl_FragColor = vec4(color, texel.a);
}
