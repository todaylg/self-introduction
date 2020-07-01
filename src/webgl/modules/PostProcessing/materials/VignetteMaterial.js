import { ShaderMaterial, Uniform } from 'three';
import fragmentShader from './shaders/vignette/shader.fs';
import vertexShader from './shaders/common/shader.vs';

export class VignetteMaterial extends ShaderMaterial {
	constructor({ offset = 0.5, darkness = 0.5, eskil = false } = {}) {
		super({
			type: 'VignetteMaterial',

			uniforms: {
				inputBuffer: new Uniform(null),
				offset: new Uniform(offset),
				darkness: new Uniform(darkness)
			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false
		});

		if (eskil) this.defines['ESKIL'] = 1;
	}
}
