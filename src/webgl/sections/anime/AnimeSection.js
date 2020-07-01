import * as THREE from 'three';
import { Section } from '../common/Section';
import { AnimeNameTitle } from '../common/AnimeNameTitle';
import {
	BGUniformsConfig,
	ParticleUniformsConfig,
	TextUniformConfigList,
	GalleryConfig,
	TextConfig,
	AnimeNameList,
	AnimeTitleUniformsList
} from './const/config';
import { computeMeshBoundingBox, clamp } from 'JS/Utils';
// Modules
import { BGMaterial } from 'MODULES/BGMaterial/BGMaterial';
import { GalleryTexture } from 'MODULES/GalleryTexture/GalleryTexture';
import { ParticlePolygon } from 'MODULES/ParticlePolygon/ParticlePolygon';
import { ArrowButton } from 'MODULES/Button/';

import { gsap } from 'gsap';
import { initBGGUI, initAnimeTitleGUI } from '../common/InitGUI';
import * as dat from 'dat.gui';

export class AnimeSection extends Section {
	constructor(viewer) {
		super(viewer);
		this.name = 'AnimeSection';
		this.debug = 0;

		this.sceneRotateXLimit = Math.PI / 9;
		this.rotateGroup = new THREE.Group();
		this.scene.add(this.rotateGroup);

		this.cameraInitPos = new THREE.Vector3(0, 0, 100);
		this.cameraLookAtPos = new THREE.Vector3(0, 0, 0);

		this.intersectsArr = [];
		this.intersects = []; // intersect result
		this.raycaster = new THREE.Raycaster();
		this.raycaster.layers.set(this.layers.UI_LAYER);

		this.curAnimeIndex = 0;
		this.animeProgress = { value: 0 };
		this.animeDuration = 2;
		this.isAnimeChanging = false;

		this.clickNDCPos = new THREE.Vector2();
	}

	init() {
		this.initBackground();
		this.initParticles();
		this.initCamera();
		this.initGalleryTextures();
		this.initText();
		this.initUIPanel();
		this.initEvent();

		if (this.debug) this.initGUI();
	}

	initUIPanel() {
		// Close Btn
		this.arrowBtn = new ArrowButton(this, this.layers.UI_LAYER);
		let arrowContainer = this.arrowBtn.container;
		const arrowBtnScale = 0.4;
		this.arrowBtnBox = computeMeshBoundingBox(this.arrowBtn.mesh).length.multiplyScalar(arrowBtnScale);
		arrowContainer.scale.setScalar(arrowBtnScale);
		this.uiScene.add(arrowContainer);
		this.resizeUIPanel(this.width, this.height);
	}

	resizeUIPanel(width, height) {
		let arrowContainer = this.arrowBtn.container;
		const topOffset = 0;
		const leftOffset = width / 2 - this.arrowBtnBox.x / 2;
		arrowContainer.position.set(leftOffset, topOffset, 0);
	}

	initText() {
		let material = (this.textMaterial = this.fontGenerator.createFontMaterial(1));
		material.uniforms.time = { value: 0.0 };
		// Apply text color
		let initTextUniforms = TextUniformConfigList[0];
		Object.keys(initTextUniforms).map(key => {
			material.uniforms[`${key}`] = { value: initTextUniforms[key].clone() };
		});

		this.titleMesh = this.initTextMesh(TextConfig.mainTitle, material);
		this.subTitleMesh = this.initTextMesh(TextConfig.subTitle, material);

		this.animeNameTitleList = new Array(AnimeNameList.length).fill().map((ele, index) => {
			return new AnimeNameTitle(this, AnimeNameList[index], AnimeTitleUniformsList[index]);
		});

		this.resizeText(this.width, this.height);
	}

	resizeText(width, height) {
		if (!this.isMobile) {
			this.resizeTextForPC(width, height);
		} else {
			this.resizeTextForMobile(width, height);
		}
		this.animeNameTitleList[this.curAnimeIndex].resize(width, height);
	}

	resizeTextForPC(width, height) {
		let { titleMesh, subTitleMesh } = this;
		const topOffset = height / 4;
		const leftOffset = -width / 2.25;
		const titleScale = clamp(width / 1000, 1.2, 1.4);
		titleMesh.scale.setScalar(titleScale);
		titleMesh.position.set(leftOffset, topOffset, 0);

		const subTitleScale = clamp(width / 2000, 0.6, 0.7);
		let subBBox = computeMeshBoundingBox(subTitleMesh).length.multiplyScalar(subTitleScale);
		subTitleMesh.scale.setScalar(subTitleScale);
		subTitleMesh.position.set(leftOffset, topOffset, 0);

		// Gap between title and subtitle
		subTitleMesh.position.y = topOffset - subBBox.y - 20;
	}

	resizeTextForMobile(width, height) {
		let { titleMesh, subTitleMesh } = this;
		const topOffset = height / 2.5;
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

	initCamera() {
		this.camera.position.copy(this.cameraInitPos);
		this.camera.lookAt(this.cameraLookAtPos);
	}

	initParticles() {
		this.particles = new ParticlePolygon(this.rotateGroup);
		this.particles.color = ParticleUniformsConfig[0].color.clone();
	}

	initGalleryTextures() {
		this.galleryTextures = [];
		let textureArray1 = [this.assetLibrary.get(GalleryConfig.galleryTexture1[0]), null];
		let textureArray2 = [this.assetLibrary.get(GalleryConfig.galleryTexture2[0]), null];
		let galleryTexture1 = (this.galleryTexture1 = new GalleryTexture(this.rotateGroup, textureArray1, {
			width: 100
		}));
		galleryTexture1.mesh.layers.set(this.layers.TEX_LAYER);

		let galleryTexture2 = (this.galleryTexture2 = new GalleryTexture(this.rotateGroup, textureArray2, {
			width: 50
		}));
		galleryTexture2.mesh.layers.set(this.layers.TEX_LAYER);

		// Once
		galleryTexture1.material.uniforms.uProgress = this.animeProgress;
		galleryTexture2.material.uniforms.uProgress = this.animeProgress;

		this.galleryTextures.push(galleryTexture1);
		this.galleryTextures.push(galleryTexture2);

		this.resizeGalleryTextures(this.width, this.height);
	}

	resizeGalleryTextures(width, height) {
		let { galleryTexture1, galleryTexture2 } = this;
		if (!this.isMobile) {
			galleryTexture1.mesh.scale.setScalar(clamp(width / 1800, 0.8, 1.2));
			galleryTexture1.mesh.position.x = 30 * galleryTexture1.mesh.scale.x;
			galleryTexture1.mesh.position.y = 10 * galleryTexture1.mesh.scale.x;

			galleryTexture2.mesh.scale.setScalar(clamp(width / 1800, 0.8, 1.2));
			galleryTexture2.mesh.position.y = -20 * galleryTexture1.mesh.scale.x;
			galleryTexture2.mesh.position.x = -30 * galleryTexture1.mesh.scale.x;
		} else {
			galleryTexture1.mesh.scale.setScalar(clamp(width / 800, 0.5, 0.8));
			galleryTexture1.mesh.position.x = 5 * galleryTexture1.mesh.scale.x;
			// galleryTexture1.mesh.position.y = 0 * galleryTexture1.mesh.scale.x;

			galleryTexture2.mesh.scale.setScalar(clamp(width / 800, 0.5, 0.8));
			galleryTexture2.mesh.position.y = -50 * galleryTexture1.mesh.scale.x;
			galleryTexture2.mesh.position.x = -10 * galleryTexture1.mesh.scale.x;
		}
	}

	initGUI() {
		const gui = new dat.GUI();
		initBGGUI(gui, this.bgMaterial);
		initAnimeTitleGUI(gui, this.animeNameTitleList[this.curAnimeIndex].material);
		let { particles, textMaterial } = this;
		let params = {
			// Particle
			particleColor: particles.color.getStyle(),
			particleSize: particles.size,
			// Text
			textTopColor: textMaterial.uniforms.topColor.value.getStyle(),
			textBottomColor: textMaterial.uniforms.bottomColor.value.getStyle()
		};
		// Particle
		const particleFolder = gui.addFolder('Particle');
		particleFolder
			.addColor(params, 'particleColor')
			.name('color')
			.onChange(value => {
				particles.color.setStyle(value);
			});
		particleFolder
			.add(params, 'particleSize', 0, 5)
			.name('size')
			.onChange(value => {
				particles.size = value;
			});
		particleFolder.open();
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

	initBackground() {
		let bgMaterial = (this.bgMaterial = new BGMaterial(BGUniformsConfig[0]));
		let bgMesh = new THREE.Mesh(this.viewer.screenGeometry, bgMaterial);
		bgMesh.layers.set(this.layers.BG_LAYER);
		this.scene.add(bgMesh);
	}

	swapAnime() {
		if (this.isAnimeChanging) return;
		this.isAnimeChanging = true;
		gsap.killTweensOf(this.animeNameTitleList[this.curAnimeIndex].material.uniforms.opacity);
		// Set next anime index
		let nextAnimeIndex = (this.curAnimeIndex + 1) % GalleryConfig.galleryTexture1.length;
		let tempCurAnimeIndex = this.curAnimeIndex;
		this.curAnimeIndex = nextAnimeIndex;
		this.galleryTextures.forEach((galleryTexture, index) => {
			let config = GalleryConfig[`galleryTexture${index + 1}`];
			galleryTexture.setNextTexture(this.assetLibrary.get(config[nextAnimeIndex]));
		});
		// Animation
		// galleryTextures Animation
		gsap.fromTo(
			this.animeProgress,
			{ value: 0 },
			{
				value: 1,
				duration: this.animeDuration,
				ease: 'power2.out',
				onComplete: () => {
					this.galleryTextures.forEach(galleryTexture => {
						galleryTexture.swapTextures();
					});
					gsap.set(this.animeProgress, { value: 0 });
					this.isAnimeChanging = false;
				}
			}
		);
		// BG Animation
		let nextBGUniforms = BGUniformsConfig[nextAnimeIndex];
		Object.keys(nextBGUniforms).map(key => {
			if (typeof nextBGUniforms[`${key}`] === 'number') {
				gsap.to(this.bgMaterial.uniforms[`${key}`], {
					duration: this.animeDuration,
					ease: 'power2.out',
					value: nextBGUniforms[`${key}`]
				});
			} else {
				gsap.to(this.bgMaterial.uniforms[`${key}`].value, {
					duration: this.animeDuration,
					ease: 'power2.out',
					...nextBGUniforms[`${key}`]
				});
			}
		});
		// Particle Animation
		let nextParticleUniforms = ParticleUniformsConfig[nextAnimeIndex];
		gsap.to(this.particles.color, {
			duration: this.animeDuration,
			ease: 'power2.out',
			...nextParticleUniforms.color
		});
		this.particles.type = nextAnimeIndex;
		// Text Animation
		let nextTextUniforms = TextUniformConfigList[nextAnimeIndex];
		Object.keys(nextTextUniforms).map(key => {
			gsap.to(this.textMaterial.uniforms[`${key}`].value, {
				duration: this.animeDuration,
				ease: 'power2.out',
				...nextTextUniforms[`${key}`]
			});
		});
		// AnimeTitle Animation
		let curAnimeTitle = this.animeNameTitleList[tempCurAnimeIndex];
		let nextAnimeTitle = this.animeNameTitleList[nextAnimeIndex];
		nextAnimeTitle.resize(this.viewer.width, this.viewer.height);
		gsap.fromTo(
			curAnimeTitle.material.uniforms.opacity,
			{ value: 1 },
			{ value: 0, duration: 0.5, ease: 'power2.out' }
		);
		gsap.fromTo(
			nextAnimeTitle.material.uniforms.opacity,
			{ value: 0 },
			{ value: 1, duration: 0.5, delay: 0.5, ease: 'power2.out' }
		);
	}

	whileVisible(order) {
		let cameraPos = this.camera.position;
		let textOpacity = this.textMaterial.uniforms.opacity;
		gsap.killTweensOf(cameraPos);
		gsap.killTweensOf(textOpacity);
		if (order === 'pre') {
			gsap.fromTo(cameraPos, { y: -30 }, { y: 0, duration: this.viewer.scrollAnimeDuration, ease: 'power2.out' });
		} else {
			gsap.fromTo(cameraPos, { y: 30 }, { y: 0, duration: this.viewer.scrollAnimeDuration, ease: 'power2.out' });
		}
		gsap.fromTo(textOpacity, { value: 0 }, { value: 1, duration: 1.5, delay: 0.8, ease: 'power2.out' });
		gsap.to(this.animeNameTitleList[this.curAnimeIndex].material.uniforms.opacity, {
			value: 1,
			duration: 1,
			delay: 1,
			ease: 'power2.out'
		});
		gsap.to(this.arrowBtn, { opacity: 0.8, duration: 1.5, delay: 0.5, ease: 'power2.out' });
	}

	whileNoVisible(order) {
		let cameraPos = this.camera.position;
		let textOpacity = this.textMaterial.uniforms.opacity;
		gsap.killTweensOf(cameraPos);
		gsap.killTweensOf(textOpacity);
		if (order === 'pre') {
			gsap.fromTo(cameraPos, { y: 0 }, { y: 30, duration: this.viewer.scrollAnimeDuration, ease: 'power2.out' });
		} else {
			gsap.fromTo(cameraPos, { y: 0 }, { y: -30, duration: this.viewer.scrollAnimeDuration, ease: 'power2.out' });
		}
		gsap.fromTo(textOpacity, { value: 1 }, { value: 0, duration: 0.5, ease: 'power2.out' });
		gsap.to(this.animeNameTitleList[this.curAnimeIndex].material.uniforms.opacity, {
			value: 0,
			duration: 1,
			ease: 'power2.out'
		});
		gsap.to(this.arrowBtn, { opacity: 0.0, duration: 0.8, ease: 'power2.out' });
	}

	initEvent() {
		if (!this.isMobile) {
			this.eventHandler.onMouseMoveEvent.bind(this.onMouseMove.bind(this));
		} else {
			this.eventHandler.onTouchMoveEvent.bind(this.onMouseMove.bind(this));
		}
		this.intersectsArr.push(this.arrowBtn.hitArea);
		this.eventHandler.onClickEvent.bind(this.onClick.bind(this));
	}

	onClick(event) {
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
		if (intersectsRes.name === 'arrowButton' && !this.isAnimeChanging) {
			this.swapAnime();
		}
	}

	onMouseMove(event) {
		if (!this.visible) return;
		let positionNormX = this.state.pointer.positionNorm[0] - 0.5;
		let sceneRoationTarget = positionNormX * this.sceneRotateXLimit;
		gsap.killTweensOf(this.rotateGroup.rotation);
		gsap.to(this.rotateGroup.rotation, { y: sceneRoationTarget, duration: 1, ease: 'power2.out' });
		// Button
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
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.uiCamera.left = -width / 2;
		this.uiCamera.right = width / 2;
		this.uiCamera.top = height / 2;
		this.uiCamera.bottom = -height / 2;
		this.uiCamera.updateProjectionMatrix();
		this.resizeText(width, height);
		this.resizeGalleryTextures(width, height);
		this.resizeUIPanel(width, height);
	}

	render({ renderer, orthoCamera, target, deltaTime } = {}) {
		if (!this.visible) return;
		this.textMaterial.uniforms.time.value += deltaTime;
		// BG
		orthoCamera.layers.set(this.layers.BG_LAYER);
		renderer.render(this.scene, orthoCamera);
		// Scene
		this.camera.layers.set(this.layers.SCENE_LAYER);
		if (this.particles) this.particles.render(deltaTime);
		renderer.render(this.scene, this.camera);
		// Texture
		this.camera.layers.set(this.layers.TEX_LAYER);
		if (this.galleryTextures) this.galleryTextures.forEach(texture => texture.render(deltaTime));
		renderer.render(this.scene, this.camera);
		// UI
		this.arrowBtn.update(deltaTime);
		this.uiCamera.layers.set(this.layers.UI_LAYER);
		renderer.render(this.uiScene, this.uiCamera);
	}
}
