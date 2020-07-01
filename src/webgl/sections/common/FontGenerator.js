import * as THREE from 'three';
import createGeometry from 'three-bmfont-text';
import MSDFShader from 'three-bmfont-text/shaders/msdf';
import { fontShaders } from 'MODULES/FontShaders/';

export class FontGenerator {
	constructor(assetLibrary) {
		this.fontTexture = assetLibrary.get('Texture-Lato');
		this.font = assetLibrary.get('Font-Lato');
	}

	createFontMaterial(fontShadersKey, opts) {
		let material = new THREE.RawShaderMaterial(
			MSDFShader({
				vertexShader: fontShaders[fontShadersKey].vertex,
				fragmentShader: fontShaders[fontShadersKey].fragment,
				map: this.fontTexture,
				color: 0xffffff,
				transparent: true,
				depthTest: false,
				negate: false,
				opacity: 0 // Through animation to 1
			})
		);
		material.uniforms.resolution = { value: new THREE.Vector2(window.innerWidth, window.innerHeight) };
		return material;
	}

	createFontMesh(text, material) {
		const geometry = createGeometry({ font: this.font, text });
		return new THREE.Mesh(geometry, material);
	}
}
