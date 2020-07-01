import * as THREE from 'three';
import vertexShader from './shaders/button.vs';
import fragmentShader from './shaders/rectangleButton.fs';
import { computeMeshBoundingBox } from 'JS/Utils';

export class RectangleButton {
	constructor(section, layer, text, { name = 'rectangleButton', width = 200 } = {}) {
		this.text = text;
		this.name = name;
		this.section = section;
		this.fontGenerator = section.fontGenerator;
		this.layer = layer;
		this.width = width;
		this.height = width;

		this.container = new THREE.Group();
		this.initRectangle();
		this.initText();
		this.initHitArea();
	}

	initRectangle() {
		this.rectangleMaterial = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 0 },
				opacity: { value: 0 }
			},
			transparent: true,
			vertexShader,
			fragmentShader
		});
		let geometry = new THREE.PlaneBufferGeometry(this.width, this.height, 1, 1);
		this.rectangleMesh = new THREE.Mesh(geometry, this.rectangleMaterial);
		this.rectangleMesh.layers.set(this.layer);
		this.container.add(this.rectangleMesh);
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
		this.hitArea = this.rectangleMesh;
		this.hitArea.name = this.name;
	}

	get opacity() {
		return this.textMaterial.uniforms.opacity.value;
	}

	set opacity(val) {
		this.textMaterial.uniforms.opacity.value = val;
		this.rectangleMaterial.uniforms.opacity.value = val;
	}

	resize() {}

	update(time) {
		this.rectangleMaterial.uniforms.time.value += time;
	}
}
