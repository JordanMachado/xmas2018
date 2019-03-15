import * as THREE from 'three';
const loader =  new THREE.OBJLoader();

export default class Obj extends THREE.Object3D
{
    constructor()
    {
        super();
        this.group = new THREE.Group();
        this.group.position.y = 2;
        this.add(this.group);

        const scale = 0.1;
        const texture = new THREE.Texture();

        texture.image = window.getAsset('barque-texture');
        texture.needsUpdate = true;

        const barque = loader.parse(window.getAsset('barque'));

        barque.traverse((child) =>
        {
            if (child instanceof THREE.Mesh)
            {
                child.material = new THREE.MeshPhongMaterial();
                child.scale.set(-scale, scale, -scale);
                child.material.map = texture;
                child.material.map.needsUpdate = true;
            }
        });

        this.group.add(barque);
    }
    bloom()
    {
        this.visible = false;
    }
    unBloom()
    {
        this.visible = true;
    }
}
