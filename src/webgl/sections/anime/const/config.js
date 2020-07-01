import * as THREE from 'three';

// Array config for every anime scene
const BGUniformsConfig = [
	{
		baseColor: new THREE.Color('rgb(0,5,5)'),
		area1Color: new THREE.Color('rgb(0,37,55)'),
		area2Color: new THREE.Color('rgb(0,61,100)'),
		area1Position: new THREE.Vector2(0.5, 0),
		area1Radius: 0.23,
		area2Position: new THREE.Vector2(0.5, 1)
	},
	{
		baseColor: new THREE.Color('#f2c9cc'),
		area1Color: new THREE.Color('rgb(55,0,52)'),
		area2Color: new THREE.Color('rgb(85,51,0)'),
		area1Position: new THREE.Vector2(0, 0),
		area1Radius: 1,
		area2Position: new THREE.Vector2(1, 1),
		area2Radius: 1
	},
	{
		baseColor: new THREE.Color('rgb(105,105,105)'),
		area1Color: new THREE.Color('rgb(25,25,25)'),
		area2Color: new THREE.Color('rgb(176,179,185)'),
		area1Position: new THREE.Vector2(0.5, 0),
		area1Radius: 0.2,
		area2Position: new THREE.Vector2(0.5, 1),
		area2Radius: 1
	}
];

const ParticleUniformsConfig = [
	{
		color: new THREE.Color('rgb(92,120,145)')
	},
	{
		color: new THREE.Color('#F3759E')
	},
	{
		color: new THREE.Color('rgb(255,255,255)')
	}
];

const TextUniformConfigList = [
	{
		topColor: new THREE.Color('rgb(207,224,235)'),
		bottomColor: new THREE.Color('rgb(0,37,55)')
	},
	{
		topColor: new THREE.Color('rgb(243,81,126)'),
		bottomColor: new THREE.Color('rgb(255,255,255)')
	},
	{
		topColor: new THREE.Color('rgb(255,255,255)'),
		bottomColor: new THREE.Color('rgb(255,255,255)')
	}
];

const AnimeTitleUniformsList = [
	{
		topColor: new THREE.Color('rgb(207,224,235)'),
		bottomColor: new THREE.Color('rgb(0,37,55)')
	},
	{
		topColor: new THREE.Color('rgb(243,81,126)'),
		bottomColor: new THREE.Color('rgb(255,255,255)')
	},
	{
		topColor: new THREE.Color('rgb(255,255,255)'),
		bottomColor: new THREE.Color('rgb(255,255,255)')
	}
];

const GalleryConfig = {
	galleryTexture1: ['Texture-Diamond1', 'Texture-Binguo1', 'Texture-STM1'],
	galleryTexture2: ['Texture-Diamond2', 'Texture-Binguo2', 'Texture-STM2']
};

const TextConfig = {
	mainTitle: `Anime !`,
	subTitle: `I loveee anime! Especially the imaginative
    camera movements and beautiful scenes!
    So i also like AMV/MAD very much(miss 2013)
    Here are some of my favorite anime!`
};

const AnimeNameList = ['[ Land of the Lustrous ]', '[ Hyouka ]', '[ Steins;Gate ]'];

export {
	BGUniformsConfig,
	ParticleUniformsConfig,
	TextUniformConfigList,
	GalleryConfig,
	TextConfig,
	AnimeNameList,
	AnimeTitleUniformsList
};
