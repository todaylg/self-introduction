import { ShaderMaterial, Uniform, Vector2 } from 'three';
import fragmentShader from './shaders/fxaa/shader.fs';
import vertexShader from './shaders/common/shader.vs';

export class FXAAMaterial extends ShaderMaterial {
	constructor() {
		super({
			type: 'FXAAMaterial',

			uniforms: {
				inputBuffer: new Uniform(null),
				resolution: { value: new Vector2(1 / window.innerWidth, 1 / window.innerHeight) }
			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false
		});
	}
}
