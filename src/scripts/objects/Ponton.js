import * as THREE from 'three';
const loader =  new THREE.OBJLoader();

export default class Obj extends THREE.Object3D
{
    constructor()
    {
        super();

        const localPlane = new THREE.Plane(new THREE.Vector3(0, 0.1, 0), 1);

        this.group = new THREE.Group();
        this.group2 = new THREE.Group();
        this.group.position.y = 2;
        this.group2.position.z = 21;
        this.group2.position.y = 2;

        this.add(this.group);
        this.add(this.group2);

        const normal = new THREE.Texture();

        normal.image = window.getAsset('wood');
        normal.needsUpdate = true;

        const normal2 = new THREE.Texture();

        normal2.image = window.getAsset('wood2');
        normal2.needsUpdate = true;
        const scale = 0.1;
        const pontonAo = new THREE.Texture();

        pontonAo.image = window.getAsset('plank-ponton-ao');
        pontonAo.needsUpdate = true;

        const ponton = loader.parse(window.getAsset('plank-ponton'));

        this.pontonMat = new THREE.MeshPhongMaterial({
            normalMap: normal,
            normalScale: new THREE.Vector2(0.2, 0.2),
            map: pontonAo,
            clippingPlanes: [localPlane],
        });

        ponton.traverse((child) =>
        {
            if (child instanceof THREE.Mesh)
            {
                child.material = this.pontonMat;

                child.scale.set(scale, scale, scale);
            }
        });

        const pylonAo = new THREE.Texture();

        pylonAo.image = window.getAsset('pylons-ponton-ao');
        pylonAo.needsUpdate = true;

        const pylons = loader.parse(window.getAsset('pylons-ponton'));

        this.pylonsMat = new THREE.MeshPhongMaterial({
            normalMap: normal2,
            normalScale: new THREE.Vector2(0.2, 0.2),
            map: pylonAo,
            clippingPlanes: [localPlane],
        });

        pylons.traverse((child) =>
        {
            if (child instanceof THREE.Mesh)
            {
                child.material = this.pylonsMat;
                child.scale.set(-scale, scale, -scale);
            }
        });

        this.pylons = pylons;
        this.ponton = ponton;
        this.group.add(pylons);
        this.group.add(ponton);

        const ponton2 = this.ponton.clone();

        const pylon2 = this.pylons.clone();

        this.pylons2 = pylon2;
        this.ponton2 = ponton2;

        this.group2.add(this.pylons2);
        this.group2.add(this.ponton2);

        this.bloomMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            fog: false,
        });
    }

    update()
    {

    }
    bloom()
    {
        // this.visible = false;

        for (let i = 0; i < this.pylons.children.length; i++)
        {
            this.pylons.children[i].material = this.bloomMaterial;
        }
        for (let i = 0; i < this.pylons2.children.length; i++)
        {
            this.pylons2.children[i].material = this.bloomMaterial;
        }

        for (let i = 0; i < this.ponton.children.length; i++)
        {
            this.ponton.children[i].material = this.bloomMaterial;
        }
        for (let i = 0; i < this.ponton2.children.length; i++)
        {
            this.ponton2.children[i].material = this.bloomMaterial;
        }
    }
    unBloom()
    {
        for (let i = 0; i < this.pylons.children.length; i++)
        {
            this.pylons.children[i].material = this.pylonsMat;
        }
        for (let i = 0; i < this.pylons2.children.length; i++)
        {
            this.pylons2.children[i].material = this.pylonsMat;
        }

        for (let i = 0; i < this.ponton.children.length; i++)
        {
            this.ponton.children[i].material = this.pontonMat;
        }
        for (let i = 0; i < this.ponton2.children.length; i++)
        {
            this.ponton2.children[i].material = this.pontonMat;
        }
    }
}
