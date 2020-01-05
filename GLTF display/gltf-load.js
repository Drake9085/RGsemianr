import {vec3, vec4, quat, mat4} from './node_modules/gl-matrix/esm/index.js';
import * as minimal_gltf_loader from './other_modules/minimal-gltf-loader-2.js'; 
//var MinimalGLTFLoader = require('./other_modules/minimal-gltf-loader.js');

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

var Type2NumOfComponent = {
    'SCALAR': 1,
    'VEC2': 2,
    'VEC3': 3,
    'VEC4': 4,
    'MAT2': 4,
    'MAT3': 9,
    'MAT4': 16
};
	
  var glTFLoader = new minimal_gltf_loader.glTFLoader();
  var canvas = document.getElementById('cnvs');
  var url = './formulaOnePiece.gltf';
  
  var vertices = new Float32Array();
  var colors = new Float32Array();
  var indices = new Uint16Array();

glTFLoader.loadGLTF(url, function(glTF){
    //console.log(glTF);
    
    var meshIDX = _getMeshIndex(glTF, 'formula');
    
    //console.log(glTF.meshes[meshIDX]);
    if (meshIDX != -1) {
        for (var primIDX in glTF.meshes[meshIDX].primitives) {
            var primitive = glTF.meshes[meshIDX].primitives[primIDX];
            console.log(primitive);
            vertices = _getAccessorData(primitive.attributes.POSITION);
            indices = _getAccessorData(glTF.accessors[primitive.indices]);
            
            colors = new Float32Array(_setColors(vertices.length, primitive));
            
            
            // Get the rendering context for WebGL
            var gl = getWebGLContext(canvas);
            if (!gl) {
                console.log('Failed to get the rendering context for WebGL');
            }

            // Initialize shaders
            if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
                console.log('Failed to intialize shaders.');
            }

            // Set the vertex information
            var n = initVertexBuffers(gl);
            if (n < 0) {
                console.log('Failed to set the vertex information');
            }

            // Set the clear color and enable the depth test
            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.enable(gl.DEPTH_TEST);

            // Get the storage location of u_MvpMatrix
            var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
            if (!u_MvpMatrix) {
                console.log('Failed to get the storage location of u_MvpMatrix');
            }

            // Set the eye point and the viewing volume
            var mvpMatrix = new Matrix4();
            mvpMatrix.setPerspective(-90, 1, 1, 100);
            mvpMatrix.lookAt(10, 10, 10, 0, 0, 0, 3, 1, 1);
          

            // Pass the model view projection matrix to u_MvpMatrix
            gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

            // Clear color and depth buffer
            //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Draw the cube
            gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
        }
    }
    
});


function _getMeshIndex(glTF_file, object_name) {
    var meshIDX = -1;
    for (var nodeI in glTF_file.scenes[0].nodes) {
        if (glTF_file.nodes[nodeI].name == object_name) {
            meshIDX = glTF_file.nodes[nodeI].mesh.meshID; 
        }
    }
    return meshIDX;
}

function _setColors(vertexArrayLen, primitive) {
    var colorsArray = [];
    var color = primitive.material.pbrMetallicRoughness.baseColorFactor;
    for (var i=0; i < vertexArrayLen; i++) {
        colorsArray.push(color[0]);
        colorsArray.push(color[1]);
        colorsArray.push(color[2]);
    }
    return colorsArray;
}

function initVertexBuffers(gl) {
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

function _arrayBuffer2TypedArray(buffer, byteOffset, countOfComponentType, componentType) {
    switch(componentType) {
        // @todo: finish
        case 5122: return new Int16Array(buffer, byteOffset, countOfComponentType);
        case 5123: return new Uint16Array(buffer, byteOffset, countOfComponentType);
        case 5124: return new Int32Array(buffer, byteOffset, countOfComponentType);
        case 5125: return new Uint32Array(buffer, byteOffset, countOfComponentType);
        case 5126: return new Float32Array(buffer, byteOffset, countOfComponentType);
        default: return null; 
    }
}

function _getAccessorData(accessor) {
    return _arrayBuffer2TypedArray(
        accessor.bufferView.data, 
        accessor.byteOffset, 
        accessor.count * Type2NumOfComponent[accessor.type],
        accessor.componentType
        );
}