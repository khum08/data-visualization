const canvas = document.getElementById('canvas');
const renderer = new WebGLRenderer(canvas);

const V_SHADER_DATA = `
attribute vec3 a_position;
attribute vec3 a_color;
uniform float rad;
varying vec3 v_color;

void main() {
    // mat3 rotation = mat3(
    //     cos(rad), 0.0, sin(rad),
    //     0.0, 1.0, 0.0,
    //     -sin(rad), 0.0, cos(rad)
    // );
    mat4 rotateMatrix = mat4(
        cos(rad), 0.0, sin(rad), 0.0,
        0.0, 1.0, 0.0, 0.0,
        -sin(rad), 0.0, cos(rad), 0.0,
        0.0, 0.0, 0.0, 1.0
    );

    float rad2 = 1.0;
    mat4 rotateMatrix2 = mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, cos(rad2), sin(rad2), 0.0,
        0.0, -sin(rad2), cos(rad2), 0.0,
        0.0, 0.0, 0.0, 1.0
    );

    mat4 transMatrix = mat4(
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.1, 0.2, 0.0, 1.0
    );
    mat4 scaleMatrix = mat4(
        0.5, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0,
        0.0, 0.0, 0.5, 0.0,
        0.0, 0.0, 0.0, 1.0
    );
    
    gl_Position = transMatrix * rotateMatrix * rotateMatrix2 * scaleMatrix * vec4(a_position, 1.0);
    v_color = a_color;
}
`;

const F_SHADER_DATA = `
#ifdef GL_ES
precision mediump float;
#endif
varying vec3 v_color;
void main() {
    gl_FragColor = vec4(v_color, 1.0);
}
`;

const vertices = new Float32Array([
    -1, 1, -1,  1.0, 0.0, 0.0,
    -1, -1, -1,  0.0, 1.0, 0.0,
    1, 1, -1,  0.0, 0.0, 1.0,
    1, -1, -1,  1.0, 1.0, 1.0,

    -1, 1, 1, 1.0, 1.0, 0.0,
    -1, -1, 1, 0.0, 1.0, 1.0,
    1, 1, 1, 1.0, 0.0, 1.0,
    1, -1, 1, 1.0, 1.0, 1.0

]);


const index = new Int8Array([
    0,1,2,// back
    3,2,1,

    6,7,4,// front
    5,4,7,

    2,6,0, //up
    4,0,6,

    7,3,5, //down
    1,5,3,

    4,5,0, //left
    1,0,5,

    2,3,6, //right
    7,6,3

]);


function start() {
    const program = renderer.createProgram(V_SHADER_DATA, F_SHADER_DATA);
    renderer.useProgram(program);

    const {gl} = renderer;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // face cull
    gl.enable(gl.CULL_FACE);
    // gl.frontFace(gl.CCW);
    gl.frontFace(gl.CW);

    // depth test
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);

    
    const verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 6 * 4, 0);
    gl.enableVertexAttribArray(aPosition);

    const aColor = gl.getAttribLocation(program, 'a_color');
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 6 * 4, 3 * 4);
    gl.enableVertexAttribArray(aColor);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

    update();
}

let rad = 0.0;
function update() {
    const {gl, program} = renderer;
    const uRad = gl.getUniformLocation(program, 'rad');
    gl.uniform1f(uRad, rad += 0.01);

    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_BYTE, 0);
    gl.drawElements(gl.LINES, index.length, gl.UNSIGNED_BYTE, 0);
    requestAnimationFrame(update);
}

start();