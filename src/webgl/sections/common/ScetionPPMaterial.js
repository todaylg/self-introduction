import * as THREE from 'three';
import ppMaterialVS from './shaders/ppMaterial.vs';
import ppMaterialFS from './shaders/scetionPPMaterial.fs';

export class ScetionPPMaterial extends THREE.RawShaderMaterial {
	constructor() {
		super({
			uniforms: {
				map: { value: null },
				progress: { value: 0 },
				edgeProgress: { value: 0 },
				isNext: { value: false },
				resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
			},
			vertexShader: ppMaterialVS,
			fragmentShader: ppMaterialFS,
			depthTest: false,
			transparent: true
		});
	}

	get map() {
		return this.uniforms.map.value;
	}

	set map(texture) {
		this.uniforms.map.value = texture;
	}

	get progress() {
		return this.uniforms.progress.value;
	}

	set progress(val) {
		this.uniforms.progress.value = val;
	}

	get edgeProgress() {
		return this.uniforms.edgeProgress.value;
	}

	set edgeProgress(val) {
		this.uniforms.edgeProgress.value = val;
	}

	get isNext() {
		return this.uniforms.isNext.value;
	}

	set isNext(val) {
		this.uniforms.isNext.value = val;
	}

	resize(width, height) {
		this.uniforms.resolution.value.x = width;
		this.uniforms.resolution.value.y = height;
	}
}
