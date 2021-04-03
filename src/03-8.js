let canvas = document.getElementById('canvas');
let gl = canvas.getContext('webgl');
gl.clearColor(1, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

const V_SHADER_DATA = `
attribute vec3 a_position;
void main() {
    gl_Position = vec4(a_position, 1.0);
}
`;

const F_SHADER_DATA = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 u_color;
void main() {
    gl_FragColor = u_color;
}
`;

const vertices = new Float32Array([
    -1, 1, 0,
    -1, -1, 0,
    1, 1, 0,
    1, -1, 0
]);

const color = new Float32Array([
    0, 0, 1, 1
]);

function start() {
    let vShader = createShader(gl, gl.VERTEX_SHADER, V_SHADER_DATA);
    let fShader = createShader(gl, gl.FRAGMENT_SHADER, F_SHADER_DATA);

    let program = initProgram(gl, vShader, fShader);

    gl.useProgram(program);

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    let aPosition = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    let uColor = gl.getUniformLocation(program, 'u_color');
    gl.uniform4fv(uColor, color);

    gl.drawArrays(gl.TRIANGLES, 0, 3);


}




start();