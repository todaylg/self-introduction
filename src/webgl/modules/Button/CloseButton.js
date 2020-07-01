import * as THREE from 'three';
import vertexShader from './shaders/button.vs';
import fragmentShader from './shaders/closeButton.fs';

export class CloseButton {
	constructor(section, layer, { name = 'closeButton', width = 100 } = {}) {
		this.name = name;
		this.section = section;
		this.layer = layer;
		this.width = width;
		this.height = width;

		this.container = new THREE.Group();
		this.initRing();
		this.initHitArea();
	}

	initRing() {
		this.material = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 0 },
				opacity: { value: 0.0 }
			},
			transparent: true,
			vertexShader,
			fragmentShader
		});
		let geometry = new THREE.PlaneBufferGeometry(this.width, this.height, 1, 1);
		this.mesh = new THREE.Mesh(geometry, this.material);
		this.mesh.layers.set(this.layer);
		this.container.add(this.mesh);
	}

	initHitArea() {
		this.hitArea = this.mesh;
		this.hitArea.name = this.name;
	}

	get opacity() {
		return this.material.uniforms.opacity.value;
	}

	set opacity(val) {
		this.material.uniforms.opacity.value = val;
	}

	resize() {}

	update(time) {
		this.material.uniforms.time.value += time;
	}
}
