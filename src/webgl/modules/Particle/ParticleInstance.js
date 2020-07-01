import * as THREE from 'three';

export class ParticleInstance {
	constructor(material) {
		this.material = material;
		this.initParticle();
	}

	initParticle() {
		const geometry = new THREE.InstancedBufferGeometry();

		// positions
		const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
		positions.setXYZ(0, -0.5, -0.5, 0.0);
		positions.setXYZ(1, 0.5, -0.5, 0.0);
		positions.setXYZ(2, -0.5, 0.5, 0.0);
		positions.setXYZ(3, 0.5, 0.5, 0.0);
		geometry.setAttribute('position', positions);

		// uvs
		const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
		uvs.setXYZ(0, 0.0, 0.0);
		uvs.setXYZ(1, 1.0, 0.0);
		uvs.setXYZ(2, 0.0, 1.0);
		uvs.setXYZ(3, 1.0, 1.0);
		geometry.setAttribute('uv', uvs);

		// CCW
		geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 1, 2, 2, 1, 3]), 1));

		this.mesh = new THREE.Mesh(geometry, this.material);
	}
}
