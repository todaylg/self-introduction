import * as THREE from 'three';
import vertexShader from './shaders/image.vs';
import fragmentShader from './shaders/image.fs';

export class TextureBG extends THREE.Mesh {
	constructor(texture, ppMaterial, opts = {}) {
		let imageWidth = texture.image.width;
		let imageHeight = texture.image.height;
		const geometry = new THREE.PlaneBufferGeometry(2, 2);
		const material = new THREE.RawShaderMaterial({
			uniforms: {
				time: {
					type: 'f',
					value: 0
				},
				progress: {
					type: 'f',
					value: 0
				},
				resolution: {
					type: 'v2',
					value: new THREE.Vector2(window.innerWidth, window.innerHeight)
				},
				imageResolution: {
					type: 'v2',
					value: new THREE.Vector2(imageWidth, imageHeight)
				},
				texture: {
					type: 't',
					value: texture
				},
				isNext: { value: false },
				uvTransformSpeed: {
					type: 'v2',
					value: opts.uvTransformSpeed || new THREE.Vector2(2, 2)
				},
				opacity: { value: 1.0 },
				vignetteDarkness: { value: 1 },
				vignetteOffset: { value: 0.2 }
			},
			vertexShader,
			fragmentShader,
			transparent: true,
			depthTest: false,
			depthWrite: false
		});
		super(geometry, material);
		this.name = 'TextureBGMesh';

		// Sync postProcessingMaterial
		material.uniforms.progress = ppMaterial.uniforms.progress;
		material.uniforms.isNext = ppMaterial.uniforms.isNext;
	}

	update(time) {
		this.material.uniforms.time.value += time;
	}

	resize(width, height) {
		this.material.uniforms.resolution.value.set(width, height);
	}
}
