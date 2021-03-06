const V_SHADER_DATA = `
attribute vec3 a_position;
attribute vec2 a_uv;

varying vec2 v_uv;
void main() {
    gl_PointSize = 1.0;
    gl_Position = vec4(a_position, 1.0);
    v_uv = a_uv;
}
`;

const F_SHADER_DATA = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_rows;
varying vec2 v_uv;

void main() {
    vec2 st = fract(v_uv * u_rows);
    float d1 = step(st.x, 0.9);
    float d2 = step(0.1, st.y);

    gl_FragColor.rgb = mix(vec3(0.8), vec3(1.0), d1 * d2);
    gl_FragColor.a = 1.0;
}
`;

function start() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

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

    const vShader = createShader(gl, gl.VERTEX_SHADER, V_SHADER_DATA);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, F_SHADER_DATA);
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

    const uRows = gl.getUniformLocation(program, 'u_rows');
    gl.uniform1f(uRows, 64.0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);



    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

}


console.log('start');
start();