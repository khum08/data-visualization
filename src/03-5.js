console.log('start');
let canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
let effectBtn = document.getElementById('effect');
let typeBtn = document.getElementById('type');

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
uniform float u_time;
uniform int u_type;
varying vec2 v_uv;

float random(vec2 st) {
    float temp = dot(st.xy, vec2(12.9898, 78.111));
    return fract(sin(temp) * 31415.9265);
}

// type 0
vec4 getColor() {
    return texture2D(u_sampler, v_uv);
}

// type1
vec4 getColor1() {
    // change to 100 * 50;
    vec2 st = v_uv * vec2(160, 80);
    // uv 0-2;
    vec2 uv = v_uv + 1.0 - 2.0 * random(floor(st));
    vec4 color = texture2D(u_sampler, mix(uv, v_uv, min(u_time, 1.0)));

    return vec4(color.xyz, min(u_time, 1.0));
    // gl_FragColor.xyz = color.xyz;
    // gl_FragColor.a = min(u_time, 1.0);
}

// type2
vec4 getColor2() {

    vec2 st = v_uv * vec2(100.0, 50.0);
    float d = distance(fract(st), vec2(0.5));

    float p = u_time + random(floor(st));

    // shading [0.5, 1];
    float shading = 0.5 + 0.5 * sin(p);
    
    // d [0, 1];
    d = smoothstep(d, d + 0.01, 1.0 * shading);

    vec4 color = texture2D(u_sampler, v_uv);

    vec3 rgb = color.rgb * clamp(0.1, 1.3, d + shading);

    return vec4(rgb, color.a);

    // return vec4(0.0, 0.0, 1.0, 1.0);
}

void main() {
    if (u_type == 0) {
        gl_FragColor = getColor();
    } else if (u_type == 1) {
        gl_FragColor = getColor1();
    } else if (u_type == 2) {
        gl_FragColor = getColor2();
    }
    else {
        gl_FragColor = getColor();
    }
}
`;

const vertex = new Float32Array([
    -1, 1, 0,
    -1, -1, 0,
    1, 1, 0,
    1, -1, 0
]);

const uv = new Float32Array([
    0, 1,
    0, 0,
    1, 1,
    1, 0
]);

const index = new Int16Array([
    0, 1, 2,
    3, 2, 1
]);

let url = '../assets/splash.jpg';


async function start() {
    const vShader = createShader(gl, gl.VERTEX_SHADER, V_SHADER_DATA);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, F_SHADER_DATA);

    const program = initProgram(gl, vShader, fShader);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertex, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    const image = await loadImage(url);

    const texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const uSampler = gl.getUniformLocation(program, 'u_sampler');
    gl.uniform1i(uSampler, 0);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    const aUV = gl.getAttribLocation(program, 'a_uv');
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aUV);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
    
    // gl.clearColor(0, 0, 1, 1);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
    update();

}

let delta = 0;
let clicked = false;
let effectType = 0;

function update(time) {

    let cTime = (time - delta) / 1200;
    if (clicked) {
        delta = time;
        clicked = false;
    }

    const uType = gl.getUniformLocation(gl.program, 'u_type');
    gl.uniform1i(uType, effectType);

    const uTime = gl.getUniformLocation(gl.program, 'u_time');
    gl.uniform1f(uTime, cTime);

    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(update);
}

effectBtn.addEventListener('click', function(e) {
    clicked = true;
});

typeBtn.addEventListener('click', function(e) {
    effectType = (effectType + 1) % 3;
    typeBtn.innerText = 'effect type ' + effectType;
})




start();



