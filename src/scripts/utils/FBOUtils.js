/*
@author zz85
*/

import * as THREE from 'three';
window.THREE = THREE;

// Utils for FBO Particles Simulations

THREE.FBOUtils = function (textureWidth, renderer, simulationShader)
{
    const gl = renderer.getContext();

    // if (!gl.getExtension('OES_texture_float'))
    // {
    //     alert('No OES_texture_float support for float textures!');
    //
    //     return;
    // }

    if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0)
    {
        alert('No support for vertex shader textures!');

        return;
    }

    const cameraRTT = new THREE.OrthographicCamera(-textureWidth / 2, textureWidth / 2, textureWidth / 2, -textureWidth / 2, -1000000, 1000000);

    cameraRTT.position.z = 100;

    const rtTexturePos = new THREE.WebGLRenderTarget(textureWidth, textureWidth, {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) ? THREE.HalfFloatType : THREE.FloatType,
        stencilBuffer: false,
    });

    // Shader Stuff

    const texture_cpu_to_gpu_vertex_shader = [

        'varying vec2 vUv;',

        'void main() {',

        'vUv = vec2(uv.x, 1.0 - uv.y);',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

        '} ',

    ].join('\n');

    const texture_cpu_to_gpu_fragment_shader = [

        'varying vec2 vUv;',
        'uniform sampler2D tPositions;',

        'void main() {',
        'vec4 pos = texture2D( tPositions, vUv );',
        'gl_FragColor = pos;',
        '};',

    ].join('\n');

    const cpu_gpu_material = new THREE.ShaderMaterial({

        uniforms: {
            tPositions: {
                type: 't',
                value: null,
            },
        },
        vertexShader: texture_cpu_to_gpu_vertex_shader,
        fragmentShader: texture_cpu_to_gpu_fragment_shader,

    });

    const sceneRTTPos = new THREE.Scene();

    sceneRTTPos.add(cameraRTT);

    const plane = new THREE.PlaneGeometry(textureWidth, textureWidth);

    const quad = new THREE.Mesh(plane, simulationShader);

    quad.position.z = -5000;
    sceneRTTPos.add(quad);

    this.textureWidth = textureWidth;
    this.sceneRTTPos = sceneRTTPos;
    this.cameraRTT = cameraRTT;
    this.renderer = renderer;
    this.cpu_gpu_material = cpu_gpu_material;
    this.simulationShader = simulationShader;
};

THREE.FBOUtils.createTextureFromData = function (width, height, data, options)
{
    options || (options = {});

    const texture = new THREE.DataTexture(
        new Float32Array(data),
        width,
        height,
        THREE.RGBAFormat,
        THREE.FloatType,
        null,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping,
        THREE.NearestFilter,
        THREE.NearestFilter
    );

    texture.needsUpdate = true;

    return texture;
};

THREE.FBOUtils.prototype.renderToTexture = function (texture, renderToTexture)
{
    this.cpu_gpu_material.uniforms.tPositions.value = texture;
    this.renderer.render(this.sceneRTTPos, this.cameraRTT, renderToTexture, false);
};

THREE.FBOUtils.prototype.pushDataToTexture = function (data, renderToTexture)
{
    const texture = THREE.FBOUtils.createTextureFromData(this.textureWidth, this.textureWidth, data);

    this.renderToTexture(texture, renderToTexture);
};

THREE.FBOUtils.prototype.simulate = function (target)
{
    this.renderer.render(
        this.sceneRTTPos,
        this.cameraRTT,
        target, false);
};
