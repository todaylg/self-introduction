import * as THREE from 'three';
import backgroundVS from './shaders/backgroundVS';
import backgroundFS from './shaders/backgroundFS';

class BackgroundMaterial extends THREE.ShaderMaterial {
	constructor(options) {
		let { envMap, uBGEnvironmentSize } = options;
		let uniforms = {
			envMap: { value: envMap },
			uEnvironmentSize: { value: uBGEnvironmentSize },
			uEnvBrightness: { value: 1.0 },
			uEnvironmentTransform: { value: new THREE.Matrix3() },
			opacity: { value: 0.0 }
		};
		super({
			uniforms,
			vertexShader: backgroundVS,
			fragmentShader: backgroundFS,
			side: THREE.DoubleSide,
			transparent: true
		});
	}
}

export { BackgroundMaterial };
