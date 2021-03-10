const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

const V_SHADER_DATA = `
attribute vec3 a_position;
attribute vec3 a_color;

uniform mat4 u_modelMat;
// attribute mat4 a_viewMat;
uniform mat4 u_projMat;

varying vec3 v_color;
void main() {
    gl_Position = u_projMat * u_modelMat * vec4(a_position, 1);
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

const vertexColor = new Float32Array([
    -0.8, 0.8, -1,  1, 0, 0,
    0.8, 0.8, -1,  0, 1, 0,
    -0.8, -0.8, -1, 0, 0, 1,
    0.8, -0.8, -1, 1, 1, 1
]);

const index = new Int16Array([
    0, 1, 2,
    3, 2, 1
]);

function start() {
    const vShader = createShader(gl, gl.VERTEX_SHADER, V_SHADER_DATA);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, F_SHADER_DATA);

    const program = initProgram(gl, vShader, fShader);
    
    const vcBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vcBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexColor, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'a_position');
    const aColor = gl.getAttribLocation(program, 'a_color');

    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, vertexColor.BYTES_PER_ELEMENT * 6, 0);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, vertexColor.BYTES_PER_ELEMENT * 6, vertexColor.BYTES_PER_ELEMENT * 3);

    gl.enableVertexAttribArray(aPosition);
    gl.enableVertexAttribArray(aColor);

    // proj
    let projMat = mat4.create();
    mat4.perspective(projMat, 90, 1, 0.01, 100);
    const uProjMat = gl.getUniformLocation(program, 'u_projMat');
    gl.uniformMatrix4fv(uProjMat, false, projMat);

    let modelMat = mat4.create();
    let rotationXMat = mat4.create();
    let rotationYMat = mat4.create();
    mat4.fromXRotation(rotationXMat, 1.0);
    mat4.fromYRotation(rotationYMat, 1.0);
    mat4.multiply(modelMat, rotationYMat, rotationXMat);

    const uModelMat = gl.getUniformLocation(program, 'u_modelMat');
    gl.uniformMatrix4fv(uModelMat, false, modelMat);


    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
}


start();