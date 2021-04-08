console.log('test');
var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl', {
    antialias: true
});

gl.clearColor(1.0, 0, 0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const V_SHADER_DATA = `
attribute vec3 aPosition;

uniform mat4 uModelMat;
uniform mat4 uViewMat;
uniform mat4 uProjMat;
void main() {
    gl_Position = aPosition;
}
`;

const F_SHADER_DATA = `
#ifdef GL_ES
precision mediump float;
#endif
void main() {
    gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
}
`;

function start() {
    
}

function update() {
    requestAnimationFrame(update);
}

start();