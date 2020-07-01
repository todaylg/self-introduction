import * as THREE from 'three';
import vertexShader from './shaders/button.vs';
import fragmentShader from './shaders/ringButton.fs';
import { computeMeshBoundingBox } from 'JS/Utils';

export class RingButton {
	constructor(section, layer, text, { width = 100, name = 'ringButton' } = {}) {
		this.text = text;
		this.name = name;
		this.section = section;
		this.fontGenerator = section.fontGenerator;
		this.layer = layer;
		this.width = width;
		this.height = width;

		this.container = new THREE.Group();
		this.initRing();
		this.initText();
		this.initHitArea();
	}

	initRing() {
		this.ringMaterial = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 0 },
				opacity: { value: 0 }
			},
			transparent: true,
			vertexShader,
			fragmentShader
		});
		let geometry = new THREE.PlaneBufferGeometry(this.width, this.height, 1, 1);
		this.ringMesh = new THREE.Mesh(geometry, this.ringMaterial);
		this.ringMesh.layers.set(this.layer);
		this.container.add(this.ringMesh);
	}

	initText() {
		let material = (this.textMaterial = this.fontGenerator.createFontMaterial(1));
		let textMesh = (this.textMesh = this.section.initTextMesh(this.text, material, this.container));
		textMesh.layers.set(this.layer);
		const textScale = 0.5;
		let titleMeshLength = computeMeshBoundingBox(textMesh).length.multiplyScalar(textScale);
		textMesh.scale.setScalar(textScale);
		textMesh.position.set(-titleMeshLength.x / 2, -titleMeshLength.y / 3, 0);
		this.container.add(this.textMesh);
	}

	initHitArea() {
		this.hitArea = this.ringMesh;
		this.hitArea.name = this.name;
	}

	get opacity() {
		return this.textMaterial.uniforms.opacity.value;
	}

	set opacity(val) {
		this.textMaterial.uniforms.opacity.value = val;
		this.ringMaterial.uniforms.opacity.value = val;
	}

	resize() {}

	update(time) {
		this.ringMaterial.uniforms.time.value += time;
	}
}
