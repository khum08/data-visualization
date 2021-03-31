console.log('create');
let canvas = document.getElementById('canvas');
let gl = canvas.getContext('webgl');

gl.clearColor(1, 1, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);