let canvas = document.getElementById('canvas');
let gl = canvas.getContext('webgl');
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

const V_SHADER_DATA = `
attribute vec3 aPosition;
attribute vec2 aUv;

varying vec2 vUv;
void main() {
    gl_Position = vec4(aPosition, 1.0);
    vUv = aUv;
}
`;

const F_SHADER_DATA = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec4 uColor;

varying vec2 vUv;

// 随机函数
float random(float x)
{ 
    return fract(sin(x * 1243758.5453123));
}

float random2(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

vec2 random3(vec2 st) {
    st = vec2(
        dot(st,vec2(127.1,311.7)),
        dot(st,vec2(269.5,183.3))
    );
    return fract(sin(st) * 43758.5453123);
}

vec4 getNoiseLine()
{
    vec2 st = vUv - vec2(0.5);
    st *= 10.0;
    float i = floor(st.x);
    float f = fract(st.x);

    // float d = random(i);

    // float d = mix(random(i), random(i + 1.0), f);
    // float d = mix(random(i), random(i + 1.0), smoothstep(0.0, 1.0, f));
    float d = mix(random(i), random(i + 1.0), f * f * (3.0 - 2.0 * f));

    // gl_FragColor.xyz = vec3(d);
    vec3 rgb = (smoothstep(st.y - 0.05, st.y, d) - smoothstep(st.y, st.y + 0.05, d)) * vec3(1.0);
    return vec4(rgb, 1.0);
}

float noise(vec2 st)
{
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix( random2( i + vec2(0.0, 0.0) ), random2( i + vec2(1.0, 0.0) ), u.x),
        mix( random2( i + vec2(0.0, 0.0) ), random2( i + vec2(1.0, 0.0) ), u.x),
        u.y
    );
}

vec4 getNoisePlane()
{
    vec2 st = vUv * 20.0;
    vec3 rgb = vec3(1.0) * noise(st);
    return vec4(rgb, 1.0);
}


void main()
{
    gl_FragColor = getNoiseLine();
    gl_FragColor = getNoisePlane();

    vec2 st = vUv * 10.0;
    float d = 1.0;
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);
    for(int i = -1; i <= 1; i++) {
        for(int j = -1; j <= 1; j++) {
            vec2 neighbor = vec2(float(i), float(j));
            vec2 p = random3(i_st + neighbor);
            d = min(d, distance(f_st, neighbor + p));
        }
    }
    gl_FragColor.rgb = vec3(d);
    gl_FragColor.a = 1.0;
}
`;

const vertices = new Float32Array([
    -1, 1, 0, 
    -1, -1, 0,
    1, 1, 0,

    -1, -1, 0,
    1, 1, 0,
    1, -1, 0
]);

const uvs = new Float32Array([
    0, 1,
    0, 0,
    1, 1,

    0, 0,
    1, 1,
    1, 0
])


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
    let aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    let uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    let aUV = gl.getAttribLocation(program, 'aUv');
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aUV);

    let uColor = gl.getUniformLocation(program, 'uColor');
    gl.uniform4fv(uColor, color);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.drawArrays(gl.LINES, 0, 6);

}




start();