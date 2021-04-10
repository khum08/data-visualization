console.log('test');
var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl', {
    antialias: true
});

gl.clearColor(0.0, 0, 0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const V_SHADER_DATA = `
attribute vec3 aPosition;

uniform mat4 uModelMat;
uniform mat4 uViewMat;
uniform mat4 uProjMat;
void main() {
    gl_Position = vec4(aPosition, 1.0);
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

const vertices = new Float32Array([
    0, 1, 0,
    -1, -1, 0,
    1, -1, 0
]);

function start() {
    const vShader = createShader(gl, gl.VERTEX_SHADER, V_SHADER_DATA);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, F_SHADER_DATA);

    const program = initProgram(gl, vShader, fShader);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    update();
}

function update() {

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(update);
}

start();