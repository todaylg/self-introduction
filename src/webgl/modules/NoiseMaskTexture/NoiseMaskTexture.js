import * as THREE from 'three';
import vertexShader from './shaders/noiseMask.vs';
import fragmentShader from './shaders/noiseMask.fs';

export class NoiseMaskTexture {
	constructor(container, texture, opts = {}) {
		this.container = container;
		this.texWidth = texture.image.width;
		this.texHeight = texture.image.height;
		this.texAspect = this.texWidth / this.texHeight;
		this.width = opts.width || 5;
		this.height = this.width / this.texAspect;
		// this.height = this.width;

		this.uniforms = {
			uTime: {
				type: 'f',
				value: 0
			},
			uTexture: {
				type: 't',
				value: texture
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

	resize() {}

	render(time) {
		this.uniforms.uTime.value += time;
	}
}
