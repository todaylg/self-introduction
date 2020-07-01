import * as THREE from 'three';
import { Section } from '../common/Section';
import { AnimeNameTitle } from '../common/AnimeNameTitle';
import { BGUniformsConfig, TextUniformConfig, TextConfig, AnimeName, AnimeTitleUniforms } from './const/config';
import { computeMeshBoundingBox, clamp } from 'JS/Utils';
// Modules
import { BGMaterial } from 'MODULES/BGMaterial/BGMaterial';
import { PBRMaterial, PBRProgram } from 'MODULES/PBRMaterial/';
import { ParticleTexture } from 'MODULES/ParticleTexture/ParticleTexture';
import { ParticleSnow } from 'MODULES/ParticleSnow/ParticleSnow';
import { FXAAMaterial, VignetteMaterial } from 'MODULES/PostProcessing/';

import { gsap } from 'gsap';
import { initBGGUI, initAnimeTitleGUI } from '../common/InitGUI';
import * as dat from 'dat.gui';

export class HomeSection extends Section {
	constructor(viewer) {
		super(viewer);
		this.name = 'HomeSection';
		this.debug = 0;
		this.visible = true;
		this.scrollSpeed = 0.06;
		this.pbrProgram = new PBRProgram();
		this.envRotationMat = { value: new THREE.Matrix3() };
		this.cameraRotationMatrix = new THREE.Matrix4();
		// Left/Right Rotate limit
		this.sceneRotateXLimit = Math.PI / 6;

		this.cameraInitPos = new THREE.Vector3(1.3, 0, 2.4);
		this.cameraLookAtPos = new THREE.Vector3(-0.1, 0.4, 0);
		this.cameraTargetY = this.cameraInitPos.y;

		this.particleTextureArr = [];

		this.swordModel = null;
		this.swordModelInitPos = new THREE.Vector3(0, 20, 0);
		this.swordModelInitRotate = new THREE.Euler(Math.PI / 2, Math.PI, Math.PI);
	}

	init() {
		this.initBackground();
		let environment = this.assetLibrary.get('EnvMap-Industrial');
		let { sunlightInfo } = environment;
		this.loadSunLight(sunlightInfo);
		this.initCamera();
		// Load model
		let gltfScene = (this.gltfScene = this.assetLibrary.get('Model-FF7').scene);
		// console.log(gltfScene);
		this.scene.add(gltfScene);
		// Load Shader
		let { pbrVS, pbrFS } = this.pbrProgram.getPBRShader();
		// Replace PBR Material
		gltfScene.traverse(child => {
			if (child.name === 'Sword') this.swordModel = child;
			if (child.isMesh) {
				child.material = new PBRMaterial(child, environment, {
					pbrVS,
					pbrFS
				});
				child.material.uniforms.uEnvironmentTransform = this.envRotationMat;
			}
		});

		this.swordModel.position.copy(this.swordModelInitPos);
		this.swordModel.rotation.copy(this.swordModelInitRotate);
		if (!this.isMobile) this.initParticleTexture();
		this.initParticleSnow();
		this.initText();
		this.initPostprocessing();
		this.initEvent();

		if (this.debug) this.initGUI();
	}

	entryAnime(callBack) {
		// Sword
		gsap.to(this.swordModel.position, {
			y: 0,
			duration: 1,
			delay: 1,
			ease: 'power2.out'
		});
		gsap.to(this.swordModel.rotation, {
			x: Math.PI / 2,
			y: 0,
			z: 0,
			duration: 1,
			delay: 1,
			ease: 'power2.out'
		});
		// Post
		gsap.to(this.vignetteMaterial.uniforms.darkness, {
			value: 0.4,
			duration: 1.3,
			delay: 1.2,
			ease: 'power2.out'
		});
		// Camera
		gsap.to(this.camera.position, {
			z: 1.4,
			duration: 1.2,
			delay: 1.2,
			onUpdate: () => {
				this.camera.lookAt(this.cameraLookAtPos);
			}
		});
		// Particle
		gsap.delayedCall(1.8, () => {
			this.particleTextureArr.forEach(particleTexture => {
				if (particleTexture)
					gsap.to(particleTexture.material.uniforms.uSize, {
						value: 1.5,
						duration: 1
					});
			});
			// Text
			gsap.to(this.textMaterial.uniforms.opacity, {
				value: 1,
				delay: 0.2,
				duration: 1,
				ease: 'power2.out'
			});
			gsap.to(this.animeNameTitle.material.uniforms.opacity, {
				value: 1,
				delay: 0.2,
				duration: 1,
				ease: 'power2.out'
			});
			typeof callBack === 'function' && callBack();
		});
	}

	initCamera() {
		this.camera.position.copy(this.cameraInitPos);
		this.camera.lookAt(this.cameraLookAtPos);
	}

	initPostprocessing() {
		this.postScene = new THREE.Scene();
		this.postCamera = this.viewer.postCamera;
		this.postRenderTarget = this.viewer.postRenderTarget;
		this.postScreenMesh = new THREE.Mesh(this.viewer.screenGeometry);
		this.postScreenMesh.frustumCulled = false;
		this.postScene.add(this.postScreenMesh);

		let fxaaMaterial = (this.fxaaMaterial = new FXAAMaterial());
		let pixelRatio = this.viewer.dpr;
		fxaaMaterial.uniforms['resolution'].value.x = 1 / (this.width * pixelRatio);
		fxaaMaterial.uniforms['resolution'].value.y = 1 / (this.height * pixelRatio);

		this.vignetteMaterial = new VignetteMaterial({
			offset: .5,
			darkness: 1
		});
	}

	renderPost(renderTarget) {
		let inputTexture = renderTarget.texture;
		this.vignetteMaterial.uniforms.inputBuffer.value = inputTexture;
		this.postScene.overrideMaterial = this.vignetteMaterial;
		this.renderer.setRenderTarget(this.postRenderTarget);
		this.renderer.render(this.postScene, this.postCamera);

		this.fxaaMaterial.uniforms.inputBuffer.value = this.postRenderTarget.texture;
		this.postScene.overrideMaterial = this.fxaaMaterial;
		this.renderer.setRenderTarget(renderTarget);
		this.renderer.render(this.postScene, this.postCamera);
	}

	initParticleSnow() {
		this.particleSnow = new ParticleSnow(this);
	}

	initParticleTexture() {
		let cloudTexture = this.assetLibrary.get('Texture-Cloud');
		let cloudParticleTexture = new ParticleTexture(this, cloudTexture, 'left');
		this.particleTextureArr.push(cloudParticleTexture);

		let cloudParticleMesh = (this.cloudParticleMesh = cloudParticleTexture.container);
		cloudParticleMesh.position.set(-this.width / 2, 200, 0);
		this.uiScene.add(cloudParticleMesh);

		let aerithTexture = this.assetLibrary.get('Texture-Aerith');
		let aerithParticleTexture = new ParticleTexture(this, aerithTexture, 'right');
		this.particleTextureArr.push(aerithParticleTexture);

		let aerithParticleMesh = (this.aerithParticleMesh = aerithParticleTexture.container);
		aerithParticleMesh.position.set(this.width / 2, 180, 0);
		this.uiScene.add(aerithParticleMesh);
		this.enableParticleTexture = true;

		this.resizeParticleTexture(this.width, this.height);
	}

	resizeParticleTexture(width, height) {
		let { cloudParticleMesh, aerithParticleMesh } = this;
		const offsetWidth = -width / 3.5; // -width / 2 is left origin
		const offsetHeight = height / 5.5;
		cloudParticleMesh.position.set(offsetWidth, offsetHeight, 0);
		aerithParticleMesh.position.set(-offsetWidth, offsetHeight - 20, 0);
		// scale
		const scale = clamp(width / 900, 1.5, 2);
		cloudParticleMesh.scale.setScalar(scale);
		aerithParticleMesh.scale.setScalar(scale);
	}

	initText() {
		let material = (this.textMaterial = this.fontGenerator.createFontMaterial(0));
		material.uniforms.time = { value: 0.0 };
		// Apply text color
		Object.assign(material.uniforms, TextUniformConfig);

		this.titleMesh = this.initTextMesh(TextConfig.mainTitle, material);
		this.subTitleMesh = this.initTextMesh(TextConfig.subTitle, material);

		// AnimeName Text
		this.animeNameTitle = new AnimeNameTitle(this, AnimeName, AnimeTitleUniforms);

		this.resizeText(this.width, this.height);
	}

	resizeText(width, height) {
		if(!this.isMobile){
			this.resizeTextForPC(width, height);
		}else{
			this.resizeTextForMobile(width, height);
		}
		this.animeNameTitle.resize(width, height);
	}

	resizeTextForPC(width, height){
		let { titleMesh, subTitleMesh } = this;
		let titleMeshLength;
		const bottom = -height / 2.5; // -height / 2 is screen bottom
		const titleScale = clamp(width / 1000, 1.2, 1.8);
		titleMeshLength = computeMeshBoundingBox(titleMesh).length.x * titleScale;
		titleMesh.scale.setScalar(titleScale);
		titleMesh.position.set(-titleMeshLength / 2, bottom, 0);
		const subTitleScale = clamp(width / 2000, 0.6, 0.9);
		let subBBox = computeMeshBoundingBox(subTitleMesh).length.multiplyScalar(subTitleScale);
		titleMeshLength = subBBox.x;
		subTitleMesh.scale.setScalar(subTitleScale);
		subTitleMesh.position.set(-titleMeshLength / 2, bottom, 0);

		// Gap between title and subtitle
		titleMesh.position.y = bottom + subBBox.y + 50;
	}

	resizeTextForMobile(width, height){
		let { titleMesh, subTitleMesh } = this;
		let titleMeshLength;
		const bottom = -height / 3; // -height / 2 is screen bottom
		const titleScale = clamp(width / 500, .6, .8);
		titleMeshLength = computeMeshBoundingBox(titleMesh).length.x * titleScale;
		titleMesh.scale.setScalar(titleScale);
		titleMesh.position.set(-titleMeshLength / 2, bottom, 0);
		const subTitleScale = clamp(width / 1000, .3, .4);
		let subBBox = computeMeshBoundingBox(subTitleMesh).length.multiplyScalar(subTitleScale);
		titleMeshLength = subBBox.x;
		subTitleMesh.scale.setScalar(subTitleScale);
		subTitleMesh.position.set(-titleMeshLength / 2, bottom, 0);

		// Gap between title and subtitle
		titleMesh.position.y = bottom + subBBox.y + 40;
	}

	initGUI() {
		const gui = new dat.GUI();
		initBGGUI(gui, this.bgMaterial);
		initAnimeTitleGUI(gui, this.animeNameTitle.material);
		let textMaterialUniforms = this.textMaterial.uniforms;
		let params = {
			// Text
			textColor1: textMaterialUniforms.color1.value.getStyle(),
			textColor2: textMaterialUniforms.color2.value.getStyle(),
			textColor3: textMaterialUniforms.color3.value.getStyle(),
			textColor4: textMaterialUniforms.color4.value.getStyle()
		};
		// Text
		const textFolder = gui.addFolder('Text');
		textFolder
			.addColor(params, 'textColor1')
			.name('color1')
			.onChange(value => {
				textMaterialUniforms.color1.value.setStyle(value);
			});
		textFolder
			.addColor(params, 'textColor2')
			.name('color2')
			.onChange(value => {
				textMaterialUniforms.color2.value.setStyle(value);
			});
		textFolder
			.addColor(params, 'textColor3')
			.name('color3')
			.onChange(value => {
				textMaterialUniforms.color3.value.setStyle(value);
			});
		textFolder
			.addColor(params, 'textColor4')
			.name('color4')
			.onChange(value => {
				textMaterialUniforms.color4.value.setStyle(value);
			});
		textFolder.open();
	}

	loadSunLight(sunlightInfo) {
		if (!this.sunLight) this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
		this.sunLight.position.copy(sunlightInfo.position);
		this.scene.add(this.sunLight);
	}

	initBackground() {
		let bgMaterial = (this.bgMaterial = new BGMaterial(BGUniformsConfig));
		let bgMesh = new THREE.Mesh(this.viewer.screenGeometry, bgMaterial);
		bgMesh.layers.set(this.layers.BG_LAYER);
		this.scene.add(bgMesh);
	}

	updateEnvironmentRotation() {
		// Sync camera roatation to Environment
		this.cameraRotationMatrix.makeRotationFromQuaternion(this.camera.quaternion);
		this.envRotationMat.value.setFromMatrix4(this.cameraRotationMatrix);
	}

	initEvent() {
		if(!this.isMobile){
			this.eventHandler.onMouseMoveEvent.bind(this.onMouseMove.bind(this));
		}else{
			this.eventHandler.onTouchMoveEvent.bind(this.onMouseMove.bind(this));
		}
	}

	onMouseMove(event) {
		if (!this.viewer.preloadFinished || !this.visible) return;
		let positionNormX = this.state.pointer.positionNorm[0] - 0.5;
		let sceneRoationTarget = positionNormX * this.sceneRotateXLimit;
		// Small rotation for particleTexture
		let textureRoationTarget = sceneRoationTarget / 10;

		gsap.killTweensOf(this.gltfScene.rotation);
		gsap.to(this.gltfScene.rotation, {
			y: sceneRoationTarget,
			duration: 0.5,
			ease: 'power2.out'
		});
		if (this.enableParticleTexture) {
			gsap.killTweensOf(this.aerithParticleMesh.rotation);
			gsap.killTweensOf(this.cloudParticleMesh.rotation);
			gsap.to(this.aerithParticleMesh.rotation, {
				y: textureRoationTarget,
				duration: 0.5,
				ease: 'power2.out'
			});
			gsap.to(this.cloudParticleMesh.rotation, {
				y: textureRoationTarget,
				duration: 0.5,
				ease: 'power2.out'
			});
		}
	}

	whileVisible(order) {
		let cameraPos = this.camera.position;
		gsap.killTweensOf(cameraPos);
		if (order === 'pre') {
			gsap.fromTo(cameraPos, { y: -0.2 }, { y: 0, duration: this.viewer.scrollAnimeDuration });
		} else {
			gsap.fromTo(cameraPos, { y: 0.35 }, { y: 0, duration: this.viewer.scrollAnimeDuration });
		}
		gsap.to(this.animeNameTitle.material.uniforms.opacity, {
			value: 1,
			duration: 1,
			delay: 1,
			ease: 'power2.out'
		});
	}

	whileNoVisible(order) {
		let cameraPos = this.camera.position;
		gsap.killTweensOf(cameraPos);
		if (order === 'pre') {
			gsap.fromTo(cameraPos, { y: 0 }, { y: 0.35, duration: this.viewer.scrollAnimeDuration });
		} else {
			gsap.fromTo(cameraPos, { y: 0 }, { y: -0.2, duration: this.viewer.scrollAnimeDuration });
		}
		gsap.to(this.animeNameTitle.material.uniforms.opacity, {
			value: 0,
			duration: 1,
			ease: 'power2.out'
		});
	}

	resize(width, height, dpr) {
		const pixelWidth = width * dpr;
		const pixelHeight = height * dpr;
		this.postProcessingMaterial.resize(pixelWidth, pixelHeight);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.uiCamera.left = -width / 2;
		this.uiCamera.right = width / 2;
		this.uiCamera.top = height / 2;
		this.uiCamera.bottom = -height / 2;
		this.uiCamera.updateProjectionMatrix();
		// FXAA
		this.fxaaMaterial.uniforms['resolution'].value.x = 1 / pixelWidth;
		this.fxaaMaterial.uniforms['resolution'].value.y = 1 / pixelHeight;

		if (this.enableParticleTexture) this.resizeParticleTexture(width, height);
		this.resizeText(width, height);
	}

	render({ renderer, orthoCamera, target, deltaTime } = {}) {
		if (!this.visible) return;
		this.updateEnvironmentRotation();
		this.textMaterial.uniforms.time.value += deltaTime;
		this.animeNameTitle.render(deltaTime);
		// BG
		orthoCamera.layers.set(this.layers.BG_LAYER);
		renderer.render(this.scene, orthoCamera);
		// Scene
		if (this.particleSnow) this.particleSnow.render(deltaTime);
		renderer.render(this.scene, this.camera);
		this.renderPost(target);
		// UI
		this.uiCamera.layers.set(this.layers.UI_LAYER);
		this.particleTextureArr.forEach(particleTexture => {
			particleTexture.update(deltaTime);
		});
		renderer.render(this.uiScene, this.uiCamera);
	}
}
