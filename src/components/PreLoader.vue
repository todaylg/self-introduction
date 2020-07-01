<template>
	<section :class="isMobile ? 'mobile' : ''" class="loadingContainer" v-if="!loadingAnimeFinished">
		<div class="loadingSVG">
			<svg class="svgOutline svgLoading" viewBox="0 0 33 33">
				<polygon class="svgTriangle" fill="none" stroke="#fff" stroke-width="1" points="16,1 32,32 1,32" />
			</svg>
			<svg class="svgInner svgLoading" viewBox="0 0 33 33">
				<polygon class="svgTriangle" fill="none" stroke="#fff" stroke-width="1" points="16,1 32,32 1,32" />
			</svg>
			<svg class="svgFill" viewBox="0 0 33 33">
				<polygon class="svgTriangle" fill="none" stroke="#fff" stroke-width="1.1" points="16,1 32,32 1,32" />
			</svg>
		</div>
		<div class="loadingText">
			<h1 class="loadingPercent">{{ `${Math.floor(loadingPercentNum)}%` }}</h1>
			<p class="LG">{{ loadingText }}</p>
		</div>
		<p class="Tips">Use a powerful PC<s>(2080Ti above)</s> for a better experience</p>
	</section>
</template>

<script>
import { gsap } from 'gsap';
export default {
	name: 'PreLoader',
	props: ['isLoaded', 'loadingPercent', 'isMobile'],
	data() {
		return {
			loadingPercentNum: 0,
			loadingText: 'LOADING...',
			loadingAnimeFinished: false
		};
	},
	mounted() {},
	watch: {
		loadingPercent(val, oldVal) {
			val *= 100;
			gsap.to(this, { loadingPercentNum: val, duration: 1 });
		},
		isLoaded(val, oldVal) {
			if (val) {
				// 1.SVG
				gsap.to('.svgLoading', { opacity: 0, duration: 0.5 });
				gsap.to('.svgFill', {
					opacity: 1,
					duration: 1,
					onComplete: () => {
						// LG Text
						this.loadingText = 'LG';
						gsap.to('.loadingContainer', {
							opacity: 0,
							duration: 1,
							delay: 0.4,
							onComplete: () => {
								this.loadingAnimeFinished = true;
							}
						});
					}
				});
			}
		}
	}
};
</script>

<style lang="less">
// Loading
.loadingContainer {
	position: absolute;
	height: 100%;
	width: 100vw;
	background: #000000;
	color: #ffffff;
	text-align: center;
	.loadingSVG {
		position: absolute;
		top: 45%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 10vw;
		svg {
			bottom: 0;
			right: 0;
			position: absolute;
			width: 100%;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			&.svgInner .svgTriangle {
				stroke-dasharray: 17;
				animation: dash 3.5s cubic-bezier(0.35, 0.04, 0.63, 0.95) infinite;
			}
			&.svgOutline .svgTriangle {
				stroke: rgba(255, 255, 255, 0.2);
				fill: none;
				stroke-width: 1.4px;
			}
			&.svgFill {
				opacity: 0;
			}
		}
	}
	.loadingText {
		position: absolute;
		bottom: 15%;
		left: 50%;
		transform: translate(-50%, 0);
		width: 233px;
		text-align: center;
		.LG {
			margin-top: 50px;
			position: relative;
			font-size: 20px;
			letter-spacing: 3px;
			opacity: 0;
			text-transform: uppercase;
			animation: fadeIn 2.5s forwards;

			&::before,
			&::after {
				position: absolute;
				content: '';
				top: 0;
				bottom: 0;
				width: 2px;
				opacity: 0;
				height: 100%;
				background: white;
			}

			&::before {
				left: 50%;
				animation: slideLeft 1s forwards;
			}

			&::after {
				right: 50%;
				animation: slideRight 1s forwards;
			}
		}
	}
	.Tips {
		font-size: 15px;
		margin-top: 35px;
		opacity: 0;
		bottom: 5%;
		position: absolute;
		left: 50%;
		transform: translate(-50%, 0);
		animation: fadeInTips 1s forwards;
	}
}

.loadingContainer.mobile {
	.loadingSVG {
		width: 30vw;
	}
}

@keyframes fadeIn {
	to {
		opacity: 1;
	}
}

@keyframes fadeInTips {
	to {
		opacity: 0.6;
	}
}

@keyframes slideLeft {
	to {
		left: -2%;
		opacity: 1;
	}
}

@keyframes slideRight {
	to {
		right: -2%;
		opacity: 1;
	}
}

@keyframes dash {
	to {
		stroke-dashoffset: 136;
	}
}
</style>
