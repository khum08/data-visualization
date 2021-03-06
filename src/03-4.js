const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

const V_SHADER_DATA = `
attribute vec3 a_position;
attribute vec2 a_uv;

varying vec2 v_uv;
void main() {
    v_uv = a_uv;
    gl_Position = vec4(a_position, 1.0);
}
`;

const F_SHADER_DATA = `
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_sampler;
varying vec2 v_uv;
void main() {
    vec4 color = texture2D(u_sampler, v_uv);
    // gray image
    float v = 0.2126 * color.x + 0.7152 * color.y + 0.0722 * color.z;

    // type 1
    // gl_FragColor = texture2D(u_sampler, v_uv);

    // type 2
    gl_FragColor.xyz = texture2D(u_sampler, v_uv).xyz;
    gl_FragColor.a = 1.0 - min(distance(v_uv, vec2(0.5, 0.5)) * 2.0, 1.0);
    
    // type 3
    // gl_FragColor = vec4(vec3(v), color.z);
}
`;

function createTexture(gl, img) {
    const texture = gl.createTexture();
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

function setTexture(gl, idx, texture) {
    gl.activeTexture(gl.TEXTURE0 + idx);
    
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const uSampler = gl.getUniformLocation(gl.program, 'u_sampler');
    gl.uniform1i(uSampler, idx);
    // gl.bindTexture(gl.TEXTURE_2D, null);
}

const vertices = new Float32Array([
    -1.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, 1.0, 0.0,
    1.0, -1.0, 0.0
]);

const index = new Uint16Array([
    0, 1, 2,
    1, 2, 3
]);

const uv = new Float32Array([
   0.0, 1.0,
   0.0, 0.0,
   1.0, 1.0,
   1.0, 0.0
]);

function loadImage(url) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    return new Promise(function(resolve, reject) {
        img.onload = () => {
            resolve(img);
        }
        img.src = url;
    });
}

async function start() {
    const vShader = createShader(gl, gl.VERTEX_SHADER, V_SHADER_DATA);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, F_SHADER_DATA);

    const program = initProgram(gl, vShader, fShader);
    
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    const aUv = gl.getAttribLocation(program, 'a_uv');
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aUv);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);

    let url = '../assets/splash.jpg';
    let image = await loadImage(url);
   
    const texture = createTexture(gl, image);
    setTexture(gl, 0, texture);


    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
    // gl.drawArrays(gl.LINES, 0, 4);
}

start();



