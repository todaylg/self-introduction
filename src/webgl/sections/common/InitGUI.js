function initBGGUI(gui, bgMaterial) {
	let bgMaterialUniforms = bgMaterial.uniforms;
	let params = {
		bgBaseColor: bgMaterialUniforms.baseColor.value.getStyle(),
		bgArea1Color: bgMaterialUniforms.area1Color.value.getStyle(),
		bgArea2Color: bgMaterialUniforms.area2Color.value.getStyle(),
		bgArea1PosX: bgMaterialUniforms.area1Position.value.x,
		bgArea1PosY: bgMaterialUniforms.area1Position.value.y,
		bgArea2PosX: bgMaterialUniforms.area2Position.value.x,
		bgArea2PosY: bgMaterialUniforms.area2Position.value.y,
		bgStrengthFactor: bgMaterialUniforms.strengthFactor.value,
		bgArea1Radius: bgMaterialUniforms.area1Radius.value,
		bgArea2Radius: bgMaterialUniforms.area2Radius.value,
		bgNoiseStrength: bgMaterialUniforms.noiseStrength.value,
		bgOpacity: bgMaterialUniforms.opacity.value
	};
	// Background
	const bgFolder = gui.addFolder('Background');
	bgFolder
		.addColor(params, 'bgBaseColor')
		.name('baseColor')
		.onChange(value => {
			bgMaterialUniforms.baseColor.value.setStyle(value);
		});
	// Area1
	bgFolder
		.addColor(params, 'bgArea1Color')
		.name('area1Color')
		.onChange(value => {
			bgMaterialUniforms.area1Color.value.setStyle(value);
		});
	bgFolder
		.add(params, 'bgArea1PosX', 0, 1)
		.name('area1PosX')
		.onChange(value => {
			bgMaterialUniforms.area1Position.value.x = value;
		});
	bgFolder
		.add(params, 'bgArea1PosY', 0, 1)
		.step(0.01)
		.name('area1PosY')
		.onChange(value => {
			bgMaterialUniforms.area1Position.value.y = value;
		});
	bgFolder
		.add(params, 'bgArea1Radius', 0, 1)
		.name('area1Radius')
		.onChange(value => {
			bgMaterialUniforms.area1Radius.value = value;
		});
	// Area2
	bgFolder
		.addColor(params, 'bgArea2Color')
		.name('area2Color')
		.onChange(value => {
			bgMaterialUniforms.area2Color.value.setStyle(value);
		});
	bgFolder
		.add(params, 'bgArea2PosX', 0, 1)
		.name('area2PosX')
		.onChange(value => {
			bgMaterialUniforms.area2Position.value.x = value;
		});
	bgFolder
		.add(params, 'bgArea2PosY', 0, 1)
		.name('area2PosY')
		.onChange(value => {
			bgMaterialUniforms.area2Position.value.y = value;
		});
	bgFolder
		.add(params, 'bgArea2Radius', 0, 1)
		.name('area2Radius')
		.onChange(value => {
			bgMaterialUniforms.area2Radius.value = value;
		});
	// Other
	bgFolder
		.add(params, 'bgStrengthFactor', 0, 1)
		.name('strengthFactor')
		.onChange(value => {
			bgMaterialUniforms.strengthFactor.value = value;
		});
	bgFolder
		.add(params, 'bgNoiseStrength', 0, 1)
		.name('noiseStrength')
		.onChange(value => {
			bgMaterialUniforms.noiseStrength.value = value;
		});
	bgFolder
		.add(params, 'bgOpacity', 0, 1)
		.name('opacity')
		.onChange(value => {
			bgMaterialUniforms.opacity.value = value;
		});
	bgFolder.open();
}

function initAnimeTitleGUI(gui, material) {
	let uniforms = material.uniforms;
	let params = {
		topColor: uniforms.topColor.value.getStyle(),
		bottomColor: uniforms.bottomColor.value.getStyle()
	};
	// AnimeNameTitle
	const animeTitleFolder = gui.addFolder('AnimeNameTitle');
	animeTitleFolder.addColor(params, 'topColor').onChange(value => {
		uniforms.topColor.value.setStyle(value);
	});
	animeTitleFolder.addColor(params, 'bottomColor').onChange(value => {
		uniforms.bottomColor.value.setStyle(value);
	});
	animeTitleFolder.open();
}

export { initBGGUI, initAnimeTitleGUI };
