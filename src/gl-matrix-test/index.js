
console.log('matrix');

let aMat = glMatrix.mat4.create();
console.log(aMat);

let projMat = glMatrix.mat4.create();
glMatrix.mat4.perspective(projMat, 90, 1, 1, 100);
console.log('projMat:', projMat);