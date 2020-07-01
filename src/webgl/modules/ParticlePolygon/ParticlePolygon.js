import * as THREE from 'three';
import particleVS from './shaders/particle.vs';
import particleFS from './shaders/particle.fs';
import { ParticleInstance } from 'MODULES/Particle/ParticleInstance';
import { symmetryRandom } from 'JS/Utils';

export class ParticlePolygon {
	constructor(container, { number = 1000, areaWidth = 100, areaHeight = 50, areaDepth = 50 } = {}) {
		this.container = container;
		this.number = number;
		this.areaWidth = areaWidth;
		this.areaHeight = areaHeight;
		this.areaDepth = areaDepth;

		this.initParticle();
	}

	initParticle() {
		const uniforms = {
			time: { value: 0 },
			size: { value: 1 },
			color: { value: new THREE.Color(0xd7f1fe) },
			type: { value: 0 }
		};

		const material = (this.material = new THREE.RawShaderMaterial({
			uniforms,
			vertexShader: particleVS,
			fragmentShader: particleFS,
			depthTest: false,
			transparent: true
			// blending: THREE.AdditiveBlending,
		}));

		this.instanceMesh = new ParticleInstance(material).mesh;
		const geometry = this.instanceMesh.geometry;

		const numberPoints = this.number;
		const indices = new Uint16Array(numberPoints);
		const offsets = new Float32Array(numberPoints * 3); // Each position
		const randoms = new Float32Array(numberPoints * 3); // rotation/scale/alpha

		for (let i = 0; i < numberPoints; i++) {
			offsets.set(
				[
					this.areaWidth * symmetryRandom(),
					this.areaHeight * symmetryRandom(),
					this.areaDepth * symmetryRandom()
				],
				i * 3
			);

			randoms.set([Math.random(), Math.random(), Math.random()], i * 3);

			indices[i] = i;
		}

		geometry.setAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));
		geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));
		geometry.setAttribute('random', new THREE.InstancedBufferAttribute(randoms, 3, false));

		this.container.add(this.instanceMesh);
	}

	get color() {
		return this.material.uniforms.color.value;
	}

	set color(val) {
		this.material.uniforms.color.value = val;
	}

	get size() {
		return this.material.uniforms.size.value;
	}

	set size(val) {
		this.material.uniforms.size.value = val;
	}

	get type() {
		return this.material.uniforms.type.value;
	}

	set type(val) {
		this.material.uniforms.type.value = val;
	}

	get mesh() {
		return this.instanceMesh;
	}

	render(time) {
		this.instanceMesh.material.uniforms.time.value += time;
		this.instanceMesh.rotation.y -= 0.001;
	}
}
