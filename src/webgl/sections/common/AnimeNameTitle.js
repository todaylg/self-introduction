import { computeMeshBoundingBox, clamp } from 'JS/Utils';

export class AnimeNameTitle {
	constructor(section, animeName, uniforms) {
		this.section = section;
		this.isMobile = section.isMobile;
		this.fontGenerator = section.fontGenerator;
		this.material = this.fontGenerator.createFontMaterial(1);
		this.material.uniforms.time = { value: 0.0 };
		this.mesh = section.initTextMesh(animeName, this.material);
		// Apply text uniforms
		Object.keys(uniforms).map(key => {
			this.material.uniforms[`${key}`] = { value: uniforms[key].clone() };
		});
	}

	resize(width, height) {
		if(!this.isMobile){
			this.resizeForPC(width, height);
		}else{
			this.resizeForMobile(width, height);
		}
	}

	resizeForPC(width, height) {
		let animeNameMesh = this.mesh;
		const animeNameScale = clamp(width / 2000, 0.25, 0.35);
		let animeNameBBox = computeMeshBoundingBox(animeNameMesh).length.multiplyScalar(animeNameScale);
		let titleMeshLength = animeNameBBox.x;
		// Right coner
		const offset = 10;
		const animeNamePosX = width / 2 - titleMeshLength - offset;
		const animeNamePosY = -height / 2 + offset;
		animeNameMesh.scale.setScalar(animeNameScale);
		animeNameMesh.position.set(animeNamePosX, animeNamePosY, 0);
	}

	resizeForMobile(width, height) {
		let animeNameMesh = this.mesh;
		const animeNameScale = clamp(width / 1500, 0.25, 0.35);
		let animeNameBBox = computeMeshBoundingBox(animeNameMesh).length.multiplyScalar(animeNameScale);
		let titleMeshLength = animeNameBBox.x;
		// Right coner
		const offset = 20;
		const animeNamePosX = width / 2 - titleMeshLength - offset;
		const animeNamePosY = -height / 2 + offset;
		animeNameMesh.scale.setScalar(animeNameScale);
		animeNameMesh.position.set(animeNamePosX, animeNamePosY, 0);
	}

	render(time) {
		this.material.uniforms.time.value += time;
	}
}
