import * as THREE from 'three';

const BGUniformsConfig = {
	baseColor: new THREE.Color('rgb(33,33,33)'),
	area1Color: new THREE.Color('rgb(255,255,255)'),
	area1Radius: 1,
	area1Position: new THREE.Vector2(1, 0),
	area2Color: new THREE.Color('rgb(255,255,255)'),
	area2Radius: 1,
	area2Position: new THREE.Vector2(1, 1)
};

const TextUniformConfig = {
	topColor: new THREE.Color('rgb(255,255,255)'),
	bottomColor: new THREE.Color('rgb(0,0,255)')
};

const TextConfig = {
	mainTitle: `Work !`,
	subTitle: `three-viewer`,
	content: `This is a PBR material implementation based 
	on pre-processing by envtools. Here You can easily 
	compare and test different formulas and effects.`
};

const AnimeName = '[ No Game No Life ]';

const AnimeTitleUniforms = {
	topColor: new THREE.Color('rgb(255,255,255)'),
	bottomColor: new THREE.Color('rgb(0,0,255)')
};

const diffuseEquation = ['Lambert', 'Burley', 'OrenNayar', 'Gotanda', 'None'];

const specularFresnelEquation = ['Schlick', 'CookTorrance', 'None'];

const specularNDFEquation = ['GGX', 'BlinnPhong', 'Beckmann'];

const specularVisEquation = ['SmithJointApprox', 'Implicit', 'Neumann', 'Kelemen', 'Schlick', 'Smith', 'HammonApprox'];

const specularAOList = ['Seblagarde', 'Marmosetco', 'None'];

const panelDefinesRegs = /(ENABLE_IBL)|(ENABLE_LIGHT)|(ENABLE_ANISOTROPY)|(ENABLE_CLEARCOAT)|(ENERGY_COMPENSATION)|(DIFFUSE_*)|(F_*)|(NDF_*)|(V_*)|(SPECULAR_AO_*)|(GEOMETRIC_SPECULAR_AA)|(MS_SPECULAR_AO)|(MS_DIFFUSE_AO)/;

export {
	BGUniformsConfig,
	TextUniformConfig,
	TextConfig,
	AnimeName,
	AnimeTitleUniforms,
	diffuseEquation,
	specularFresnelEquation,
	specularNDFEquation,
	specularVisEquation,
	specularAOList,
	panelDefinesRegs
};
