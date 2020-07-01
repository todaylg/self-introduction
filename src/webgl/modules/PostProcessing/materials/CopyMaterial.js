import { ShaderMaterial, Uniform } from 'three';
import fragmentShader from './shaders/copy/shader.fs';
import vertexShader from './shaders/common/shader.vs';

export class CopyMaterial extends ShaderMaterial {
	constructor() {
		super({
			type: 'CopyMaterial',

			uniforms: {
				inputBuffer: new Uniform(null),
				opacity: new Uniform(1.0)
			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false
		});
	}
}
