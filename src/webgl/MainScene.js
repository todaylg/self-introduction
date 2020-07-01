import * as THREE from 'three';
import ScenesViewer from './ScenesViewer';
import AssetLibrary from './loader/AssetLibrary';
import { PCPreloadConfigList, MobilePreloadConfigList } from 'CONST/assetsPreloadConfig';
import { getEleWidth, getEleHeight, debounce } from 'JS/Utils';
// import Stats from 'LIB/threejs/libs/stats.module.js';

export default class MainScene {
	constructor(container, isMobile, toggleConactCallback) {
		this.container = container;
		this.isMobile = isMobile;
		this.preloadConfigList = isMobile ? MobilePreloadConfigList : PCPreloadConfigList;
		this.width = getEleWidth(container);
		this.height = getEleHeight(container);
		this.clock = new THREE.Clock();
		this.dpr = window.devicePixelRatio;
		this.assetLibrary = new AssetLibrary(isMobile);
		this.scene = new THREE.Scene();
		// Camera
		const camera = (this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000));
		camera.position.set(0, 0, 10);
		// Renderer
		const renderer = (this.renderer = new THREE.WebGL1Renderer({
			antialias: true
		}));
		renderer.domElement.id = 'canvasWebGL';
		renderer.setPixelRatio(this.dpr);
		renderer.setSize(this.width, this.height);
		renderer.gammaFactor = 2.2;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.outputEncoding = THREE.sRGBEncoding;
		renderer.setClearColor(0x000000, 1);
		renderer.autoClear = false;
		container.appendChild(renderer.domElement);
		// Callback
		this.toggleConactCallback = toggleConactCallback;
		// Test
		// this.stats = new Stats();
		// document.body.appendChild(this.stats.dom);
	}

	loadAssets(onProgress, onComplete) {
		let assetLibrary = this.assetLibrary;
		this.preloadConfigList.forEach(config => {
			assetLibrary.addLoadQueue(config.key, config.path, config.type, config.parser, config.opts);
		});
		assetLibrary.onProgress.bind(onProgress);
		assetLibrary.onComplete.bind(onComplete);
		assetLibrary.load();
	}

	initScene() {
		this.scenesViewer = new ScenesViewer(this);
		this.update();
		this.initEvents();
	}

	entryAnime() {
		this.scenesViewer.entryAnime();
	}

	initEvents() {
		window.addEventListener('resize', debounce(this.onWindowResize.bind(this), 100), false);
		this.onWindowResize();
	}

	onWindowResize() {
		this.width = getEleWidth(this.container);
		this.height = getEleHeight(this.container);
		this.dpr = window.devicePixelRatio;
		this.renderer.setPixelRatio(this.dpr);
		this.renderer.setSize(this.width, this.height);
		this.scenesViewer.resize(this.width, this.height);
	}

	update() {
		this.scenesViewer.update();
		requestAnimationFrame(this.update.bind(this));
		// Test
		// this.stats.update();
	}
}
