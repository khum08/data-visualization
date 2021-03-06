var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl', {
    antialias: true
});
gl.viewport(0, 0, canvas.width, canvas.height);

var gui = new dat.GUI();
var config = {
    fov: 86,
    Shading: 'Phong',
    shinness: 40.0,
    shadingType: 2,
    autoRotateX: true,
    autoRotateY: true,
    wireframe: false
};
gui.add(config, 'fov').min(84).max(88).step(0.01).onChange(function(v) {
    fov = v;
});
gui.add(config, 'autoRotateX');
gui.add(config, 'autoRotateY');
gui.add(config, 'wireframe');
gui.add(config, 'Shading', ["Lambert", "half Lambert", "Phong", "Blinn Phong"]).onChange(function(v) {
    var mapping = { 
        'Lambert': 0,
        'half Lambert': 1,
        'Phong': 2,
        'Blinn Phong': 3,
    }
    config.shadingType = mapping[v];
});
gui.add(config, 'shinness', 20.0, 100.0);



var V_SHADER_DATA = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUv;

uniform mat4 uModelMat;
uniform mat4 uViewMat;
uniform mat4 uProjMat;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec3 vLightPosition;
varying vec2 vUv;

void main() {
    // gl_Position = uProjMat * uViewMat * uModelMat * vec4(aPosition, 1.0);
    vec4 worldPosition = uModelMat * vec4(aPosition, 1.0);

    vWorldPosition = worldPosition.xyz;
    vNormal = (uModelMat * vec4(aNormal, 1.0)).xyz;

    vLightPosition = vec3(0.0, 2.0, 0.0);
    vUv = aUv;

    gl_Position = uProjMat * uViewMat * worldPosition;
}
`;

var F_SHADER_DATA = `
#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uTexture;
uniform int uShowType;
uniform float uShinness;
uniform bool uWireframe;

varying vec3 vWorldPosition;
varying vec3 vNormal; // normal vec is lookat inside.
varying vec3 vLightPosition;
varying vec2 vUv;

// lambert shader
float getDiffuse() {
    vec3 n = normalize(vNormal);
    vec3 l = normalize(vLightPosition - vWorldPosition);
    float diffuse = max(dot(-n, l), 0.0);
    return diffuse;
}

// specular
float getHighlight(bool isBlinn) {
    vec3 eyePosition = vec3(0.0, 0.0, 0.0);
    vec3 n = normalize(vNormal);
    float highlight = 0.0;

    if (isBlinn) {
        vec3 eyeDir = normalize(eyePosition - vWorldPosition);
        vec3 lightDir = normalize(vLightPosition - vWorldPosition);
        vec3 halfVec = normalize(eyeDir + lightDir);
        highlight = pow(max(dot(halfVec, -n), 0.0), uShinness);
    } else {
        vec3 ref = reflect(normalize(vWorldPosition - vLightPosition), n);
        vec3 eyeDir = normalize(eyePosition - vWorldPosition);
        highlight = pow(max(dot(ref, eyeDir), 0.0), uShinness);
    }
 
    return highlight;
}


void main() {
    vec3 color = texture2D(uTexture, vUv).xyz;
    float diffuse = getDiffuse();

    if (uShowType == 0) { // lambert
        vec3 rgb = color * diffuse;
        gl_FragColor = vec4(rgb, 1.0);

    } else if (uShowType == 1) { // half lambert

        vec3 rgb = color * (diffuse * 0.5 + 0.5);
        gl_FragColor = vec4(rgb, 1.0);

    } else if (uShowType == 2) { // phong
        float highlight = getHighlight(false);
        float ambient = 0.2;

        vec3 rgb = color * (diffuse + highlight + ambient);
        gl_FragColor = vec4(rgb, 1.0);
    } else if (uShowType == 3) { // blinn phong

        float highlight = getHighlight(true);
        float ambient = 0.2;

        vec3 rgb = color * (diffuse + highlight + ambient);
        gl_FragColor = vec4(rgb, 1.0);
        // if (highlight == 0.0) {
        //     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        // }
    } else {
        float highlight = getHighlight(false);
        float ambient = 0.2;

        vec3 rgb = color * (diffuse + highlight + ambient);
        gl_FragColor = vec4(1.0, 0.0, .0, 1.0);
    }

    if (uWireframe) {
        gl_FragColor = vec4(1.0, 0.0, .0, 1.0);
    }


}
`;



var modelMat = glMatrix.mat4.create();

var projMat = glMatrix.mat4.create();

var uModelMat;

var url = '../../assets/yzk.jpeg';

function loadImage(url) {
    var image = new Image();
    image.crossOrigin = 'anonymous';
    return new Promise(function(resolve, reject) {
        image.onload = function() {
            resolve(image);
        }
        image.src = url;
    });
}

var uShowType;
var uShinness;
var uWireframe;

var uProjMat;


async function start() {

    var box = createBox();
    var vShader = createShader(gl, gl.VERTEX_SHADER, V_SHADER_DATA);
    var fShader = createShader(gl, gl.FRAGMENT_SHADER, F_SHADER_DATA);

    var program = initProgram(gl, vShader, fShader);

    // ============ vertices ============
    var vcBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vcBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, box.positions, gl.STATIC_DRAW);
    var aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    // ============ uv ============
    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, box.uvs, gl.STATIC_DRAW);
    var aUv = gl.getAttribLocation(program, 'aUv');
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aUv);


    // ============ normal ============
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, box.normals, gl.STATIC_DRAW);
    var aNormal = gl.getAttribLocation(program, 'aNormal');
    gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aNormal);

    // ============ model ============
    uModelMat = gl.getUniformLocation(program, 'uModelMat');

    // scale
    var scaling = glMatrix.vec3.fromValues(1.2, 1.2, 1.2);
    glMatrix.mat4.scale(modelMat, modelMat, scaling);

    // rotate
    glMatrix.mat4.rotateX(modelMat, modelMat, 0.5);


    // translate
    var translationMat = glMatrix.mat4.create()
    var translateV = glMatrix.vec3.fromValues(0, 0, -1.5);
    glMatrix.mat4.fromTranslation(translationMat, translateV);
    glMatrix.mat4.multiply(modelMat, translationMat, modelMat);

    // ============ view ============
    var viewMat = glMatrix.mat4.create();
    var eyePosition = glMatrix.vec3.fromValues(0, 0, 0);
    var center = glMatrix.vec3.fromValues(0, 0, -1);
    var up = glMatrix.vec3.fromValues(0, 1, 0);
    glMatrix.mat4.lookAt(viewMat, eyePosition, center, up);
    var uViewMat = gl.getUniformLocation(program, 'uViewMat');
    gl.uniformMatrix4fv(uViewMat, false, viewMat);


    // ============ proj ============
    uProjMat = gl.getUniformLocation(program, 'uProjMat');

    gl.enable(gl.DEPTH_TEST);

    uShowType = gl.getUniformLocation(program, 'uShowType');
    uShinness = gl.getUniformLocation(program, 'uShinness');
    uWireframe = gl.getUniformLocation(program, 'uWireframe');


    var image = await loadImage(url);
    createTexture(gl, program, 'uTexture', image, 0);

    update();
}


function update() {

    gl.uniform1i(uShowType, config.shadingType);
    gl.uniform1f(uShinness, config.shinness);

    // rotate
    if (config.autoRotateX) {
        glMatrix.mat4.rotateX(modelMat, modelMat, 0.005);
    }

    if (config.autoRotateY) {
        glMatrix.mat4.rotateY(modelMat, modelMat, 0.01);
    }

    // wireFrame
    gl.uniform1i(uWireframe, config.wireframe);


    // glMatrix.mat4.fromYRotation(rotationYMat, rotateY);
    // glMatrix.mat4.multiply(modelMat, modelMat, rotationYMat);
    gl.uniformMatrix4fv(uModelMat, false, modelMat);

    glMatrix.mat4.perspective(projMat, config.fov, 1, 0.01, 100);
    gl.uniformMatrix4fv(uProjMat, false, projMat);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (!config.wireframe) {
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
    gl.drawArrays(gl.LINES, 0, 36);

    requestAnimationFrame(update);
}

function createBox(options) {
    options = options || {};

    var dimensions = options.dimensions || [1, 1, 1];
    var position = options.position || [-dimensions[0] / 2, -dimensions[1] / 2, -dimensions[2] / 2];
    var x = position[0];
    var y = position[1];
    var z = position[2];
    var width = dimensions[0];
    var height = dimensions[1];
    var depth = dimensions[2];

    var fbl = { x: x, y: y, z: z + depth };
    var fbr = { x: x + width, y: y, z: z + depth };
    var ftl = { x: x, y: y + height, z: z + depth };
    var ftr = { x: x + width, y: y + height, z: z + depth };
    var bbl = { x: x, y: y, z: z };
    var bbr = { x: x + width, y: y, z: z };
    var btl = { x: x, y: y + height, z: z };
    var btr = { x: x + width, y: y + height, z: z };

    var positions = new Float32Array([
        //front
        fbl.x, fbl.y, fbl.z,
        fbr.x, fbr.y, fbr.z,
        ftl.x, ftl.y, ftl.z,
        ftl.x, ftl.y, ftl.z,
        fbr.x, fbr.y, fbr.z,
        ftr.x, ftr.y, ftr.z,

        //right
        fbr.x, fbr.y, fbr.z,
        bbr.x, bbr.y, bbr.z,
        ftr.x, ftr.y, ftr.z,
        ftr.x, ftr.y, ftr.z,
        bbr.x, bbr.y, bbr.z,
        btr.x, btr.y, btr.z,

        //back
        fbr.x, bbr.y, bbr.z,
        bbl.x, bbl.y, bbl.z,
        btr.x, btr.y, btr.z,
        btr.x, btr.y, btr.z,
        bbl.x, bbl.y, bbl.z,
        btl.x, btl.y, btl.z,

        //left
        bbl.x, bbl.y, bbl.z,
        fbl.x, fbl.y, fbl.z,
        btl.x, btl.y, btl.z,
        btl.x, btl.y, btl.z,
        fbl.x, fbl.y, fbl.z,
        ftl.x, ftl.y, ftl.z,

        //top
        ftl.x, ftl.y, ftl.z,
        ftr.x, ftr.y, ftr.z,
        btl.x, btl.y, btl.z,
        btl.x, btl.y, btl.z,
        ftr.x, ftr.y, ftr.z,
        btr.x, btr.y, btr.z,

        //bottom
        bbl.x, bbl.y, bbl.z,
        bbr.x, bbr.y, bbr.z,
        fbl.x, fbl.y, fbl.z,
        fbl.x, fbl.y, fbl.z,
        bbr.x, bbr.y, bbr.z,
        fbr.x, fbr.y, fbr.z,
    ]);

    var uvs = new Float32Array([
        //front
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        //right
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        //back
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        //left
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        //top
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        //bottom
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1
    ]);

    var normals = new Float32Array(positions.length);
    var i, count;
    var ni;

    for (i = 0, count = positions.length / 3; i < count; i++) {
        ni = i * 3;

        normals[ni] = parseInt(i / 6, 10) === 1 ? 1 :
            parseInt(i / 6, 10) === 3 ? -1 : 0;

        normals[ni + 1] = parseInt(i / 6, 10) === 4 ? 1 :
            parseInt(i / 6, 10) === 5 ? -1 : 0;

        normals[ni + 2] = parseInt(i / 6, 10) === 0 ? 1 :
            parseInt(i / 6, 10) === 2 ? -1 : 0;

    }

    return {
        positions: positions,
        normals: normals,
        uvs: uvs
    };

};


start();

