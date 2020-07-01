<template>
	<div class="wrapper">
		<div id="canvasContainer"></div>
		<div class="uiContainer">
			<ConactPanel :isMobile="isMobile" :isOpenConactPanel="isOpenConactPanel"></ConactPanel>
		</div>
		<PreLoader :isMobile='isMobile' :isLoaded='isLoaded' :loadingPercent='loadingPercent'></PreLoader>
	</div>
</template>

<script>
import { isMobile } from 'JS/Utils';
import MainScene from 'WEBGL/MainScene';
import PreLoader from 'COMPONENT/PreLoader';
import ConactPanel from 'COMPONENT/ConactPanel';

export default {
	name: 'MainScene',
	components: {
		PreLoader,
		ConactPanel
	},
	data() {
		return {
			isMobile: isMobile(),
			isLoaded: false,
			loadingPercent: 0,
			isOpenConactPanel: false
		};
	},
	mounted() {
		let containerEle = document.querySelector('#canvasContainer');
		this.mainScene = new MainScene(containerEle, this.isMobile, this.toggleConactPanel.bind(this));
		this.mainScene.loadAssets(
			persent => {
				this.updateProgress(persent);
			},
			() => {
				this.loadCompelete();
			}
		);
	},
	methods: {
		updateProgress(persent) {
			this.loadingPercent = persent;
		},
		loadCompelete() {
			this.mainScene.initScene();
			console.log('Loaded!!');
			this.isLoaded = true;
			this.mainScene.entryAnime();
		},
		toggleConactPanel(status) {
			this.isOpenConactPanel = status;
		}
	}
};
</script>

<style lang="less">
html,
body {
	margin: 0;
	padding: 0;
    position: fixed;
	box-sizing: border-box;
	background: #000;
	user-select: none;
	overflow: hidden;
}

a {
	text-decoration: none;
}

body[cursor='pointer'] {
	cursor: pointer;
}

.wrapper {
	width: 100vw;
	height: 100vh;
	position: relative;
	overflow: hidden;
}

// Hide gui default
.dg.main {
	display: none;
	opacity: 0;
}

#canvasContainer {
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	position: fixed;
	overflow: hidden;
}

.uiContainer {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	overflow: hidden;
}
</style>
