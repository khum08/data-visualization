const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl', {
    antialias: true
});
gl.viewport(0, 0, canvas.width, canvas.height);


const V_SHADER_DATA = `
attribute vec3 aPosition;
attribute vec3 aColor;

uniform mat4 uModelMat;
uniform mat4 uViewMat;
uniform mat4 uProjMat;

varying vec3 vColor;

void main() {
    // gl_Position = uProjMat * uViewMat * uModelMat * vec4(aPosition, 1.0);
    gl_Position = uProjMat * uViewMat * uModelMat * vec4(aPosition, 1.0);
    vColor = aColor;
}
`;

const F_SHADER_DATA = `
#ifdef GL_ES
precision mediump float;
#endif
varying vec3 vColor;
void main() {
    gl_FragColor = vec4(vColor, 1.0);
}
`;

// const vertexColor = new Float32Array([
//     -0.8, 0.8, 0,  1, 0, 0,
//     0.8, 0.8, 0,  0, 1, 0,
//     -0.8, -0.8, 0, 0, 0, 1,
//     0.8, -0.8, 0, 1, 1, 1
// ]);

// const index = new Int16Array([
//     0, 1, 2,
//     3, 2, 1
// ]);

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

let modelMat = glMatrix.mat4.create();

let projMat = glMatrix.mat4.create();

let uModelMat;


function start() {
    const vShader = createShader(gl, gl.VERTEX_SHADER, V_SHADER_DATA);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, F_SHADER_DATA);

    const program = initProgram(gl, vShader, fShader);

    
    const vcBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vcBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 6 * vertices.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(aPosition);

    const aColor = gl.getAttribLocation(program, 'aColor');
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 6 * vertices.BYTES_PER_ELEMENT, 3 * vertices.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(aColor);

    const idxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);


    // ============ model ============
    uModelMat = gl.getUniformLocation(program, 'uModelMat');

    // scale
    let scaling = glMatrix.vec3.fromValues(0.6, 0.6, 0.6);
    glMatrix.mat4.scale(modelMat, modelMat, scaling);

    // rotate
    glMatrix.mat4.rotateX(modelMat, modelMat, 0.5);


    // translate
    let translationMat = glMatrix.mat4.create()
    let translateV = glMatrix.vec3.fromValues(0, 0, -2);
    glMatrix.mat4.fromTranslation(translationMat, translateV);
    glMatrix.mat4.multiply(modelMat, translationMat, modelMat);

    // ============ view ============
    let viewMat = glMatrix.mat4.create();
    let eyePosition = glMatrix.vec3.fromValues(0, 0, 0);
    let center = glMatrix.vec3.fromValues(0, 0, -1);
    let up = glMatrix.vec3.fromValues(0, 1, 0);
    glMatrix.mat4.lookAt(viewMat, eyePosition, center, up);
    const uViewMat = gl.getUniformLocation(program, 'uViewMat');
    gl.uniformMatrix4fv(uViewMat, false, viewMat);


    // ============ proj ============
    glMatrix.mat4.perspective(projMat, 90, 1, 0.01, 100);
    const uProjMat = gl.getUniformLocation(program, 'uProjMat');
    gl.uniformMatrix4fv(uProjMat, false, projMat);
    gl.enable(gl.DEPTH_TEST);

    
    update();
}


function update() {

    // rotate
    glMatrix.mat4.rotateY(modelMat, modelMat, 0.01);
    // glMatrix.mat4.fromYRotation(rotationYMat, rotateY);
    // glMatrix.mat4.multiply(modelMat, modelMat, rotationYMat);
    gl.uniformMatrix4fv(uModelMat, false, modelMat);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_BYTE, 0);
    gl.drawElements(gl.LINES, index.length, gl.UNSIGNED_BYTE, 0);

    requestAnimationFrame(update);
}

start();