import * as THREE from 'three';
import { Section } from '../common/Section';
import { AnimeNameTitle } from '../common/AnimeNameTitle';
import {
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
} from './const/config';
import { pbrDefaultDefines, pbrDefaultUniforms } from './const/defaultParams';
import { computeMeshBoundingBox, clamp } from 'JS/Utils';
// Modules
import { TextureBG } from 'MODULES/TextureBG/TextureBG';
import { PBRMaterial, PBRProgram } from 'MODULES/PBRMaterial/';
import { Background } from 'MODULES/CubeBG/Background';
import { RingButton, CloseButton } from 'MODULES/Button/';

import { gsap } from 'gsap';
import * as dat from 'dat.gui';
// Test
import { OrbitControls } from 'LIB/threejs/controls/OrbitControls';
import { initAnimeTitleGUI } from '../common/InitGUI';

export class WorkSection extends Section {
	constructor(viewer) {
		super(viewer);
		this.name = 'WorkSection';
		this.debug = 0;
		this.visible = true;
		this.pbrProgram = new PBRProgram();

		this.cameraInitPos = new THREE.Vector3(0, 0, 3);
		this.cameraLookAtPos = new THREE.Vector3(0, 0, 0);

		this.intersectsArr = [];
		this.intersects = []; // intersect result
		this.raycaster = new THREE.Raycaster();
		this.raycaster.layers.set(this.layers.UI_LAYER);
		this.isModelViewing = false;

		// Env param
		this.envRotation = 0;
		this.envRotationFromPanel = new THREE.Matrix4().makeRotationY(this.envRotation);
		this.envRotationMat4 = new THREE.Matrix4().copy(this.envRotationFromPanel);
		this.envRotationMat = { value: new THREE.Matrix3().setFromMatrix4(this.envRotationMat4) };
		this.envRotationMatBG = { value: new THREE.Matrix3().copy(this.envRotationMat.value) };
		this.envBrightness = { value: 1.0 };
		this.sunLightPanelRotateMat = new THREE.Matrix4();
		this.cameraRotationMatrix = new THREE.Matrix4();

		// Model init transform
		this.modelInitScale = 0.08;
		this.modelInitPosY = -0.3;
		this.modelInitRotationZ = -Math.PI / 15;

		this.modelViewingScale = 0.1;
		this.modelViewingPosY = -0.5;
		this.modelViewingRotateZ = 0;

		this.clickNDCPos = new THREE.Vector2();
	}

	init() {
		this.initBackground();
		let environment = this.assetLibrary.get('EnvMap-Milkyway'); // Milkyway Industrial
		let { sunlightInfo, backgroundEnv, uBGEnvironmentSize } = environment;
		this.loadSunLight(sunlightInfo);
		this.sunLightStartPos = this.sunLight.position.clone();
		this.loadCubeBackground(backgroundEnv, uBGEnvironmentSize);
		this.initCamera();
		// Load Model
		let gltfScene = (this.gltfScene = this.assetLibrary.get('Model-Chess').scene);
		gltfScene.scale.setScalar(this.modelInitScale);
		gltfScene.position.y = this.modelInitPosY;
		gltfScene.rotation.z = this.modelInitRotationZ;
		this.scene.add(gltfScene);
		// Load Shader
		let { pbrVS, pbrFS } = this.pbrProgram.getPBRShader();
		// Replace PBR Material
		gltfScene.traverse(child => {
			if (child.isMesh) {
				child.material = new PBRMaterial(child, environment, {
					pbrVS,
					pbrFS
				});
				child.material.uniforms.uEnvironmentTransform = this.envRotationMat;
				child.material.uniforms.uEnvBrightness = this.envBrightness;
			}
		});
		this.initText();
		this.initUIPanel();
		this.initEvent();

		if (this.debug) this.initGUI();
	}

	initGUI() {
		const gui = new dat.GUI();
		initAnimeTitleGUI(gui, this.animeNameTitle.material);
		let textMaterial = this.textMaterial;
		console.log(this.textMaterial);
		let params = {
			// Text
			textTopColor: textMaterial.uniforms.topColor.value.getStyle(),
			textBottomColor: textMaterial.uniforms.bottomColor.value.getStyle()
		};
		// Text
		const textFolder = gui.addFolder('Text');
		textFolder
			.addColor(params, 'textTopColor')
			.name('topColor')
			.onChange(value => {
				textMaterial.uniforms.topColor.value.setStyle(value);
			});
		textFolder
			.addColor(params, 'textBottomColor')
			.name('bottomColor')
			.onChange(value => {
				textMaterial.uniforms.bottomColor.value.setStyle(value);
			});
		textFolder.open();
	}

	initPanelGUI() {
		// Control gui
		const gui = new dat.GUI();
		let gltfScene = this.gltfScene;
		if(this.isMobile) gui.close();
		let params = (this.guiParams = {
			enableIBL: !!pbrDefaultDefines.ENABLE_IBL,
			enableLight: !!pbrDefaultDefines.ENABLE_LIGHT,
			envRotation: this.envRotation,
			envBrightness: this.envBrightness.value,
			metalness: pbrDefaultUniforms.metalness.value,
			roughness: pbrDefaultUniforms.roughness.value,
			// Equations
			diffuseEquation: diffuseEquation[0],
			specularFresnelEquation: specularFresnelEquation[0],
			specularNDFEquation: specularNDFEquation[0],
			specularVisEquation: specularVisEquation[0],
			// Anisotropy
			enableAnisotropy: !!pbrDefaultDefines.ENABLE_ANISOTROPY,
			anisotropyFactor: pbrDefaultUniforms.uAnisotropyFactor.value,
			anisotropyRotation: pbrDefaultUniforms.uAnisotropyRotation.value,
			// ClearCoat
			enableClearCoat: !!pbrDefaultDefines.ENABLE_CLEARCOAT,
			clearCoatRoughness: pbrDefaultUniforms.uClearCoatRoughness.value,
			clearCoat: pbrDefaultUniforms.uClearCoat.value,
			// Advance
			enableCompensation: !!pbrDefaultDefines.ENERGY_COMPENSATION,
			enableSpecularAA: !!pbrDefaultDefines.GEOMETRIC_SPECULAR_AA,
			specularAAVariance: pbrDefaultUniforms.uSpecularAAVariance.value,
			specularAAThreshold: pbrDefaultUniforms.uSpecularAAThreshold.value,
			specularAO: specularAOList[0],
			enableMSSpecularAO: !!pbrDefaultDefines.MS_SPECULAR_AO,
			enableMSDiffuseAO: !!pbrDefaultDefines.MS_DIFFUSE_AO
		});
		// PBR
		const pbrFolder = gui.addFolder('PBR');
		pbrFolder.add(params, 'enableIBL').onChange(value => {
			this.guiParams.enableIBL = value;
			this.reCompileShader();
		});
		pbrFolder
			.add(params, 'enableLight')
			.name('enableSunLight')
			.onChange(value => {
				this.guiParams.enableLight = value;
				this.reCompileShader();
			});
		pbrFolder
			.add(params, 'envRotation', -Math.PI, Math.PI)
			.step(0.1)
			.onChange(value => {
				this.envRotation = value;
			});
		pbrFolder
			.add(params, 'envBrightness', 0, 2)
			.step(0.1)
			.onChange(value => {
				this.envBrightness.value = value;
			});
		pbrFolder
			.add(params, 'metalness', 0, 1)
			.step(0.01)
			.onChange(value => {
				gltfScene.traverse(child => {
					if (child.isMesh) {
						child.material.uniforms.metalness.value = value;
					}
				});
			});
		pbrFolder
			.add(params, 'roughness', 0, 1)
			.step(0.01)
			.onChange(value => {
				gltfScene.traverse(child => {
					if (child.isMesh) {
						child.material.uniforms.roughness.value = value;
					}
				});
			});
		pbrFolder.open();

		// Equations
		const equationsFolder = gui.addFolder('Equations');
		equationsFolder
			.add(params, 'diffuseEquation', diffuseEquation)
			.name('diffuse')
			.onChange(value => {
				this.guiParams.diffuseEquation = value;
				this.reCompileShader();
			});
		equationsFolder
			.add(params, 'specularFresnelEquation', specularFresnelEquation)
			.name('fresnel')
			.onChange(value => {
				this.guiParams.specularFresnelEquation = value;
				this.reCompileShader();
			});
		equationsFolder
			.add(params, 'specularNDFEquation', specularNDFEquation)
			.name('NDF')
			.onChange(value => {
				this.guiParams.specularNDFEquation = value;
				this.reCompileShader();
			});
		equationsFolder
			.add(params, 'specularVisEquation', specularVisEquation)
			.name('geometry')
			.onChange(value => {
				this.guiParams.specularVisEquation = value;
				this.reCompileShader();
			});
		equationsFolder.open();

		// Anisotropy
		let anisotropyFolader = gui.addFolder('Anisotropy');
		anisotropyFolader
			.add(params, 'enableAnisotropy')
			.name('enable')
			.onChange(value => {
				this.guiParams.enableAnisotropy = value;
				this.reCompileShader();
			});
		anisotropyFolader
			.add(params, 'anisotropyRotation', -3.14, 3.14)
			.step(0.01)
			.name('rotation')
			.onChange(value => {
				gltfScene.traverse(child => {
					if (child.isMesh) {
						child.material.uniforms.uAnisotropyRotation.value = value;
					}
				});
			});
		anisotropyFolader
			.add(params, 'anisotropyFactor', 0, 1)
			.name('factor')
			.step(0.01)
			.onChange(value => {
				gltfScene.traverse(child => {
					if (child.isMesh) {
						child.material.uniforms.uAnisotropyFactor.value = value;
					}
				});
			});

		// ClearCoat
		let clearCoatFolader = gui.addFolder('ClearCoat');
		clearCoatFolader
			.add(params, 'enableClearCoat')
			.name('enable')
			.onChange(value => {
				this.guiParams.enableClearCoat = value;
				this.reCompileShader();
			});
		clearCoatFolader
			.add(params, 'clearCoat', 0, 1)
			.step(0.01)
			.name('clearCoat')
			.onChange(value => {
				gltfScene.traverse(child => {
					if (child.isMesh) {
						child.material.uniforms.uClearCoat.value = value;
					}
				});
			});
		clearCoatFolader
			.add(params, 'clearCoatRoughness', 0, 1)
			.step(0.01)
			.name('roughness')
			.onChange(value => {
				gltfScene.traverse(child => {
					if (child.isMesh) {
						child.material.uniforms.uClearCoatRoughness.value = value;
					}
				});
			});

		// Advance
		const advanceFolder = gui.addFolder('Advance');
		advanceFolder
			.add(params, 'enableCompensation')
			.name('compensation')
			.onChange(value => {
				this.guiParams.enableCompensation = value;
				this.reCompileShader();
			});
		advanceFolder
			.add(params, 'enableSpecularAA')
			.name('specularAA')
			.onChange(value => {
				this.guiParams.enableSpecularAA = value;
				this.reCompileShader();
			});
		advanceFolder
			.add(params, 'specularAAVariance', 0, 1)
			.name('sAAVariance')
			.step(0.01)
			.onChange(value => {
				gltfScene.traverse(child => {
					if (child.isMesh) {
						child.material.uniforms.uSpecularAAVariance.value = value;
					}
				});
			});
		advanceFolder
			.add(params, 'enableMSSpecularAO')
			.name('msSpecularAO')
			.onChange(value => {
				this.guiParams.enableMSSpecularAO = value;
				this.reCompileShader();
			});
		advanceFolder
			.add(params, 'enableMSDiffuseAO')
			.name('msDiffuseAO')
			.onChange(value => {
				this.guiParams.enableMSDiffuseAO = value;
				this.reCompileShader();
			});
		advanceFolder.add(params, 'specularAO', specularAOList).onChange(value => {
			this.guiParams.specularAO = value;
			this.reCompileShader();
		});
	}

	setDefinesFromGUI(defines) {
		let guiParams = this.guiParams;
		// Clean
		let reg = panelDefinesRegs;
		Object.keys(defines).map(key => {
			if (reg.test(key)) {
				delete defines[key];
			}
		});
		// Reset
		if (guiParams.enableIBL) defines.ENABLE_IBL = 1;
		if (guiParams.enableLight) defines.ENABLE_LIGHT = 1;
		if (guiParams.enableAnisotropy) defines.ENABLE_ANISOTROPY = 1;
		if (guiParams.enableClearCoat) defines.ENABLE_CLEARCOAT = 1;
		if (guiParams.enableCompensation) defines.ENERGY_COMPENSATION = 1;
		if (guiParams.enableSpecularAA) defines.GEOMETRIC_SPECULAR_AA = 1;
		if (guiParams.enableMSSpecularAO) defines.MS_SPECULAR_AO = 1;
		if (guiParams.enableMSDiffuseAO) defines.MS_DIFFUSE_AO = 1;

		defines[`DIFFUSE_${guiParams.diffuseEquation.toUpperCase()}`] = 1;
		defines[`F_${guiParams.specularFresnelEquation.toUpperCase()}`] = 1;
		defines[`NDF_${guiParams.specularNDFEquation.toUpperCase()}`] = 1;
		defines[`V_${guiParams.specularVisEquation.toUpperCase()}`] = 1;
		defines[`SPECULAR_AO_${guiParams.specularAO.toUpperCase()}`] = 1;
		return defines;
	}

	reCompileShader() {
		this.gltfScene.traverse(child => {
			if (child.isMesh && child.material) {
				this.setDefinesFromGUI(child.material.defines);
				child.material.needsUpdate = true;
			}
		});
	}

	initUIPanel() {
		// Click Btn
		this.ringBtn = new RingButton(this, this.layers.UI_LAYER, 'Click');
		this.ringBtn.container.position.set(30, 0, 0);
		this.uiScene.add(this.ringBtn.container);
		// Close Btn
		this.closeBtn = new CloseButton(this, this.layers.UI_LAYER);
		let closeContainer = this.closeBtn.container;
		const closeBtnScale = 0.45;
		this.closeBtnBox = computeMeshBoundingBox(this.closeBtn.mesh).length.multiplyScalar(closeBtnScale);
		closeContainer.scale.setScalar(closeBtnScale);
		this.uiScene.add(closeContainer);
		this.resizeUIPanel(this.width, this.height);
		// Panel gui
		this.initPanelGUI();
	}

	resizeUIPanel(width, height) {
		let closeContainer = this.closeBtn.container;
		const topOffset = height / 2 - this.closeBtnBox.y / 2 - 20;
		const leftOffset = -width / 2 + this.closeBtnBox.x / 2 + 20;
		closeContainer.position.set(leftOffset, topOffset, 0);
	}

	loadSunLight(sunlightInfo) {
		if (!this.sunLight) this.sunLight = new THREE.DirectionalLight(0xffffff, 0.1);
		this.sunLight.position.copy(sunlightInfo.position);
		this.scene.add(this.sunLight);
	}

	loadCubeBackground(backgroundEnv, uBGEnvironmentSize) {
		let cubeBackground = (this.cubeBackground = new Background(
			{
				envMap: backgroundEnv.texture,
				uBGEnvironmentSize
			},
			500
		));
		cubeBackground.material.uniforms.uEnvironmentTransform = this.envRotationMatBG;
		cubeBackground.material.uniforms.uEnvBrightness = this.envBrightness;
		this.scene.add(cubeBackground);
	}

	initCamera() {
		this.camera.position.copy(this.cameraInitPos);
		this.camera.lookAt(this.cameraLookAtPos);

		this.control = new OrbitControls(this.camera, this.viewer.container);
		this.control.enabled = false;
		this.control.enablePan = false;
		this.control.minDistance = 1;
		this.control.maxDistance = 5;
	}

	initText() {
		let material = (this.textMaterial = this.fontGenerator.createFontMaterial(1));
		material.uniforms.time = { value: 0.0 };
		// Apply text color
		Object.keys(TextUniformConfig).map(key => {
			material.uniforms[`${key}`] = { value: TextUniformConfig[key].clone() };
		});

		this.titleMesh = this.initTextMesh(TextConfig.mainTitle, material);
		this.subTitleMesh = this.initTextMesh(TextConfig.subTitle, material);
		this.contentMesh = this.initTextMesh(TextConfig.content, material);
		this.animeNameTitle = new AnimeNameTitle(this, AnimeName, AnimeTitleUniforms);
		this.resizeText(this.width, this.height);
	}

	resizeText(width, height) {
		if (!this.isMobile) {
			this.resizeTextForPC(width, height);
		} else {
			this.resizeTextForMobile(width, height);
		}

		this.animeNameTitle.resize(width, height);
	}

	resizeTextForPC(width, height) {
		let { titleMesh, subTitleMesh, contentMesh } = this;
		const topOffset = height / 4;
		const leftOffset = -width / 2.25;
		const titleScale = clamp(width / 1000, 1.2, 1.4);
		titleMesh.scale.setScalar(titleScale);
		titleMesh.position.set(leftOffset, topOffset, 0);

		const subTitleScale = clamp(width / 1500, 0.8, 1.1);
		let subBBox = computeMeshBoundingBox(subTitleMesh).length.multiplyScalar(subTitleScale);
		subTitleMesh.scale.setScalar(subTitleScale);
		subTitleMesh.position.set(leftOffset, topOffset, 0);

		const contentScale = clamp(width / 2000, 0.4, 0.6);
		let contentBBox = computeMeshBoundingBox(contentMesh).length.multiplyScalar(contentScale);
		contentMesh.scale.setScalar(contentScale);
		contentMesh.position.set(leftOffset, topOffset, 0);

		// Gap between title and subtitle
		subTitleMesh.position.y = topOffset - subBBox.y - 20;
		contentMesh.position.y = subTitleMesh.position.y - contentBBox.y - 20;
	}

	resizeTextForMobile(width, height) {
		let { titleMesh, subTitleMesh, contentMesh } = this;
		const topOffset = height / 2.4;
		const leftOffset = -width / 2.25;
		const titleScale = clamp(width / 500, 0.7, 0.9);
		titleMesh.scale.setScalar(titleScale);
		titleMesh.position.set(leftOffset, topOffset, 0);

		const subTitleScale = clamp(width / 800, 0.4, 0.5);
		let subBBox = computeMeshBoundingBox(subTitleMesh).length.multiplyScalar(subTitleScale);
		subTitleMesh.scale.setScalar(subTitleScale);
		subTitleMesh.position.set(leftOffset, topOffset, 0);

		const contentScale = clamp(width / 1000, 0.3, 0.4);
		let contentBBox = computeMeshBoundingBox(contentMesh).length.multiplyScalar(contentScale);
		contentMesh.scale.setScalar(contentScale);
		contentMesh.position.set(leftOffset, topOffset, 0);

		// Gap between title and subtitle
		subTitleMesh.position.y = topOffset - subBBox.y - 10;
		contentMesh.position.y = subTitleMesh.position.y - contentBBox.y - 10;
	}

	initBackground() {
		let texture = this.assetLibrary.get('Texture-NGNL1');
		let bgMesh = (this.bgMesh = new TextureBG(texture, this.postProcessingMaterial));
		bgMesh.layers.set(this.layers.BG_LAYER);
		this.scene.add(bgMesh);
	}

	updateEnvironmentRotation(value) {
		// Get panel rotation
		this.envRotationFromPanel.makeRotationY(value);
		// Sync camera roatation
		this.cameraRotationMatrix.makeRotationFromQuaternion(this.camera.quaternion);
		this.envRotationMat4.multiplyMatrices(this.envRotationFromPanel, this.cameraRotationMatrix);
		this.envRotationMat.value.setFromMatrix4(this.envRotationMat4);
		this.envRotationMatBG.value.setFromMatrix4(this.envRotationFromPanel);
		// Direction compute by position
		let resultSunlight = this.sunLightStartPos.clone();
		this.sunLightPanelRotateMat.getInverse(this.envRotationFromPanel);
		resultSunlight.applyMatrix4(this.sunLightPanelRotateMat);
		this.sunLight.position.copy(resultSunlight);
	}

	openModelViewer() {
		if (this.isModelViewing) return;
		this.isModelViewing = true;
		const duration = 1;
		// 1.Reset Model Transform(Tween)
		gsap.to(this.gltfScene.rotation, { z: this.modelViewingRotateZ, duration, ease: 'power2.out' });
		gsap.to(this.gltfScene.scale, {
			x: this.modelViewingScale,
			y: this.modelViewingScale,
			z: this.modelViewingScale,
			duration,
			ease: 'power2.out'
		});
		gsap.to(this.gltfScene.position, { y: this.modelViewingPosY, duration, ease: 'power2.out' });
		// 2.Background change
		gsap.to(this.bgMesh.material.uniforms.opacity, {
			value: 0,
			duration,
			ease: 'power2.out',
			onComplete: () => {
				this.bgMesh.visible = false;
			}
		});
		this.cubeBackground.visible = true;
		gsap.to(this.cubeBackground.material.uniforms.opacity, { value: 1, duration, ease: 'power2.out' });
		// 3.Control change
		this.control.enabled = true;
		// 4.Panel
		document.querySelector('.dg.main').setAttribute('style', 'display: block');
		gsap.fromTo('.dg.main', { opacity: 0 }, { opacity: 1, duration, ease: 'power2.out' });
		// 5.Button animation
		gsap.to(this.ringBtn, {
			opacity: 0,
			duration,
			ease: 'power2.out',
			onComplete: () => {
				this.ringBtn.visible = false;
			}
		});
		this.closeBtn.visible = true;
		gsap.to(this.closeBtn, { opacity: 0.5, duration, ease: 'power2.out' });
		this.intersectsArr = [this.closeBtn.hitArea];
		// 6.Text
		let textOpacity = this.textMaterial.uniforms.opacity;
		gsap.fromTo(textOpacity, { value: 1 }, { value: 0, duration, ease: 'power2.out' });
		gsap.to(this.animeNameTitle.material.uniforms.opacity, { value: 0, duration, ease: 'power2.out' });
	}

	closeModelViewer() {
		if (!this.isModelViewing) return;
		this.isModelViewing = false;
		const duration = 1;
		// 1.Resue Model Transform(Tween)
		gsap.to(this.camera.position, {
			x: this.cameraInitPos.x,
			y: this.cameraInitPos.y,
			z: this.cameraInitPos.z,
			duration,
			ease: 'power2.out',
			onUpdate: () => {
				this.camera.lookAt(this.cameraLookAtPos);
			}
		});
		gsap.to(this.gltfScene.rotation, { z: -Math.PI / 15, duration, ease: 'power2.out' });
		gsap.to(this.gltfScene.scale, {
			x: this.modelInitScale,
			y: this.modelInitScale,
			z: this.modelInitScale,
			duration,
			ease: 'power2.out'
		});
		gsap.to(this.gltfScene.position, { y: this.modelInitPosY, duration, ease: 'power2.out' });
		// 2.Background change
		this.bgMesh.visible = true;
		gsap.to(this.bgMesh.material.uniforms.opacity, {
			value: 1,
			duration,
			ease: 'power2.out'
		});
		gsap.to(this.cubeBackground.material.uniforms.opacity, {
			value: 0,
			duration,
			ease: 'power2.out',
			onComplete: () => {
				this.cubeBackground.visible = false;
			}
		});
		// 3.Control change
		this.control.enabled = false;
		// 4.Panel Hide
		gsap.fromTo(
			'.dg.main',
			{ opacity: 1 },
			{
				opacity: 0,
				duration,
				ease: 'power2.out',
				onComplete: () => {
					document.querySelector('.dg.main').setAttribute('style', 'display: none');
				}
			}
		);
		// 5.Button animation
		this.ringBtn.visible = true;
		gsap.to(this.ringBtn, {
			opacity: 0.5,
			duration,
			ease: 'power2.out'
		});
		gsap.to(this.closeBtn, {
			opacity: 0,
			duration,
			ease: 'power2.out',
			onComplete: () => {
				this.closeBtn.visible = false;
			}
		});
		this.intersectsArr = [this.ringBtn.hitArea];
		// 6.Text
		let textOpacity = this.textMaterial.uniforms.opacity;
		gsap.fromTo(textOpacity, { value: 0 }, { value: 1, duration, ease: 'power2.out' });
		gsap.to(this.animeNameTitle.material.uniforms.opacity, { value: 1, duration, ease: 'power2.out' });
	}

	whileVisible(order) {
		let cameraPos = this.camera.position;
		let modelRotation = this.gltfScene.rotation;
		let textOpacity = this.textMaterial.uniforms.opacity;
		gsap.killTweensOf(cameraPos);
		if (order === 'pre') {
			gsap.fromTo(cameraPos, { y: -0.5 }, { y: 0, duration: this.viewer.scrollAnimeDuration });
		} else {
			gsap.fromTo(cameraPos, { y: 0.5 }, { y: 0, duration: this.viewer.scrollAnimeDuration });
			gsap.fromTo(
				modelRotation,
				{ z: -Math.PI / 15 },
				{ z: -Math.PI / 10, duration: this.viewer.scrollAnimeDuration / 2 }
			);
		}
		gsap.fromTo(textOpacity, { value: 0 }, { value: 1, duration: 1.5, delay: 0.5, ease: 'power2.out' });
		gsap.to(this.animeNameTitle.material.uniforms.opacity, { value: 1, duration: 1, delay: 1, ease: 'power2.out' });
		gsap.to(this.ringBtn, { opacity: 0.5, duration: 1.5, delay: 0.5, ease: 'power2.out' });
		gsap.fromTo(
			this.bgMesh.material.uniforms.vignetteDarkness,
			{ value: 1 },
			{ value: 0.6, duration: 1.5, delay: 0.8, ease: 'power2.out' }
		);
	}

	whileNoVisible(order) {
		let cameraPos = this.camera.position;
		let textOpacity = this.textMaterial.uniforms.opacity;
		gsap.killTweensOf(cameraPos);
		if (order === 'pre') {
			gsap.fromTo(cameraPos, { y: 0 }, { y: 0.5, duration: this.viewer.scrollAnimeDuration });
		} else {
			gsap.fromTo(cameraPos, { y: 0 }, { y: -0.5, duration: this.viewer.scrollAnimeDuration });
		}
		gsap.fromTo(textOpacity, { value: 1 }, { value: 0, duration: 0.5, ease: 'power2.out' });
		gsap.to(this.animeNameTitle.material.uniforms.opacity, { value: 0, duration: 1, ease: 'power2.out' });
		gsap.to(this.ringBtn, { opacity: 0.0, duration: 0.5, ease: 'power2.out' });
	}

	initEvent() {
		if(!this.isMobile) this.eventHandler.onMouseMoveEvent.bind(this.onMouseMove.bind(this));
		this.intersectsArr.push(this.ringBtn.hitArea);
		this.eventHandler.onClickEvent.bind(this.onClick.bind(this));
	}

	onClick() {
		if (!this.visible) return;
		if (this.isMobile) {
			let x = event.clientX;
			let y = event.clientY;
			this.clickNDCPos.set((x / window.innerWidth) * 2 - 1, (-y / window.innerHeight) * 2 + 1);
			this.raycaster.setFromCamera(this.clickNDCPos, this.uiCamera);
			this.intersects = this.raycaster.intersectObjects(this.intersectsArr);
		}
		if (!this.intersects.length) return;
		let intersectsRes = this.intersects[0].object;
		if (intersectsRes.name === 'ringButton') {
			this.openModelViewer();
		} else if (intersectsRes.name === 'closeButton') {
			this.closeModelViewer();
		}
	}

	onMouseMove() {
		if (!this.visible) return;
		this.raycaster.setFromCamera(this.state.pointer.ndcPosition, this.uiCamera);
		this.intersects = this.raycaster.intersectObjects(this.intersectsArr);
		if (this.intersects.length > 0) {
			document.body.setAttribute('cursor', 'pointer');
		} else {
			document.body.removeAttribute('cursor');
		}
	}

	resize(width, height, dpr) {
		const pixelWidth = width * dpr;
		const pixelHeight = height * dpr;
		this.postProcessingMaterial.resize(pixelWidth, pixelHeight);
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
		this.uiCamera.left = -width / 2;
		this.uiCamera.right = width / 2;
		this.uiCamera.top = height / 2;
		this.uiCamera.bottom = -height / 2;
		this.uiCamera.updateProjectionMatrix();
		this.bgMesh.resize(width, height);
		this.resizeText(width, height);
		this.resizeUIPanel(width, height);
	}

	render({ renderer, orthoCamera, target, deltaTime } = {}) {
		if (!this.visible) return;
		this.updateEnvironmentRotation(this.envRotation);
		// BG
		orthoCamera.layers.set(this.layers.BG_LAYER);
		renderer.render(this.scene, orthoCamera);
		// Scene
		renderer.render(this.scene, this.camera);
		// UI
		if (this.isModelViewing) {
			this.closeBtn.update(deltaTime);
		} else {
			this.ringBtn.update(deltaTime);
		}
		if (this.isModelViewing) this.control.update();
		this.uiCamera.layers.set(this.layers.UI_LAYER);
		renderer.render(this.uiScene, this.uiCamera);
	}
}
