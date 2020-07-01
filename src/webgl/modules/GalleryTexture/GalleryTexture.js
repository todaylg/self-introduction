import * as THREE from 'three';
import vertexShader from './shaders/noiseMask.vs';
import fragmentShader from './shaders/noiseMask.fs';

export class GalleryTexture {
	constructor(container, textures, opts = {}) {
		this.container = container;
		this.textures = textures;
		this.texWidth = textures[0].image.width;
		this.texHeight = textures[0].image.height;
		this.texAspect = this.texWidth / this.texHeight;
		this.width = opts.width || 5;
		this.height = this.width / this.texAspect;
		// this.height = this.width;

		this.uniforms = {
			uTime: {
				type: 'f',
				value: 0
			},
			uProgress: {
				type: 'f',
				value: 0
			},
			uTextures: {
				type: 't',
				value: textures
			}
		};
		this.init();
	}

	init() {
		const geometry = new THREE.PlaneBufferGeometry(this.width, this.height, 2, 2);
		const material = new THREE.RawShaderMaterial({
			uniforms: this.uniforms,
			vertexShader,
			fragmentShader,
			depthTest: false,
			transparent: true
		});
		this.mesh = new THREE.Mesh(geometry, material);
		this.container.add(this.mesh);
	}

	get material() {
		return this.mesh.material;
	}

	get progress() {
		return this.material.uniforms.uProgress.value;
	}

	set progress(val) {
		this.material.uniforms.uProgress.value = val;
	}

	swapTextures() {
		if (!this.material.uniforms.uTextures.value) return;
		let textures = this.material.uniforms.uTextures;
		let temp = textures.value[0];
		textures.value[0] = textures.value[1];
		textures.value[1] = temp;
	}

	setNextTexture(texture) {
		this.material.uniforms.uTextures.value[1] = texture;
	}

	resize() {}

	render(time) {
		this.uniforms.uTime.value += time;
	}
}
