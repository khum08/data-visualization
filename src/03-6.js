console.log('start');
let canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
let circleBtn = document.getElementById('circle');
let gridBtn = document.getElementById('grid');
let lineBtn = document.getElementById('line');
let dLineBtn = document.getElementById('dLine');
let lineSegementBtn = document.getElementById('lineSegment');
let triangleBtn = document.getElementById('triangle');
let parallelBtn = document.getElementById('parallel');
let circleShaderBtn = document.getElementById('circleShader');
let ringShaderBtn = document.getElementById('ringShader');

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

uniform float u_time;
uniform int u_showType;
uniform vec2 u_mouseCoord;
varying vec2 v_uv;

float random(vec2 st) {
    float temp = dot(st.xy, vec2(12.9898, 78.111));
    return fract(sin(temp) * 31415.9265);
}

vec4 getGridColor() {
    vec2 st = v_uv * 20.0;
    vec2 idx = floor(st);
    vec2 grid = fract(st);
    
    vec2 t = mod(idx, 2.0);
    if (t.x == 1.0) {
        grid.x = 1.0 - grid.x;
    }
    if (t.y == 1.0) {
        grid.y = 1.0 - grid.y;
    }

    vec3 rgb = vec3(grid.x, grid.y, 0.0);
    return vec4(rgb, 1.0);
}


vec4 getCircleColor() {
    float d = distance(v_uv, vec2(0.5, 0.5));
    vec3 rgb = vec3(1.0) * smoothstep(d, d + 0.005, 0.3);
    return vec4(rgb, 1.0);
}

vec4 getLineColor() {
    vec3 line = vec3(1.0, 1.0, 0.0);
    float area = abs(cross(vec3(v_uv, 0.0), normalize(line)).z);
    vec3 rgb = vec3(1.0, 0.0, .0) * smoothstep(area, area + 0.005, 0.005);
    return vec4(rgb, 1.0);
}

vec4 getDLineColor(vec2 origin) {
    vec3 line = vec3(u_mouseCoord - origin, 0.0);
    float d = abs(cross(vec3(v_uv - origin, 0.0), normalize(line)).z);
    vec3 rgb = vec3(1.0, 0.0, .0) * smoothstep(d, d + 0.005, 0.005);
    return vec4(rgb, 1.0);
    // return vec4(1.0);
}


vec4 getLineSegColor() {

    vec2 origin = vec2(0.5, 0.5);
    vec3 ab = vec3(u_mouseCoord - origin, 0);

    vec3 ap = vec3(v_uv - origin, 0);

    float dis = abs(cross(ap, normalize(ab)).z);
    
    float proj = dot(ap, ab) / length(ab);
    if (proj < 0.0 || proj > length(ab)) {
        dis = min(distance(v_uv, origin), distance(v_uv, u_mouseCoord));
    }

    vec3 rgb = vec3(.0, .0, 1.0) * smoothstep(dis, dis + 0.005, 0.005);

    return vec4(rgb, 1.0);
}


bool inTriangle(vec3 p, vec3 a, vec3 b, vec3 c) {
    bool pab = cross(p - a, b - a).z > 0.0;
    bool pbc = cross(p - b, c - b).z > 0.0;
    bool pca = cross(p - c, a - c).z > 0.0;
    // return (pab && pbc && pca);
    return (pab && pbc && pca) || (!pab && !pbc && !pca);
}


vec4 getTriangleColor() {
    bool inTri = inTriangle(vec3(v_uv, 0.0), vec3(0.0, 0.0, 0.0), vec3(0.5, 1.0, 0.0), vec3(1.0, 0.0, 0.0));
    if (inTri) {
        return vec4(1.0, 0.0, 0.0, 1.0);
    }
    return vec4(1.0, 1.0, 1.0, 1.0);
}

vec4 getDefault() {
    return vec4(0.0, 0.0, 1.0, 1.0);
}

vec4 getParallelLines() {
    vec3 line = vec3(1.0, 1.0, 0.0);
    vec3 cp = vec3(v_uv, 0.0);
    float d = abs(cross(cp, normalize(line)).z);

    d = fract(d * 20.0);

    vec3 rgb = (smoothstep(0.45, 0.5, d) - smoothstep(0.5, 0.55, d)) * vec3(1.0);

    return vec4(rgb, 1.0);
}

vec4 getCircleShaderColor() {
    vec3 origin = vec3(0.5, 0.5, 0.0);
    vec3 cp = vec3(v_uv, 0.0);
    float d = distance(cp, origin);

    d = fract(d * 20.0);

    vec3 rgb = (smoothstep(0.45, 0.5, d) - smoothstep(0.5, 0.55, d)) * vec3(1.0);

    return vec4(rgb, 1.0);
}

vec4 getRingShaderColor() {
    return vec4(0.0, 0.0, 1.0, 1.0);
}


void main() {
    if (u_showType == 0) {
        gl_FragColor = getCircleColor();
    }
    else if (u_showType == 1) {
        gl_FragColor = getGridColor();
    }
    else if (u_showType == 2) {
        gl_FragColor = getLineColor();
    }
    else if (u_showType == 3) {
        gl_FragColor = getDLineColor(vec2(0.5, 0.5));
    } 
    else if (u_showType == 4) {
        gl_FragColor = getLineSegColor();
    }
    else if (u_showType == 5) {
        gl_FragColor = getTriangleColor();
    }
    else if (u_showType == 6) {
        gl_FragColor = getParallelLines();
    }
    else if (u_showType == 7) {
        gl_FragColor = getCircleShaderColor();
    }
    else if (u_showType == 8) {
        gl_FragColor = getRingShaderColor();
    }
    else {
        gl_FragColor = getDefault();
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
let dx = 0;
let dy = 1;

let showType = 0;
grayBtn();
circleBtn.style.backgroundColor = 'red';

canvas.addEventListener('mousemove', e => {
    dx = e.offsetX / canvas.width;
    dy = e.offsetY / canvas.height;
    // console.log('delta:', dx, dy);
});


function update(time) {

    let cTime = (time - delta) / 1200;

    const uShowType = gl.getUniformLocation(gl.program, 'u_showType');
    gl.uniform1i(uShowType, showType);

    const uTime = gl.getUniformLocation(gl.program, 'u_time');
    gl.uniform1f(uTime, cTime);

    const uMouseCoord = gl.getUniformLocation(gl.program, 'u_mouseCoord');
    gl.uniform2fv(uMouseCoord, new Float32Array([dx, 1 - dy]));

    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame(update);
}

circleBtn.addEventListener("click", () => {
    showType = 0;
    grayBtn();
    circleBtn.style.backgroundColor = 'red';
});

gridBtn.addEventListener("click", () => {
    showType = 1;
    grayBtn();
    gridBtn.style.backgroundColor = 'red';
})

lineBtn.addEventListener("click", () => {
    showType = 2;
    grayBtn();
    lineBtn.style.backgroundColor = 'red';
});


dLineBtn.addEventListener("click", () => {
    showType = 3;
    grayBtn();
    dLineBtn.style.backgroundColor = 'red';
});

lineSegementBtn.addEventListener("click", () => {
    showType = 4;
    grayBtn();
    lineSegementBtn.style.backgroundColor = 'red';
});

triangleBtn.addEventListener("click", () => {
    showType = 5;
    grayBtn();
    triangleBtn.style.backgroundColor = 'red';
});

parallelBtn.addEventListener("click", () => {
    showType = 6;
    grayBtn();
    parallelBtn.style.backgroundColor = 'red';
});


circleShader.addEventListener("click", () => {
    showType = 7;
    grayBtn();
    circleShader.style.backgroundColor = 'red';
});

ringShaderBtn.addEventListener("click", () => {
    showType = 8;
    grayBtn();
    ringShaderBtn.style.backgroundColor = 'red';
});

function grayBtn() {
    circleBtn.style.backgroundColor = 'gray';
    gridBtn.style.backgroundColor = 'gray';
    lineBtn.style.backgroundColor = 'gray';
    dLineBtn.style.backgroundColor = 'gray';
    lineSegementBtn.style.backgroundColor = 'gray';
    triangleBtn.style.backgroundColor = 'gray';
    parallelBtn.style.backgroundColor = 'gray';
    circleShader.style.backgroundColor = 'gray';
    ringShaderBtn.style.backgroundColor = 'gray';
}



start();




