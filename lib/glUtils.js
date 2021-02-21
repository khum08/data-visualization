function createShader(gl, type, shaderStr) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);
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
    gl.useProgram(program);
    gl.program = program;
    if (!program) {
        console.log(gl.getError());
    }
    return program;
}