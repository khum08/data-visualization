const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

const V_SHADER_DATA = `
attribute vec3 a_position;
attribute vec2 a_uv;
varying vec2 v_uv;
void main() {
    gl_Position = vec4(a_position, 1.0);
    v_uv = a_uv;
}
`;

const F_SHADER_DATA = `
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D u_sampler;
varying vec2 v_uv;
void main() {
    gl_FragColor = texture2D(u_sampler, v_uv);
}
`;

const vertices = new Float32Array([
    -0.8, 0.8, 0,
    -0.8, -0.8, 0,
    0.8, 0.8, 0,
    0.8, -0.8, 0
]);
const uv = new Float32Array([
    0, 1,
    0, 0,
    1, 1,
    1, 0
]);

let videoUrl = '../screenshot/sintel.mp4';

function createTexture(image, idx) {
    const texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.bindTexture(gl.TEXTURE_2D, null);

    return texture;
}

function setTexture(texture, idx) {
    gl.activeTexture(gl.TEXTURE0 + idx);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const uSamper = gl.getUniformLocation(gl.program, 'u_sampler');
    gl.uniform1i(uSamper, idx);
}

function loadVideo(url) {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    return new Promise(resolve => {
        console.log('load');
        video.addEventListener('canplay', () => {
            console.log('canplay');
            // document.body.appendChild(video);
            resolve(video);
        });
        video.src = url;
        video.load();

    });
}

let textureIdx = 0;
let video;

async function start() {
    const vShader = createShader(gl, gl.VERTEX_SHADER, V_SHADER_DATA);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, F_SHADER_DATA);

    const program = initProgram(gl, vShader, fShader);

    const verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    const aUV = gl.getAttribLocation(program, 'a_uv');
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aUV);

    video = await loadVideo(videoUrl);

    update();
}

function update() {
    let texture = createTexture(video, textureIdx);
    setTexture(texture, textureIdx);

    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(update);
}

let control = document.getElementById('control');
let stat = false;
control.addEventListener('click', () => {
    if (stat) {
        control.innerText = 'play';
        video.pause();
    } else {
        control.innerText = 'pause';
        video.play();
    }
    stat = !stat;
});
start();


