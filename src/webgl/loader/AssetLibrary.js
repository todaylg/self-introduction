import * as THREE from 'three';
import Signal from 'JS/Signal';
import { GLTFLoader } from 'LIB/threejs/loaders/GLTFLoader';
import { Environment } from 'MODULES/Environment/Environment';
import { checkLODSupport } from 'JS/Utils';
import loadFont from 'load-bmfont';

export default class AssetLibrary {
	constructor(isMobile) {
		this.loadedNumber = 0;
		this.loadQueue = [];
		this.assets = {};
		this.onCompleteEvent = new Signal();
		this.onProgressEvent = new Signal();
		this.isMobile = isMobile;
		this.textureLODSupport = checkLODSupport();
	}

	get onComplete() {
		return this.onCompleteEvent;
	}

	get onProgress() {
		return this.onProgressEvent;
	}

	get(key) {
		return this.assets[key];
	}

	set(key, value) {
		this.assets[key] = value;
	}

	addLoadQueue(key, path, type, parser, opts) {
		this.loadQueue.push({ key, filePath: path, type, parser, opts });
	}

	load() {
		if (this.loadQueue.length === 0) return void this.onComplete.dispatch();
		let asset = this.loadQueue[this.loadedNumber];
		switch (asset.type) {
			case 'Texture':
				this.loadTexture(asset.filePath, asset.key, asset.parser);
				break;
			case 'Model':
				this.loadModel(asset.filePath, asset.key, asset.parser);
				break;
			case 'EnvMap':
				this.loadEnvMap(asset.filePath, asset.key, asset.opts);
				break;
			case 'Font':
				this.loadFontAsset(asset.filePath, asset.key);
				break;
			default:
				console.error(`No support ${asset.type} type asset!`);
				break;
		}
	}

	loadTexture(filePath, key, parser) {
		let loader = new (parser || THREE.TextureLoader)();
		loader.load(filePath, texture => {
			this.assets[key] = texture;
			texture.minFilter = THREE.LinearFilter;
			this.onAssetLoaded();
		});
	}

	loadModel(filePath, key, parser) {
		let loader = new (parser || GLTFLoader)();
		loader.load(filePath, model => {
			this.assets[key] = model;
			this.onAssetLoaded();
		});
	}

	loadEnvMap(filePath, key, opts) {
		new Environment(this).loadPackage(filePath, opts).then(env => {
			this.assets[key] = env;
			this.onAssetLoaded();
		});
	}

	loadFontAsset(filePath, key) {
		loadFont('./assets/fonts/Lato.fnt', (err, font) => {
			this.assets[key] = font;
			this.onAssetLoaded();
		});
	}

	onAssetLoaded() {
		this.loadedNumber += 1;
		this.onProgress.dispatch(this.loadedNumber / this.loadQueue.length);
		if (this.loadedNumber === this.loadQueue.length) {
			// Load Complete
			this.onComplete.dispatch(this);
		} else {
			// Or continue load next asset
			this.load();
		}
	}
}
