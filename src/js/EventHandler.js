import * as THREE from 'three';
import Signal from 'JS/Signal';
import normalizeWheel from 'normalize-wheel';

export class EventHandler {
	constructor(isMobile) {
		this.isMobile = isMobile;
		this.initEvent();
		this.time = +new Date();
		this.lastTime = null;
		this.touchStartPos = new THREE.Vector2();
		this.touchMovePos = new THREE.Vector2();
	}

	initEvent() {
		if (!this.isMobile) {
			// PC
			this.onMouseMoveEvent = new Signal();
			this.onScrollEvent = new Signal();
			document.addEventListener('mousemove', this.onMouseMove.bind(this), { passive: true });
			document.addEventListener('wheel', this.onScroll.bind(this), { passive: false });
		} else {
			// Mobile
			this.onTouchMoveEvent = new Signal();
			document.addEventListener('touchstart', this.onTouchStart.bind(this));
			document.addEventListener('touchmove', this.onTouchMove.bind(this));
		}
		this.onClickEvent = new Signal();
		document.addEventListener('click', this.onClick.bind(this));
	}

	onClick(event) {
		this.onClickEvent.dispatch(event);
	}

	onMouseMove(event) {
		this.onMouseMoveEvent.dispatch(event);
	}

	onScroll(event) {
		// 禁止滚动回弹
		event.preventDefault();
		this.time = +new Date();
		// 节流缓解神奇的触控板延后触发
		if (this.time - this.lastTime > 1400 || !this.lastTime) {
			let normalEvent = normalizeWheel(event);
			this.onScrollEvent.dispatch(normalEvent);
			this.lastTime = this.time;
		}
	}

	onTouchStart(event) {
		this.touchStartPos.set(event.touches[0].clientX, event.touches[0].clientY);
	}

	onTouchMove(event) {
		this.touchMovePos.set(event.touches[0].clientX, event.touches[0].clientY);
		let offset = {
			x: this.touchMovePos.x,
			y: this.touchMovePos.y,
			offsetX: this.touchMovePos.x - this.touchStartPos.x,
			offsetY: this.touchMovePos.y - this.touchStartPos.y
		};
		this.onTouchMoveEvent.dispatch(offset);
	}
}
