import * as THREE from 'three';
import { HomeSection, AnimeSection, WorkSection, AboutSection } from './sections/index';
import { EventHandler } from 'JS/EventHandler';
// Text
import { FontGenerator } from './sections/common/FontGenerator';
import { gsap } from 'gsap';

export default class ScenesViewer {
	constructor(mainScene) {
		this.mainScene = mainScene;
		this.renderer = mainScene.renderer;
		this.isMobile = mainScene.isMobile;
		this.scene = mainScene.scene;
		this.clock = mainScene.clock;
		this.assetLibrary = mainScene.assetLibrary;
		this.fontGenerator = new FontGenerator(this.assetLibrary);
		this.container = mainScene.container;
		this.scene = mainScene.scene;
		this.camera = mainScene.camera;
		// Viewport
		this.width = mainScene.width;
		this.height = mainScene.height;
		this.dpr = mainScene.dpr;

		this.scrollMultiplier = 1.2;
		this.isSectionChanging = false;
		this.scrollAnimeDuration = 1.4;

		this.state = {
			preloadFinished: false,
			scissors: [
				[0, window.innerHeight],
				[0, window.innerHeight]
			],
			// Section
			visibleSections: [0],
			currentScetionIndex: 0,
			nextSectionIndex: null,
			// Mouse move
			pointer: {
				position: [0, 0],
				positionNorm: [0, 0],
				ndcPosition: new THREE.Vector2()
			},
			// Scroll
			scrollDirection: '',
			scroll: {
				progress: 0
			}
		};

		this.initEvent();

		// Reuse Geometry
		let screenGeometry = (this.screenGeometry = new THREE.BufferGeometry());
		let posVertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
		let uvVertices = new Float32Array([0, 0, 2, 0, 0, 2]);
		screenGeometry.setAttribute('position', new THREE.BufferAttribute(posVertices, 3));
		screenGeometry.setAttribute('uv', new THREE.BufferAttribute(uvVertices, 2));

		this.init();
		this.initPostprocessing();
		this.initSection();
	}

	initEvent() {
		this.eventHandler = new EventHandler(this.isMobile);
		if(!this.isMobile){
			this.eventHandler.onMouseMoveEvent.bind(this.onMouseMove.bind(this));
			this.eventHandler.onScrollEvent.bind(this.onScroll.bind(this));
		}else{
			this.eventHandler.onTouchMoveEvent.bind(this.onTouchMoveEvent.bind(this));
		}
	}

	init() {
		// 复用RenderTarget
		this.targets = new Array(2).fill().map(() => {
			let quad = new THREE.Mesh(this.screenGeometry);
			quad.frustumCulled = false;
			this.scene.add(quad);
			let target = new THREE.WebGLRenderTarget(this.width, this.height);
			target.texture.encoding = this.renderer.outputEncoding;
			target.texture.generateMipmaps = false;
			return {
				target,
				quad
			};
		});

		this.camera = new THREE.PerspectiveCamera(45, 1, 1, 700);
		this.camera.position.z = 10;
		this.scene.add(this.camera);

		this.orthoCamera = new THREE.OrthographicCamera(1, 1, 1, 1, 0, 1000);
		this.orthoCamera.position.z = 10;
		this.scene.add(this.orthoCamera);
	}

	initSection() {
		this.sections = [];
		this.sections[0] = new HomeSection(this);
		this.sections[1] = new AnimeSection(this);
		this.sections[2] = new WorkSection(this);
		this.sections[3] = new AboutSection(this);
		// Init every section
		this.sections.forEach((section, index) => {
			section.visible = this.state.currentScetionIndex === index ? true : false;
			this.state.visibleSections = [this.state.currentScetionIndex];
			section.init();
			section.postProcessingMaterial.map = this.targets[0].target.texture;
			this.targets[0].quad.material = section.postProcessingMaterial;
			section.precompile();
		});
	}

	initPostprocessing() {
		this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		this.postRenderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			stencilBuffer: false,
			depthBuffer: false,
			encoding: this.renderer.outputEncoding
		});
		this.postRenderTarget.texture.generateMipmaps = false;
	}

	entryAnime() {
		// Todo:
		// 1.Router
		// 2.Every Section has their own entry anime
		this.sections[0].entryAnime(() => {
			this.preloadFinished = true;
		});
	}

	toggleConactPanle(status) {
		this.mainScene.toggleConactCallback(status);
	}

	onMouseMove(event) {
		this.setPointerPos({
			x: event.clientX,
			y: event.clientY
		});
	}

	onTouchMoveEvent(event) {
		const offsetY = event.offsetY;
		const offsetX = event.offsetX;
		// Y
		if (Math.abs(offsetX) < Math.abs(offsetY) && Math.abs(offsetY) > 50) {
			this.state.scrollDirection = offsetY > 0 ? 'Up' : 'Down';
			this.swapSection();
		}
		// X
		this.setPointerPos({
			x: event.x,
			y: event.y
		});
	}

	setPointerPos({ x, y } = {}) {
		// Record to state
		this.state.pointer.position = [x, y];
		this.state.pointer.positionNorm = [x / window.innerWidth, y / window.innerHeight];
		this.state.pointer.ndcPosition.set(
			this.state.pointer.positionNorm[0] * 2 - 1,
			-this.state.pointer.positionNorm[1] * 2 + 1
		);
	}

	onScroll(event) {
		this.state.scrollDirection = event.pixelY > 0 ? 'Down' : 'Up';
		this.swapSection();
	}

	swapSection() {
		let state = this.state;
		if (this.isSectionChanging) return;
		this.isSectionChanging = true;
		const isUpScroll = state.scrollDirection === 'Up';

		// Infinite loop
		if (isUpScroll) {
			if (state.currentScetionIndex === 0) {
				state.nextSectionIndex = this.sections.length - 1;
			} else {
				state.nextSectionIndex = state.currentScetionIndex - 1;
			}
		} else {
			state.nextSectionIndex = (state.currentScetionIndex + 1) % this.sections.length;
		}
		state.visibleSections = [state.currentScetionIndex, state.nextSectionIndex];
		let currentSection = this.sections[state.currentScetionIndex];
		let nextSection = this.sections[state.nextSectionIndex];
		// Reset visible status
		this.sections.forEach((section, index) => {
			if (state.currentScetionIndex === index || state.nextSectionIndex === index) {
				section.visible = true;
			} else {
				section.visible = false;
			}
		});
		// Hooks
		currentSection.whileNoVisible(isUpScroll ? 'pre' : 'next');
		nextSection.whileVisible(isUpScroll ? 'pre' : 'next');
		// Animation
		let curScissors = state.scissors[0];
		let nextScissors = state.scissors[1];
		gsap.killTweensOf(state.scroll);
		gsap.fromTo(
			state.scroll,
			{ progress: 0 },
			{
				progress: 1,
				duration: this.scrollAnimeDuration,
				ease: 'power2.out',
				onUpdate: () => {
					let progress = state.scroll.progress;
					if (isUpScroll) progress = 1 - progress;
					currentSection.postProcessingMaterial.progress = progress;
					currentSection.postProcessingMaterial.isNext = isUpScroll ? true : false;
					nextSection.postProcessingMaterial.progress = progress;
					nextSection.postProcessingMaterial.isNext = isUpScroll ? false : true;
					// Scissors optimize
					curScissors[0] = isUpScroll ? 0 : this.height * progress;
					curScissors[1] = isUpScroll ? this.height * progress : this.height - curScissors[0];

					nextScissors[0] = isUpScroll ? this.height * progress : 0; // Down Scroll
					nextScissors[1] = isUpScroll ? this.height - nextScissors[0] : this.height * progress;
				},
				onComplete: () => {
					this.sections[state.currentScetionIndex].visible = false;
					state.currentScetionIndex = state.nextSectionIndex;
					state.nextSectionIndex = null;
					state.visibleSections = [state.currentScetionIndex];
					this.isSectionChanging = false;
					curScissors[0] = 0;
					curScissors[1] = this.height;
				}
			}
		);
	}

	resize(width, height) {
		this.width = width;
		this.height = height;
		let dpr = this.renderer.getPixelRatio();
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.sections.forEach(section => {
			section.resize(width, height, dpr);
		});

		const pixelWidth = width * dpr;
		const pixelHeight = height * dpr;
		this.targets.forEach(target => {
			let renderTarget = target.target;
			renderTarget.setSize(pixelWidth, pixelHeight);
		});
		this.postRenderTarget.setSize(pixelWidth, pixelHeight);
	}

	update() {
		let deltaTime = this.clock.getDelta();
		let { dpr, width, height, renderer, scene, orthoCamera } = this;
		// Clear before rendering
		this.targets.forEach(target => {
			this.renderer.setRenderTarget(target.target);
			this.renderer.clear();
		});
		// Render each sections scene to quad
		this.state.visibleSections.forEach((item, index) => {
			let section = this.sections[item];
			if (section.render) {
				let scissor = this.state.scissors[index];
				let scissorY = scissor[0];
				let scissorHeight = scissor[1];

				let target = this.targets[index];
				let renderTarget = target.target;
				let quad = target.quad;

				if(this.isSectionChanging){
					renderTarget.scissorTest = true;
					// From left corner
					renderTarget.scissor.set(0, scissorY * dpr, width * dpr, scissorHeight * dpr);
				}

				quad.material = section.postProcessingMaterial;
				quad.material.map = renderTarget.texture;

				renderer.setRenderTarget(renderTarget);
				section.render({
					renderer,
					orthoCamera,
					target: renderTarget,
					deltaTime
				});
				renderTarget.scissorTest = false;
			}
		});
		// Render quads
		this.orthoCamera.layers.set(0);
		this.renderer.setRenderTarget(null);
		this.renderer.clear();
		this.renderer.render(this.scene, this.orthoCamera);
	}
}
