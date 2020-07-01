import * as THREE from 'three';
import { Particle } from 'MODULES/Particle/Particle';
import vertexShader from './shaders/snow.vs';
import fragmentShader from './shaders/snow.fs';
import { symmetryRandom } from 'JS/Utils';

export class ParticleSnow {
	constructor(section) {
		this.scene = section.scene;
		this.isMobile = section.isMobile;
		this.deltaTime = 0;
		this.particleControl = {};
		if(!this.isMobile){
			this.particleControl.particleNum = 500;
			this.particleControl.area = [5, 8, 5];
		}else{
			this.particleControl.particleNum = 250;
			this.particleControl.area = [2, 4, 2.5];
		}
		// Data
		this.geometry = new THREE.BufferGeometry();
		this.positions = new Float32Array(this.particleControl.particleNum * 3);
		this.sizes = new Float32Array(this.particleControl.particleNum);
		this.alphas = new Float32Array(this.particleControl.particleNum);
		this.initParticle();
	}

	get mesh() {
		return this.points;
	}

	initParticle() {
		let { particleControl } = this;
		let { particleNum, area } = particleControl;
		particleControl.particles = new Array(particleNum);
		let tempVec3 = new THREE.Vector3();
		let tempVelocity = 0;
		for (let i = 0; i < particleNum; i++) {
			particleControl.particles[i] = new Particle();
			let particle = particleControl.particles[i];
			// Init Transform
			tempVec3.x = symmetryRandom() * 0.3 + 0.8;
			tempVec3.y = symmetryRandom() * 0.2 - 1.0;
			tempVec3.z = symmetryRandom() * 0.3 + 0.5;
			tempVec3.normalize();
			tempVelocity = 2.0 + Math.random() * 1.0;
			tempVec3.multiplyScalar(tempVelocity);
			// Velocity
			particle.setVelocity(tempVec3.x, tempVec3.y, tempVec3.z);
			// Position
			particle.setPosition(symmetryRandom() * area[0], symmetryRandom() * area[1], symmetryRandom() * area[2]);
			// Size
			particle.setSize(Math.random() / 5);
			// Alpha
			particle.setAlpha(Math.random());
		}
		// Attributes
		this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
		this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
		this.geometry.setAttribute('aAlpha', new THREE.BufferAttribute(this.alphas, 1));

		// Uniforms
		this.uniforms = {
			far: {
				type: 'f',
				value: area[2]
			},
			innerColor: { value: new THREE.Color('#FFFFFF') },
			outerColor: { value: new THREE.Color('#EEEEEE') }
		};
		this.points = new THREE.Points(
			this.geometry,
			new THREE.ShaderMaterial({
				uniforms: this.uniforms,
				vertexShader,
				fragmentShader,
				blending: THREE.AdditiveBlending,
				transparent: true
			})
		);
		this.scene.add(this.points);
	}

	// Cycle Position
	repeatPos(particle, area) {
		for (let index = 0; index < 3; index++) {
			let limit = area[index];
			if (Math.abs(particle.position[index]) - particle.size * 0.5 > limit) {
				// Out Of Area
				if (particle.position[index] > 0) {
					particle.position[index] -= limit * 2.0;
				} else {
					particle.position[index] += limit * 2.0;
				}
			}
		}
	}

	renderParticle() {
		let { particleNum, area, particles } = this.particleControl;
		// Update Data
		for (let i = 0; i < particleNum; i++) {
			let particle = particles[i];
			particle.update(this.deltaTime);
			this.repeatPos(particle, area);
			// Position
			this.positions[i * 3] = particle.position[0];
			this.positions[i * 3 + 1] = particle.position[1];
			this.positions[i * 3 + 2] = particle.position[2];
			// Size
			this.sizes[i] = particle.size;
			// Alpha
			this.alphas[i] = particle.alpha;
		}
		this.geometry.attributes['position'].needsUpdate = true;
		this.geometry.attributes['aSize'].needsUpdate = true;
	}

	render(time) {
		this.deltaTime = time;
		this.renderParticle();
	}
}
