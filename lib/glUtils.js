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