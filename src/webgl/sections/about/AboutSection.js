import * as THREE from 'three';
import { Section } from '../common/Section';
import { AnimeNameTitle } from '../common/AnimeNameTitle';
import { TextUniformConfig, TextConfig, AnimeName, AnimeTitleUniforms } from './const/config';
import { computeMeshBoundingBox, clamp } from 'JS/Utils';
// Modules
import { TextureBG } from 'MODULES/TextureBG/TextureBG';
import { ParticleChip } from 'MODULES/ParticleChip/ParticleChip';
import { RectangleButton, CloseButton } from 'MODULES/Button/';
import { BlurMaterial } from 'MODULES/PostProcessing/';
import { gsap } from 'gsap';

import { initAnimeTitleGUI } from '../common/InitGUI';
import * as dat from 'dat.gui';

export class AboutSection extends Section {
	constructor(viewer) {
		super(viewer);
		this.name = 'AboutSection';
		this.debug = 0;

		this.cameraInitPos = new THREE.Vector3(0, 0, 2);
		this.cameraLookAtPos = new THREE.Vector3(0, 0, 0);

		this.intersectsArr = [];
		this.intersects = []; // intersect result
		this.raycaster = new THREE.Raycaster();
		this.raycaster.layers.set(this.layers.UI_LAYER);
		this.isOpenContactPanel = false;
		this.blurIterations = {
			start: 0,
			target: 3,
			value: 0
		};

		this.clickNDCPos = new THREE.Vector2();
	}

	init() {
		this.initCamera();
		this.initBackground();
		this.initParticleChip();
		this.initText();
		this.initUIPanel();
		this.initPostprocessing();
		this.initEvent();

		if (this.debug) this.initGUI();
	}

	initGUI() {
		const gui = new dat.GUI();
		initAnimeTitleGUI(gui, this.animeNameTitle.material);
		let textMaterial = this.textMaterial;
		console.log(this.textMaterial);
		let params = {
			// Text
			textTopColor: textMaterial.uniforms.topColor.value.getStyle(),
			textBottomColor: textMaterial.uniforms.bottomColor.value.getStyle()
		};
		// Text
		const textFolder = gui.addFolder('Text');
		textFolder
			.addColor(params, 'textTopColor')
			.name('topColor')
			.onChange(value => {
				textMaterial.uniforms.topColor.value.setStyle(value);
			});
		textFolder
			.addColor(params, 'textBottomColor')
			.name('bottomColor')
			.onChange(value => {
				textMaterial.uniforms.bottomColor.value.setStyle(value);
			});
		textFolder.open();
	}

	initPostprocessing() {
		this.postScene = new THREE.Scene();
		this.postCamera = this.viewer.postCamera;
		this.postRenderTarget = this.viewer.postRenderTarget.clone();
		this.postScreenMesh = new THREE.Mesh(this.viewer.screenGeometry);
		this.postScreenMesh.frustumCulled = false;
		this.postScene.add(this.postScreenMesh);

		this.blurVerticalMaterial = new BlurMaterial({
			direction: new THREE.Vector2(0, 1)
		});
		this.blurHorizontalMaterial = new BlurMaterial({
			direction: new THREE.Vector2(1, 0)
		});
	}

	renderPost(renderTarget) {
		// if(!this.isOpenContactPanel) return;
		let blurIterations = this.blurIterations.value;
		if (blurIterations < 0.1) return;
		for (let i = 0; i < blurIterations; i++) {
			let inputTexture = renderTarget.texture;
			this.blurVerticalMaterial.uniforms.inputBuffer.value = inputTexture;
			this.blurVerticalMaterial.uniforms.direction.value.setY(blurIterations - i + 1);
			this.postScene.overrideMaterial = this.blurVerticalMaterial;
			this.renderer.setRenderTarget(this.postRenderTarget);
			this.renderer.render(this.postScene, this.postCamera);

			this.blurHorizontalMaterial.uniforms.inputBuffer.value = this.postRenderTarget.texture;
			this.blurHorizontalMaterial.uniforms.direction.value.setX(blurIterations - i + 1);
			this.postScene.overrideMaterial = this.blurHorizontalMaterial;
			this.renderer.setRenderTarget(renderTarget);
			this.renderer.render(this.postScene, this.postCamera);
		}
	}

	initUIPanel() {
		// Contact Button
		this.contactBtn = new RectangleButton(this, this.layers.UI_LAYER, 'Contact Me');
		this.contactBtn.container.scale.setScalar(0.8);
		this.uiScene.add(this.contactBtn.container);
		// Close Btn
		this.closeBtn = new CloseButton(this, this.layers.UI_LAYER);
		let closeContainer = this.closeBtn.container;
		const closeBtnScale = 0.45;
		this.closeBtnBox = computeMeshBoundingBox(this.closeBtn.mesh).length.multiplyScalar(closeBtnScale);
		closeContainer.scale.setScalar(closeBtnScale);

		this.uiScene.add(closeContainer);
		this.resizeUIPanel(this.width, this.height);
	}

	resizeUIPanel(width, height) {
		if(!this.isMobile){
			this.contactBtn.container.position.set(-width / 3, -height / 4, 0);
		}else{
			this.contactBtn.container.position.set(-width / 3.5, height / 2.5, 0);
		}
		let closeContainer = this.closeBtn.container;
		const topOffset = height / 2 - this.closeBtnBox.y / 2 - 20;
		const leftOffset = width / 2 - this.closeBtnBox.x / 2 - 20;
		closeContainer.position.set(leftOffset, topOffset, 0);
	}

	initCamera() {
		this.camera.position.copy(this.cameraInitPos);
		this.camera.lookAt(this.cameraLookAtPos);
	}

	initParticleChip() {
		this.particleChip = new ParticleChip(this.scene);
	}

	initText() {
		let material = (this.textMaterial = this.fontGenerator.createFontMaterial(1));
		material.uniforms.time = { value: 0.0 };
		// Apply text color
		Object.keys(TextUniformConfig).map(key => {
			material.uniforms[`${key}`] = { value: TextUniformConfig[key].clone() };
		});

		this.titleMesh = this.initTextMesh(TextConfig.mainTitle, material);
		this.subTitleMesh = this.initTextMesh(TextConfig.subTitle, material);
		this.animeNameTitle = new AnimeNameTitle(this, AnimeName, AnimeTitleUniforms);
		this.resizeText(this.width, this.height);
	}

	resizeText(width, height) {
		if (!this.isMobile) {
			this.resizeTextForPC(width, height);
		} else {
			this.resizeTextForMobile(width, height);
		}

		this.animeNameTitle.resize(width, height);
	}

	resizeTextForPC(width, height) {
		let { titleMesh, subTitleMesh } = this;
		const topOffset = height / 4;
		const leftOffset = -width / 2.25;
		const titleScale = clamp(width / 1000, 1.2, 1.4);
		titleMesh.scale.setScalar(titleScale);
		titleMesh.position.set(leftOffset, topOffset, 0);

		const subTitleScale = clamp(width / 2000, 0.4, 0.6);
		let subBBox = computeMeshBoundingBox(subTitleMesh).length.multiplyScalar(subTitleScale);
		subTitleMesh.scale.setScalar(subTitleScale);
		subTitleMesh.position.set(leftOffset, topOffset, 0);

		// Gap between title and subtitle
		subTitleMesh.position.y = topOffset - subBBox.y - 20;
	}

	resizeTextForMobile(width, height) {
		let { titleMesh, subTitleMesh } = this;
		const topOffset = -height / 5;
		const leftOffset = -width / 2.25;
		const titleScale = clamp(width / 500, 0.7, 0.9);
		titleMesh.scale.setScalar(titleScale);
		titleMesh.position.set(leftOffset, topOffset, 0);

		const subTitleScale = clamp(width / 1000, 0.35, 0.45);
		let subBBox = computeMeshBoundingBox(subTitleMesh).length.multiplyScalar(subTitleScale);
		subTitleMesh.scale.setScalar(subTitleScale);
		subTitleMesh.position.set(leftOffset, topOffset, 0);

		// Gap between title and subtitle
		subTitleMesh.position.y = topOffset - subBBox.y - 20;
	}

	initBackground() {
		let texture = this.assetLibrary.get('Texture-OnePunch1');
		// let texture = this.assetLibrary.get('Texture-Wuyu1');
		let bgMesh = (this.bgMesh = new TextureBG(texture, this.postProcessingMaterial));
		bgMesh.layers.set(this.layers.BG_LAYER);
		this.scene.add(bgMesh);
	}

	whileVisible(order) {
		let cameraPos = this.camera.position;
		let textOpacity = this.textMaterial.uniforms.opacity;
		gsap.killTweensOf(cameraPos);
		if (order === 'pre') {
			gsap.fromTo(cameraPos, { y: -0.5 }, { y: 0, duration: this.viewer.scrollAnimeDuration });
		} else {
			gsap.fromTo(cameraPos, { y: 0.5 }, { y: 0, duration: this.viewer.scrollAnimeDuration });
		}
		gsap.fromTo(textOpacity, { value: 0 }, { value: 1, duration: 1.5, delay: 0.5, ease: 'power2.out' });
		gsap.to(this.animeNameTitle.material.uniforms.opacity, { value: 1, duration: 1, delay: 1, ease: 'power2.out' });
		gsap.fromTo(
			this.bgMesh.material.uniforms.vignetteDarkness,
			{ value: 1 },
			{ value: 0.6, duration: 1.5, delay: 0.8, ease: 'power2.out' }
		);
		gsap.to(this.contactBtn, { opacity: 0.8, duration: 1.5, delay: 0.5, ease: 'power2.out' });
	}

	whileNoVisible(order) {
		let cameraPos = this.camera.position;
		let textOpacity = this.textMaterial.uniforms.opacity;
		gsap.killTweensOf(cameraPos);
		if (order === 'pre') {
			gsap.fromTo(cameraPos, { y: 0 }, { y: 0.5, duration: this.viewer.scrollAnimeDuration });
		} else {
			gsap.fromTo(cameraPos, { y: 0 }, { y: -0.5, duration: this.viewer.scrollAnimeDuration });
		}
		gsap.fromTo(textOpacity, { value: 1 }, { value: 0, duration: 0.5, ease: 'power2.out' });
		gsap.to(this.animeNameTitle.material.uniforms.opacity, { value: 0, duration: 1, ease: 'power2.out' });
		gsap.to(this.contactBtn, { opacity: 0.0, duration: 0.8, ease: 'power2.out' });
		// Close
		if (this.isOpenContactPanel) this.closeContactPanel();
	}

	openContactPanel() {
		if (this.isOpenContactPanel) return;
		this.isOpenContactPanel = true;
		const duration = 1;
		// 1.Blur BG
		gsap.fromTo(
			this.blurIterations,
			{ value: this.blurIterations.start },
			{ value: this.blurIterations.target, duration, ease: 'power2.out' }
		);
		// 2.Button Animation
		gsap.to(this.contactBtn, {
			opacity: 0,
			duration,
			ease: 'power2.out',
			onComplete: () => {
				this.contactBtn.visible = false;
			}
		});
		this.closeBtn.visible = true;
		gsap.to(this.closeBtn, { opacity: 0.5, duration, ease: 'power2.out' });
		this.intersectsArr = [this.closeBtn.hitArea];
		// 3.Text
		let textOpacity = this.textMaterial.uniforms.opacity;
		gsap.fromTo(textOpacity, { value: 1 }, { value: 0, duration, ease: 'power2.out' });
		gsap.to(this.animeNameTitle.material.uniforms.opacity, { value: 0, duration, ease: 'power2.out' });
		// 4.2D
		this.viewer.toggleConactPanle(true);
	}

	closeContactPanel() {
		if (!this.isOpenContactPanel) return;
		this.isOpenContactPanel = false;
		const duration = 1;
		// 1.Blur BG
		gsap.fromTo(
			this.blurIterations,
			{ value: this.blurIterations.target },
			{ value: this.blurIterations.start, duration, ease: 'power2.out' }
		);
		// 2.Button Animation
		this.contactBtn.visible = true;
		gsap.to(this.contactBtn, {
			opacity: 0.8,
			duration,
			ease: 'power2.out'
		});
		gsap.to(this.closeBtn, {
			opacity: 0,
			duration,
			ease: 'power2.out',
			onComplete: () => {
				this.closeBtn.visible = false;
			}
		});
		this.intersectsArr = [this.contactBtn.hitArea];
		// 3.Text
		let textOpacity = this.textMaterial.uniforms.opacity;
		gsap.fromTo(textOpacity, { value: 0 }, { value: 1, duration, ease: 'power2.out' });
		gsap.to(this.animeNameTitle.material.uniforms.opacity, { value: 1, duration, ease: 'power2.out' });
		// 4.2D
		this.viewer.toggleConactPanle(false);
	}

	initEvent() {
		if (!this.isMobile) this.eventHandler.onMouseMoveEvent.bind(this.onMouseMove.bind(this));
		this.intersectsArr.push(this.contactBtn.hitArea);
		this.eventHandler.onClickEvent.bind(this.onClick.bind(this));
	}

	onClick() {
		if (!this.visible) return;
		if (this.isMobile) {
			let x = event.clientX;
			let y = event.clientY;
			this.clickNDCPos.set((x / window.innerWidth) * 2 - 1, (-y / window.innerHeight) * 2 + 1);
			console.log(this.clickNDCPos);
			this.raycaster.setFromCamera(this.clickNDCPos, this.uiCamera);
			this.intersects = this.raycaster.intersectObjects(this.intersectsArr);
		}
		if (!this.intersects.length) return;
		let intersectsRes = this.intersects[0].object;
		if (intersectsRes.name === 'rectangleButton') {
			this.openContactPanel();
		} else if (intersectsRes.name === 'closeButton') {
			this.closeContactPanel();
		}
	}

	onMouseMove() {
		if (!this.visible) return;
		this.raycaster.setFromCamera(this.state.pointer.ndcPosition, this.uiCamera);
		this.intersects = this.raycaster.intersectObjects(this.intersectsArr);
		if (this.intersects.length > 0) {
			document.body.setAttribute('cursor', 'pointer');
		} else {
			document.body.removeAttribute('cursor');
		}
	}

	resize(width, height, dpr) {
		const pixelWidth = width * dpr;
		const pixelHeight = height * dpr;
		this.postProcessingMaterial.resize(pixelWidth, pixelHeight);
		this.postRenderTarget.setSize(pixelWidth, pixelHeight);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.uiCamera.left = -width / 2;
		this.uiCamera.right = width / 2;
		this.uiCamera.top = height / 2;
		this.uiCamera.bottom = -height / 2;
		this.uiCamera.updateProjectionMatrix();
		this.bgMesh.resize(width, height);
		this.resizeText(width, height);
		this.resizeUIPanel(width, height);
	}

	render({ renderer, orthoCamera, target, deltaTime } = {}) {
		if (!this.visible) return;
		// BG
		orthoCamera.layers.set(this.layers.BG_LAYER);
		renderer.render(this.scene, orthoCamera);
		// Scene
		if (this.particleChip) this.particleChip.render(deltaTime);
		renderer.render(this.scene, this.camera);

		this.renderPost(target);
		// UI
		if (this.isOpenContactPanel) {
			this.closeBtn.update(deltaTime);
		} else {
			this.contactBtn.update(deltaTime);
		}
		this.uiCamera.layers.set(this.layers.UI_LAYER);
		renderer.render(this.uiScene, this.uiCamera);
	}
}
