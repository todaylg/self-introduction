import { ShaderMaterial, Uniform, Vector2, DataTexture, RGBFormat } from 'three';
import fragmentShader from './shaders/glitch/shader.fs';
import vertexShader from './shaders/common/shader.vs';
import { randomFloat } from 'JS/Utils';

export class GlitchMaterial extends ShaderMaterial {
	constructor({ dtSize = 64 } = {}) {
		super({
			type: 'GlitchMaterial',

			uniforms: {
				inputBuffer: new Uniform(null),
				active: new Uniform(false),
				perturbationMap: new Uniform(null),
				columns: new Uniform(0.015),
				random: new Uniform(0.01),
				seed: new Uniform(new Vector2()),
				distortion: new Uniform(new Vector2())
			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false
		});

		let map = this.generatePerturbationMap(dtSize);
		this.uniforms.perturbationMap.value = map;
	}

	get active() {
		return this.uniforms.active.value;
	}

	set active(val) {
		this.uniforms.active.value = val;
	}

	generatePerturbationMap(size = 64) {
		const pixels = size * size;
		const data = new Uint8Array(pixels * 3);

		let i, l, x;
		for (i = 0, l = data.length; i < l; i += 3) {
			x = Math.random() * 255;
			data[i] = x;
			data[i + 1] = x;
			data[i + 2] = x;
		}

		const map = new DataTexture(data, size, size, RGBFormat);
		map.needsUpdate = true;

		return map;
	}

	update() {
		if (!this.active) return;

		this.uniforms.random.value = Math.random();
		this.uniforms.seed.value.set(randomFloat(-1, 1), randomFloat(-1, 1));
		this.uniforms.distortion.value.set(randomFloat(0.0, 1.0), randomFloat(0.0, 1.0));
	}
}
