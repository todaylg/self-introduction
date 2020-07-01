export class Particle {
	constructor() {
		this.velocity = new Array(3);
		this.rotation = new Array(3);
		this.position = new Array(3);
		this.euler = new Array(3);
		this.size = 1.0;
		this.alpha = 1.0;
		this.zkey = 0.0;
	}

	setVelocity(vx, vy, vz) {
		this.velocity[0] = vx;
		this.velocity[1] = vy;
		this.velocity[2] = vz;
	}

	setRotation(rx, ry, rz) {
		this.rotation[0] = rx;
		this.rotation[1] = ry;
		this.rotation[2] = rz;
	}

	setPosition(nx, ny, nz) {
		this.position[0] = nx;
		this.position[1] = ny;
		this.position[2] = nz;
	}

	setEulerAngles(rx, ry, rz) {
		this.euler[0] = rx;
		this.euler[1] = ry;
		this.euler[2] = rz;
	}

	setSize(s) {
		this.size = s;
	}

	setAlpha(a) {
		this.alpha = a;
	}

	update(dt) {
		this.position[0] += this.velocity[0] * dt;
		this.position[1] += this.velocity[1] * dt;
		this.position[2] += this.velocity[2] * dt;

		this.euler[0] += this.rotation[0] * dt;
		this.euler[1] += this.rotation[1] * dt;
		this.euler[2] += this.rotation[2] * dt;
	}
}
