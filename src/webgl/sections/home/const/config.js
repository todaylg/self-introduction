import * as THREE from 'three';

const Layers = {
	SCENE_LAYER: 0,
	BG_LAYER: 1,
	UI_LAYER: 2
};

const BGUniformsConfig = {
	baseColor: new THREE.Color('#646666'),
	area1Color: new THREE.Color('#4A4F54'),
	area2Color: new THREE.Color('#FFFFFF'),
	area1Position: new THREE.Vector2(0.2, 0.2),
	area2Position: new THREE.Vector2(0.9, 0.9)
};

const TextUniformConfig = {
	color1: new THREE.Uniform(new THREE.Color(0.85, 0.85, 0.85)),
	color2: new THREE.Uniform(new THREE.Color(1, 1, 0.85)),
	color3: new THREE.Uniform(new THREE.Color(0.35, 0.35, 0.35)),
	color4: new THREE.Uniform(new THREE.Color(0.0, 0.0, 0.0))
};

const TextConfig = {
	mainTitle: `TODAYLG    LUGANG`,
	subTitle: `RENDERING & WEB3D & ANIME`
};

const AnimeName = '[ Final Fantasy VII ]';

const AnimeTitleUniforms = {
	topColor: new THREE.Color('rgb(225,225,225)'),
	bottomColor: new THREE.Color('rgb(89,89,89)')
};

export { BGUniformsConfig, TextUniformConfig, TextConfig, Layers, AnimeName, AnimeTitleUniforms };
