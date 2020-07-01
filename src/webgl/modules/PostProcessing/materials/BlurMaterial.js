import { ShaderMaterial, Uniform, Vector2 } from 'three';
import fragmentShader from './shaders/blur/shader.fs';
import vertexShader from './shaders/common/shader.vs';

export class BlurMaterial extends ShaderMaterial {
	constructor({ direction = new Vector2(0, 1) } = {}) {
		super({
			type: 'BlurMaterial',

			uniforms: {
				inputBuffer: new Uniform(null),
				resolution: new Uniform(new Vector2(window.innerWidth, window.innerHeight)),
				direction: new Uniform(direction)
			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false
		});
	}

	resize(width, height) {
		this.material.uniforms.resolution.value.set(width, height);
	}
}
