precision highp float;

uniform float uTime;
uniform float uProgress;
uniform sampler2D uTextures[2];
varying vec3 vPosition;
varying vec2 vUv;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d);

void main() {
    float noiseRange = 2.;

    vec2 st = (vUv * 2.0 - 1.0); // [-1, 1]
    float circleOut = 1. - smoothstep(0.6, 1., length(st));
    float circleIn = 1. - smoothstep(0.4, 0.8, length(st));
    float noise = (snoise3(vec3(st * (1.5 + noiseRange * .1) + vec2(sin(uTime), cos(uTime)), uTime + noiseRange * 100.)) + 1.5) / 2.;

    float mask = circleOut * noise + circleIn;
    float opacity = 1.0 - step(mask, 0.15);

    vec4 texColorPrev =  texture2D(uTextures[0], vUv);
    vec4 texColorNext = texture2D(uTextures[1], vUv);

    float progress = uProgress + noise * 0.1;
    float intpl = smoothstep(0., 1., (progress*2. - vUv.x));
    vec4 finColor = mix(texColorPrev, texColorNext, intpl);

    // gl_FragColor = vec4(vec3(opacity) , 1.);
    gl_FragColor = vec4(finColor.rgb, opacity);
}