// refer: https://github.com/brunoimbrizi/interactive-particles

import * as THREE from 'three';
import particleVS from './shaders/particle.vs';
import particleFS from './shaders/particle.fs';
import { ParticleInstance } from 'MODULES/Particle/ParticleInstance';
import TouchTexture from './TouchTexture';

export class ParticleTexture {
	constructor(section, texture, areaBounding) {
		this.container = new THREE.Object3D();
		this.texture = texture;
		this.section = section;
		this.layer = section.layers.UI_LAYER;
		this.viewer = section.viewer;
		this.eventHandler = this.viewer.eventHandler;
		this.areaBounding = areaBounding;

		this.touch = null;
		this.mouse = new THREE.Vector2();
		this.raycaster = new THREE.Raycaster();
		this.raycaster.layers.set(this.layer);
		this.intersectsArr = [];
		this.camera = section.uiCamera;
		this.init(texture);
	}

	init(texture) {
		this.texture = texture;
		this.texture.minFilter = THREE.LinearFilter;
		this.texture.magFilter = THREE.LinearFilter;
		this.texture.format = THREE.RGBFormat;

		this.width = texture.image.width;
		this.height = texture.image.height;
		this.initPoints();
		this.initHitArea();
		this.initTouch();
		this.initEvent();
	}

	initPoints() {
		this.numPoints = this.width * this.height;

		// discard pixels darker than threshold #22
		let numVisible = 0;
		let threshold = 1;
		let originalColors;

		const img = this.texture.image;
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		canvas.width = this.width;
		canvas.height = this.height;
		ctx.scale(1, -1);
		ctx.drawImage(img, 0, 0, this.width, this.height * -1);

		const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		originalColors = Float32Array.from(imgData.data);

		for (let i = 0; i < this.numPoints; i++) {
			if (originalColors[i * 4 + 0] > threshold) numVisible++;
		}

		const uniforms = {
			uTime: { value: 0 },
			uRandom: { value: 30.0 },
			uDepth: { value: 0 },
			uSize: { value: 0 }, // hide default
			uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
			uTexture: { value: this.texture },
			uTouch: { value: null }
		};

		const material = new THREE.RawShaderMaterial({
			uniforms,
			vertexShader: particleVS,
			fragmentShader: particleFS,
			depthTest: false,
			transparent: true
			// blending: THREE.AdditiveBlending
		});

		this.instanceMesh = new ParticleInstance(material).mesh;
		this.instanceMesh.layers.set(this.layer);
		const geometry = this.instanceMesh.geometry;

		const indices = new Uint16Array(numVisible);
		const offsets = new Float32Array(numVisible * 3);
		const angles = new Float32Array(numVisible);

		for (let i = 0, j = 0; i < this.numPoints; i++) {
			if (originalColors[i * 4 + 0] <= threshold) continue;

			offsets[j * 3 + 0] = i % this.width;
			offsets[j * 3 + 1] = Math.floor(i / this.width);

			indices[j] = i;

			angles[j] = Math.random() * Math.PI;

			j++;
		}

		geometry.setAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));
		geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));
		geometry.setAttribute('angle', new THREE.InstancedBufferAttribute(angles, 1, false));

		this.container.add(this.instanceMesh);
	}

	initHitArea() {
		const geometry = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, depthTest: false });
		material.visible = false;
		this.hitArea = new THREE.Mesh(geometry, material);
		this.hitArea.layers.set(this.layer);
		this.container.add(this.hitArea);
	}

	initTouch() {
		// create only once
		if (!this.touch) this.touch = new TouchTexture(this);
		this.instanceMesh.material.uniforms.uTouch.value = this.touch.texture;
	}

	initEvent() {
		this.intersectsArr.push(this.hitArea);
		this.eventHandler.onMouseMoveEvent.bind(this.onMouseMove.bind(this));
	}

	onMouseMove(event) {
		if (!this.viewer.preloadFinished || !this.section.visible) return;
		this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		// Bounding optimize hack
		if (this.areaBounding === 'left' && this.mouse.x > 0) return;
		if (this.areaBounding === 'right' && this.mouse.x < 0) return;

		this.raycaster.setFromCamera(this.mouse, this.camera);
		const intersects = this.raycaster.intersectObjects(this.intersectsArr);
		if (intersects.length > 0) {
			const uv = intersects[0].uv;
			if (this.touch) this.touch.addTouch(uv);
		}
	}

	update(delta) {
		if (this.touch) this.touch.update();
		this.instanceMesh.material.uniforms.uTime.value += delta;
	}

	get material() {
		return this.instanceMesh.material;
	}
}
