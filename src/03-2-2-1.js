const V_SHADER_DATA2 = `
attribute vec3 a_position;
attribute vec2 a_uv;

varying vec2 v_uv;
void main() {
    gl_PointSize = 1.0;
    gl_Position = vec4(a_position, 1.0);
    v_uv = a_uv;
}
`;

const F_SHADER_DATA2 = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
varying vec2 v_uv;

float random(vec2 st) {
    // return 0.3;
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
    vec2 st = v_uv * vec2(100.0, 50.0);

    st.x -= (1.0 + 10.0 * random(vec2(floor(st.y)))) * u_time;

    vec2 ipos = floor(st);
    vec2 fpos = fract(st);

    vec3 color = vec3(step(random(ipos), 0.7));
    color *= step(0.2, fpos.y);

    gl_FragColor.rgb = color;
    gl_FragColor.a = 1.0;
}
`;
let gl;
function start2() {
    const canvas = document.getElementById('canvas2');
    gl = canvas.getContext('webgl');

    const vertices = new Float32Array([
        -1.0, -1.0, 0.0, 0.0, 0.0, 1.0,
        -1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
        1.0, 1.0, 0.0, 0.0, 0.0, 1.0,
        1.0, -1.0, 0.0, 1.0, 0.0, 0.0
    ]);

    const index = new Uint16Array([
        0, 1, 2,
        2, 0, 3
    ]);

    const uv = new Float32Array([
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0
    ]);

    const vShader = createShader(gl, gl.VERTEX_SHADER, V_SHADER_DATA2);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, F_SHADER_DATA2);
    const program = initProgram(gl, vShader, fShader);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 4 * 6, 0);

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


    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    update();

}

function update(t) {

    let time = 4 * t / 1000;
    // console.log('t:', t);

    const uTime = gl.getUniformLocation(gl.program, 'u_time');
    gl.uniform1f(uTime, time);

    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);


    requestAnimationFrame(update);
}


console.log('start');
start2();