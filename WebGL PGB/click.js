
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
 var i = 0;
 window.loop = function (){
  window.requestAnimationFrame( main );
  
  var canvas = document.getElementById('webgl');
  i+=0.05;

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex information
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Set the clear color and enable the depth test
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage location of u_MvpMatrix
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }
	
  // Set the eye point and the viewing volume
  var mvpMatrix = new Matrix4();
  
  mvpMatrix.setPerspective(10, 1, 1, 100);
  
  mvpMatrix.lookAt(3, i, 7, 0, 0, 0, 0, 1, 0);

  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
};
 node.addEventListener('keydown', function(event) {
    const key = event.key; // "a", "1", "Shift", etc.
	console.log(key)
});
function main() {
  loop();
  
}
  
  



function initVertexBuffers(gl) {
  // Create a cube
  //    v6----- v5
  //   /|      /|
  //  v1------v0|
  //  | |     | |
  //  | |v7---|-|v4
  //  |/      |/
  //  v2------v3

  var vertices = new Float32Array([   // Vertex coordinates
    -0.25, -1.00,  1.00,  //  0 
     0.25, -1.00,  1.00,  //  1
    -0.25, -1.00,  0.50,  //  2
     0.25, -1.00,  0.50,  //  3
     0.75, -1.00,  0.50,  //  4
     0.25, -1.00, -0.50,  //  5
     0.75, -1.00, -0.50,  //  6
     0.25, -1.00, -1.00,  //  7
    -0.25, -1.00, -0.50,  //  8
    -0.25, -1.00, -1.00,  //  9
    -0.75, -1.00, -0.50,  // 10
    -0.75, -1.00,  0.50,  // 11
  ]);

  var colors = new Float32Array([     // Colors
    1.0, 0.4, 0.4,  //  0 
    1.0, 0.4, 0.4,  //  1 
    1.0, 0.4, 0.4,  //  2 
    1.0, 0.4, 0.4,  //  3 
    1.0, 0.4, 0.4,  //  4 
    1.0, 0.4, 0.4,  //  5 
    1.0, 0.4, 0.4,  //  6 
    1.0, 0.4, 0.4,  //  7 
    1.0, 0.4, 0.4,  //  8 
    1.0, 0.4, 0.4,  //  9 
    1.0, 0.4, 0.4,  // 10 
    1.0, 0.4, 0.4,  // 11
  ]);

  var indices = new Uint8Array([       // Indices of the vertices
     0, 1, 3,   0, 2, 3,
     1, 3, 4,   3, 4, 6,
     3, 5, 6,   5, 6, 7,
     5, 7, 8,   7, 8, 9,
     8, 9,10,   8,10,11,
     2, 8,11,   0, 2,11,
  ]);

  // Create a buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) 
    return -1;

  // Write the vertex coordinates and color to the buffer object
  if (!initArrayBuffer(gl, vertices, 3, gl.FLOAT, 'a_Position'))
    return -1;

  if (!initArrayBuffer(gl, colors, 3, gl.FLOAT, 'a_Color'))
    return -1;

  // Write the indices to the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}

function initArrayBuffer(gl, data, num, type, attribute) {
  var buffer = gl.createBuffer();   // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  return true;
}