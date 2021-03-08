class WebGLRenderer {

    canvas;
    gl;
    textureIdx = 0;
    drawMode = 0;
    drawCount = 0;

    constructor(canvas) {
        this.canvas = canvas;
        let gl = canvas.getContext('webgl', {
            premultipliedAlpha: false
        });
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        this.gl = gl;
    }

    async loadTexture(url) {
        let image = await this.loadImage(url);
        let texture = this.createTexture(image);
        return texture;
    }

    createTexture(image) {
        let gl = this.gl;
        let texture = gl.createTexture();
        texture.idx = this.textureIdx++;

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.activeTexture(gl.TEXTURE0 + texture.idx);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        return texture;
    }

    loadImage(url) {
        let image = new Image();
        image.crossOrigin = 'anonymous';
        return new Promise((resolve, reject) => {
            image.onload = () => {
                resolve(image);
            }
            image.src = url;
        });
    }

    createProgram(vGlsl, fGlsl) {
        let gl = this.gl;
        let vShader = this.createShader(gl.VERTEX_SHADER, vGlsl);
        let fShader = this.createShader(gl.FRAGMENT_SHADER, fGlsl);
        let program = this.initProgram(vShader, fShader);
        return program;
    }

    initProgram(vShader, fShader) {
        let gl = this.gl;
        let program = gl.createProgram();
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);
        if (!program) {
            console.log('programInfo:', gl.getProgramInfoLog(program));
            console.log(gl.getError());
        }
        program.vShader = vShader;
        program.fShader = fShader;
        return program;
    }

    useProgram(program) {
        let gl = this.gl;
        gl.useProgram(program);
        this.program = program;
    }

    createShader(type, glsl) {
        let gl = this.gl;
        let shader = gl.createShader(type);
        gl.shaderSource(shader, glsl);
        gl.compileShader(shader);
        let status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        console.log(`SHADER ERROR: ${type}\n`, status);
        if (!status) {
            // console.log(`SHADER ERROR: ${type}\n`, status);
        }
        if (!shader) {
            console.log(gl.getError());
        }
        return shader;
    }

    shaderData(data) {
        if (!data) {
            return;
        }

        if (data.attributes) {
            for (let k in data.attributes) {
                this.putAttribute(k, data.attributes[k]);
            }
        }

        if (data.uniforms) {
            for (let k in data.uniforms) {
                this.putUniform(k, data.uniforms[k]);
            }
        }

        if (data.textures) {
            data.textures.forEach(texture => {
                this.putTexture(texture.key, texture.value);
            })
        }

        if (data.index) {
            this.putIndex(data.index);
            this.drawMode = 1;
        }
    }

    render(d = 6) {
        const {gl} = this;

        if (this.drawMode) {
            gl.drawElements(gl.TRIANGLES, d, gl.UNSIGNED_BYTE, 0);
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, 4);
        }
    }

    putTexture(key, texture) {
        const uSampler = gl.getUniformLocation(gl.program, key);
        gl.uniform1i(uSampler, texture.idx);
    }

    putUniform(key, value) {
        let {gl, program} = this;

        const uKey = gl.getUniformLocation(program, key);
        gl.uniform1i(uKey, value.idx);
    }

    putAttribute(key, v) {
        let {gl, program} = this;

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, v.value, gl.STATIC_DRAW);

        const aKey = gl.getAttribLocation(program, key);
        gl.vertexAttribPointer(aKey, v.count, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aKey);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    putIndex(index) {
        let {gl} = this;

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index, gl.STATIC_DRAW);
    }

    setMeshData(meshArray) {
        if(meshArray !== null && meshArray instanceof Array) {
            
        }
    }

}