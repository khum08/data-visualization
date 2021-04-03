const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);


const V_SHADER_DATA = `
attribute vec3 aPosition;

void main() {
    gl_Position = vec4(aPosition, 1.0);
}
`;

const F_SHADER_DATA = `
#ifdef GL_ES
precision mediump float;
#endif
uniform vec3 uColor;
void main() {
    gl_FragColor = vec4(uColor, 1.0);
}
`;

const vertex = new Float32Array([
    0, 0.5, 0,
    -0.5, -0.5, 0,
    0.5, -0.5, 0
]);

function start() {
    let vShader = createShader(gl, gl.VERTEX_SHADER, V_SHADER_DATA);
    let fShader = createShader(gl, gl.FRAGMENT_SHADER, F_SHADER_DATA);

    let program = initProgram(gl, vShader, fShader);
    gl.useProgram(program);

    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertex, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(program, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    const uColor = gl.getUniformLocation(program, 'uColor');
    gl.uniform3fv(uColor, new Float32Array([1.0, 0.0, 0.0]));

    gl.drawArrays(gl.TRIANGLES, 0, 3);


}

start();