import * as THREE from 'three';
window.THREE = THREE;
import FBOUtils from './FBOUtils';

export default class PingPong
{
    constructor({
        data,
        width,
        height,
        format = THREE.RGBAFormat,
        type = THREE.FloatType,
        uniforms,
        vertex,
        fragment,
        timeAdd = 0.1,
        // renderer,
    })
    {
        this.data = data;
        this.width = width;
        this.height = height;
        this.uniforms = uniforms;
        this.vertex = vertex;
        this.fragment = fragment;
        this.timeAdd = timeAdd;
        // this.renderer = renderer;

        this.textureData = new THREE.DataTexture(data, width, height, format, type);
        this.textureData.minFilter = THREE.NearestFilter;
        this.textureData.magFilter = THREE.NearestFilter;
        this.textureData.needsUpdate = true;

        this.renderTexture = new THREE.WebGLRenderTarget(width, height, {
            wrapS: THREE.ClampToEdgeWrapping,
            wrapT: THREE.ClampToEdgeWrapping,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBAFormat,
            type: THREE.FloatType,
            stencilBuffer: false,
            depthBuffer: false,
            flipY: false,
        });

        this.renderTexture2 = this.renderTexture.clone();
        const defaultUniforms = {
            tOrigin: {
                type: 't',
                value: this.textureData,
            },
            tPositions: {
                type: 't',
                value: this.textureData,
            },
            uTime: {
                type: 'f',
                value: 0,
            },
            uResolution: {
                type: 'v2',
                value: new THREE.Vector2(width, height),
            },
        };

        this.time = 0;

        this.shader = new THREE.ShaderMaterial({
            uniforms: Object.assign(defaultUniforms, uniforms),
            vertexShader: vertex,
            fragmentShader: fragment,
        });

        this.fbo = new THREE.FBOUtils(width, window.renderer, this.shader);

        this.fbo.renderToTexture(this.renderTexture, this.renderTexture2);

        this.fbo.in = this.renderTexture;
        this.fbo.out = this.renderTexture2;

        // window.helper.attach(this.fbo.out, 'Simulation');
    }
    update()
    {
        this.time += this.timeAdd;
        const tmp = this.fbo.in;

        this.fbo.in = this.fbo.out;
        this.fbo.out = tmp;
        this.shader.uniforms.tPositions.value = this.fbo.in.texture;
        this.shader.uniforms.uTime.value = this.time;

        this.fbo.simulate(this.fbo.out);
    }
    destroy()
    {
        this.textureData.dispose();
        this.renderTexture.dispose();
        this.renderTexture2.dispose();
    }
}
