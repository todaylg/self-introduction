import * as THREE from 'three';
import { ScetionPPMaterial } from './ScetionPPMaterial';

export class Section {
	constructor(viewer) {
		this.name = 'section';
		this.visible = false;
		this.debug = false;
		this.postProcessingMaterial = new ScetionPPMaterial();

		this.viewer = viewer;
		this.isMobile = viewer.isMobile;
		this.renderer = viewer.renderer;
		this.state = viewer.state;
		this.eventHandler = viewer.eventHandler;
		this.assetLibrary = viewer.assetLibrary;

		this.width = this.viewer.width;
		this.height = this.viewer.height;

		this.layers = {
			SCENE_LAYER: 0,
			BG_LAYER: 1,
			TEX_LAYER: 2,
			UI_LAYER: 3
		};

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 700);
		this.camera.position.z = 10;
		this.scene.add(this.camera);

		this.uiScene = new THREE.Scene();
		this.uiCamera = new THREE.OrthographicCamera(-this.width, this.width, -this.height, this.height, 1, 100);
		this.uiCamera.position.z = 10;

		this.fontGenerator = this.viewer.fontGenerator;
	}

	entryAnime() {}

	precompile() {
		this.renderer.compile(this.scene, this.camera);
		this.renderer.compile(this.uiScene, this.uiCamera);
	}

	resize(width, height) {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	}

	whileVisible(order) {
		// console.log("whileVisible: ", order);
	}

	whileNoVisible(order) {
		// console.log("whileNoVisible: ", order);
	}

	initTextMesh(text, material, container) {
		const mesh = this.fontGenerator.createFontMesh(text, material);
		mesh.layers.set(this.layers.UI_LAYER);
		mesh.rotation.set(-Math.PI, 0, 0); // Spin to face correctly
		container = container || this.uiScene;
		container.add(mesh);
		return mesh;
	}
}
