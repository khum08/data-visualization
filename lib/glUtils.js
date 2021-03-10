function createShader(gl, type, shaderStr) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);
    console.log('complie_status:', type, gl.getShaderParameter(shader, gl.COMPILE_STATUS));
    if (!shader) {
        console.log(gl.getError());
    }
    return shader;
}

function initProgram(gl, vShader, fShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    console.log('programInfo:', gl.getProgramInfoLog(program));
    gl.useProgram(program);
    gl.program = program;
    if (!program) {
        console.log(gl.getError());
    }
    return program;
}

function createTexture(gl, program, name, image, idx) {
    const texture = gl.createTexture();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.activeTexture(gl.TEXTURE0 + idx);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const uSamper = gl.getUniformLocation(program, name);
    gl.uniform1i(uSamper, idx);

    return texture;
}