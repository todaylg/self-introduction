precision highp float;
uniform sampler2D map;
varying vec2 vUv;
uniform float progress;
uniform vec2 resolution;
uniform bool isNext;
#define M_PI 3.1415926535897932384626433832795

void main() {
    vec2 uv = vUv;
    vec4 color = texture2D(map, uv);
    
    float y = gl_FragCoord.y / resolution.y; // [0, 1]

    // https://codepen.io/ReGGae/pen/rNxpVEd?editors=0010
    // float x = gl_FragCoord.x / resolution.x; // [0, 1]
    // y -= ((sin(x * M_PI) * 1.) * .25);
  
    float opacity = step(progress, y);
    if(isNext){
        opacity = 1. - opacity;
    }
    gl_FragColor = vec4(
        vec3( ( color.rgb ) / color.a ),
        opacity
    );
    // Test scissor
    // gl_FragColor = vec4(color);
}
