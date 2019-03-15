import * as THREE from 'three';
import getFBO from 'utils/getFBO';

export default class ShaderPass
{
    constructor(renderer, shader, width, height)
    {
        this.renderer = renderer;
        this.shader = shader;

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.00001, 1000);

        this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), this.shader);
        this.quad.scale.set(width, height, 1.0);
        this.scene.add(this.quad);

        this.fbo = getFBO(width, height);
        this.texture = this.fbo.texture;
    }
    render(final = true)
    {
        this.renderer.render(this.scene, this.camera, final ? null : this.fbo);
    }
    setSize(width, height)
    {
        this.fbo.setSize(width, height);
        this.orthoQuad.scale.set(width, height, 1);
        this.orthoCamera.left = -width / 2;
        this.orthoCamera.right = width / 2;
        this.orthoCamera.top = height / 2;
        this.orthoCamera.bottom = -height / 2;
        this.orthoCamera.updateProjectionMatrix();
    }
}
