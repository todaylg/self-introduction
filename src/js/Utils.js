import * as THREE from 'three';

function getEleWidth(element) {
	let res;
	if (element.currentStyle) {
		res = element.currentStyle.width; // For IE
	} else {
		res = getComputedStyle(element, false).width;
	}
	// Get number
	if (~res.indexOf('px')) res = res.slice(0, -2);
	return Number(res);
}

function getEleHeight(element) {
	let res;
	if (element.currentStyle) {
		res = element.currentStyle.height;
	} else {
		res = getComputedStyle(element, false).height;
	}
	if (~res.indexOf('px')) res = res.slice(0, -2);
	return Number(res);
}

function isMobile() {
	let e = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
	return e || /Android|webOS|BlackBerry|Opera Mini|Opera Mobi|IEMobile/i.test(navigator.userAgent);
}

function debounce(callback, duration) {
	let timer;
	return function (event) {
		clearTimeout(timer);
		timer = setTimeout(() => {
			callback(event);
		}, duration);
	};
}

function throttle(callback, duration) {
	let _lastTime = null;
	return function (event) {
		let _nowTime = +new Date();
		if (_nowTime - _lastTime > duration || !_lastTime) {
			callback(event);
			_lastTime = _nowTime;
		}
	};
}

function checkLODSupport() {
	let ctx = document.createElement('canvas').getContext('webgl');
	return ctx.getExtension('EXT_shader_texture_lod');
}

function computeMeshBoundingBox(mesh) {
	let box = new THREE.Box3();
	mesh.geometry.computeBoundingBox();
	box.copy(mesh.geometry.boundingBox);
	return {
		min: box.min,
		max: box.max,
		length: new THREE.Vector3().subVectors(box.max, box.min)
	};
}

// Math
const PI2 = Math.PI * 2.0;

function randomInRange(min, max) {
	return min + Math.random() * (max - min);
}

function randomInt(low, high) {
	return low + Math.floor(Math.random() * (high - low + 1));
}

function randomFloat(low, high) {
	return low + Math.random() * (high - low);
}

function easeOutSine(t, b, c, d) {
	return c * Math.sin((t / d) * (Math.PI / 2)) + b;
}

function symmetryRandom() {
	return Math.random() * 2.0 - 1.0;
}

function clamp(value, min, max) {
	return Math.min(Math.max(value, min), max);
}

export {
	getEleWidth,
	getEleHeight,
	isMobile,
	debounce,
	throttle,
	checkLODSupport,
	computeMeshBoundingBox,
	PI2,
	randomInRange,
	randomInt,
	randomFloat,
	easeOutSine,
	symmetryRandom,
	clamp
};
