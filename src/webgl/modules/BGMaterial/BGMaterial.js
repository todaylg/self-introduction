import * as THREE from 'three';
import bgVS from './shaders/bgMaterial.vs';
import bgFS from './shaders/bgMaterial.fs';

export class BGMaterial extends THREE.RawShaderMaterial {
	constructor({
		baseColor = new THREE.Color('#000000'),
		area1Color = new THREE.Color('#000000'),
		area2Color = new THREE.Color('#FFFFFF'),
		area1Position = new THREE.Vector2(0, 0),
		area2Position = new THREE.Vector2(1, 1),
		strengthFactor = 0.4,
		area1Radius = 0.6,
		area2Radius = 0.6,
		noiseStrength = 0.05,
		opacity = 1
	} = {}) {
		super({
			uniforms: {
				baseColor: { value: baseColor.clone() },
				area1Color: { value: area1Color.clone() },
				area2Color: { value: area2Color.clone() },
				area1Position: { value: area1Position.clone() },
				area2Position: { value: area2Position.clone() },
				strengthFactor: { value: strengthFactor },
				area1Radius: { value: area1Radius },
				area2Radius: { value: area2Radius },
				noiseStrength: { value: noiseStrength },
				opacity: { value: opacity }
			},
			depthWrite: false,
			depthTest: false,
			transparent: true,
			vertexShader: bgVS,
			fragmentShader: bgFS
		});
	}
}
