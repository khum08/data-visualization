console.log('test');
var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl', {
    antialias: true
});

gl.clearColor(1.0, 0, 0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);