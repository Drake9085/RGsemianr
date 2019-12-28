console.log("test");

import {vec3, vec4, quat, mat4} from './node_modules/gl-matrix/esm/index.js';
import * as minimal_gltf_loader from './other_modules/minimal-gltf-loader-2.js'; 
//var MinimalGLTFLoader = require('./other_modules/minimal-gltf-loader.js');

var glTFLoader = new minimal_gltf_loader.glTFLoader();
var url = './formula.gltf';
glTFLoader.loadGLTF(url, function(glTF){
    //...
});