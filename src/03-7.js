const canvas = document.getElementById('canvas');
// const gl = canvas.getContext('webgl');
let renderer = new WebGLRenderer(canvas);

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
uniform sampler2D u_sampler2;
varying vec2 v_uv;
void main() {
    vec4 color1 = texture2D(u_sampler, v_uv);
    vec4 color2 = texture2D(u_sampler2, v_uv);
    // if (v_uv.x > 0.5) {
    //     gl_FragColor = color1;
    // } else {
    //     gl_FragColor = color2;
    // }

    gl_FragColor = color1 + color2;
}
`;

let url = '../assets/splash.jpg';
let url2 = '../assets/sunlight.png';

const vertices = new Float32Array([
    -0.8, 0.8, 0.0,
    -0.8, -0.8, 0.0,
    0.8, 0.8, 0.0,
    0.8, -0.8, 0.0
]);

const index = new Int8Array([
   0, 1, 2,
   1, 2, 3
]);

const uv = new Float32Array([
    0, 1,
    0, 0,
    1, 1,
    1, 0
]);

async function start() {

    let program = renderer.createProgram(V_SHADER_DATA, F_SHADER_DATA);
    renderer.useProgram(program);

    const texture = await renderer.loadTexture(url);
    const texture2 = await renderer.loadTexture(url2);

    renderer.shaderData({
        attributes: {
            a_position: {
                count: 3,
                value: vertices
            },
            a_uv: {
                count: 2,
                value: uv
            }
        },
        index: index,
        uniforms: {
            u_sampler: texture,
            u_sampler2: texture2,
        }
    });

    renderer.render();

}

start();
