import * as THREE from 'three';
import { random } from 'utils/functions';
import * as Const from 'Const';
export default class Lol extends THREE.Object3D
{
    constructor()
    {
        super();

        const texture = new THREE.Texture();

        texture.image = window.getAsset('lol');
        texture.needsUpdate = true;

        for (let i = 0; i < 30; i++)
        {
            const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 2), new THREE.MeshBasicMaterial({
                map: texture,
                fog: false,
            }));
            const r = random(1, 3);

            mesh.scale.set(r, r, r);
            mesh.position.x = random(-30, 30);
            mesh.position.y = random(1, 15);
            mesh.position.z = random(Const.obeliskPos.z - 20, Const.cameraStartPosition.z - 5);

            this.add(mesh);
        }
    }
}
