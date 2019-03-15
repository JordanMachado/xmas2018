import * as THREE from 'three';

import { random, range, clamp } from 'utils/functions';

export default class Clouds extends THREE.Object3D
{
    constructor()
    {
        super();

        const map = new THREE.Texture();

        map.image = window.getAsset('cloud');
        map.needsUpdate = true;
        const geometry = new THREE.PlaneGeometry(2, 1);

        this.items = [];

        for (let i = 0; i < 100; i++)
        {
            const material = new THREE.MeshBasicMaterial({
                fog: true,
                map,
                transparent: true,
                depthWrite: false,
                depthTest: true,
                opacity: 0,
            });

            const mesh = new THREE.Mesh(geometry, material);
            const scale = random(1, 4);

            mesh.scale.set(scale + Math.random() * 8, scale, scale);
            mesh.position.x = random(-30, 30);
            mesh.position.y = random(1, 1);
            mesh.position.z = random(-80, 0);
            // mesh.rotation.z = Math.random() * Math.PI * 2;
            mesh.speed = random(0.1, 0.5);
            mesh.material.opacityy = random(0.03, 0.08);

            mesh.r = random(-1, 1);
            this.items.push(mesh);
            this.add(mesh);
        }
    }

    update(cam)
    {
        for (let i = 0; i < this.items.length; i++)
        {
            const mesh = this.items[i];

            mesh.position.z += 0.05 * mesh.speed;
            // mesh.rotation.z += 0.01 * mesh.r;

            const o = range(mesh.position.z, -50, cam.position.z, 1, 0);

            // console.log(mesh.position.z + camera.position.z);

            if (i === 0)
            {
                // console.log(o);
            }

            mesh.material.opacity = clamp(o, 0, 1) * mesh.material.opacityy;
            // mesh.material.opacity = 1;

            if (mesh.position.z > 0)
            {
                mesh.position.z = -80;
                // mesh.position.y = random(2, 4);
                mesh.material.opacityy = random(0.05, 0.2);
                mesh.position.x = random(-30, 30);
            }
            // mesh.quaternion.copy(camera.quaternion);
            // mesh.lookAt(camera.position);
        }
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
