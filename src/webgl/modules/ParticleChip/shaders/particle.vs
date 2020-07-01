attribute float aSize;
attribute float aAlpha;

varying vec3 vPosition;
varying float vPreAlpha;

void main() {
	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	gl_PointSize = aSize * (300.0 / - mvPosition.z);
	
	vPosition = vec3(mvPosition.xyz);
	vPreAlpha = aAlpha;
}