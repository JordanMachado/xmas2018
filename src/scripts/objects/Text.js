import * as THREE from 'three';
import { random } from 'utils/functions';
import * as Const from 'Const';
export default class Text extends THREE.Object3D
{
    constructor(noiseTexture)
    {
        super();

        this.group = new THREE.Group();

        const letters = ['l', 'i', 't', 'h', 'o', 's'];
        const size = 1.7;

        this.meshes = [];
        for (let i = 0; i < letters.length; i++)
        {
            const texture = new THREE.Texture();

            texture.image = window.getAsset(`letter-${letters[i]}`);
            texture.needsUpdate = true;

            this.material = new THREE.ShaderMaterial({
                uniforms: {
                    map: {
                        type: 't',
                        value: texture,
                    },
                    noiseTexture: {
                        type: 't',
                        value: noiseTexture,
                    },
                    opacity: {
                        type: 'f',
                        value: -1,
                    },

                },
                vertexShader:
                `
                varying vec2 vUv;
                  void main() {
                    vec4 p = vec4(position,1.0);
                    gl_Position = projectionMatrix * modelViewMatrix * p;
                    vUv = uv;
                  }
                  `,
                fragmentShader: `
                  uniform sampler2D map;
                  uniform sampler2D noiseTexture;
                  uniform float opacity;
                  varying vec2 vUv;
                  void main() {
                    vec4 colors = texture2D(map, vUv);
                    vec4 noise = texture2D(noiseTexture, vUv);

                    float aplha = noise.r;
                    aplha+= opacity;
                    aplha *= colors.a;
                    gl_FragColor = colors;
                    gl_FragColor.a *= aplha;

                  }
                  `,
                transparent: true,
                depthWrite: false,
                depthTest: false,
                // fog: true,
            });

            const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(size, size), this.material);

            mesh.position.x = i * size;
            mesh.position.y = -1 + Const.cameraStartPosition.y;
            mesh.position.z = Const.cameraStartPosition.z - 15;
            mesh.scale.set(0.5, 0.5, 1);

            this.group.add(mesh);
            this.meshes.push(mesh);
        }
        this.offset = (letters.length * size) / 2 - size / 2;
        this.group.position.x = -this.offset;
        this.add(this.group);
    }
    show()
    {
        for (let i = 0; i < this.meshes.length; i++)
        {
            TweenLite.to(this.meshes[i].material.uniforms.opacity, 2, {
                value: 1,
                delay: i * 0.05,
                ease: Sine.easeInOut,
            });
            TweenLite.to(this.meshes[i].position, 2, {
                y: Const.cameraStartPosition.y,
                z: Const.cameraStartPosition.z - 12,
                delay: i * 0.05,
                ease: Sine.easeInOut,
            });
            TweenLite.to(this.meshes[i].scale, 2, {
                x: 1,
                y: 1,
                delay: i * 0.05,
                ease: Sine.easeInOut,
            });
        }
    }
    hide()
    {
        for (let i = 0; i < this.meshes.length; i++)
        {
            TweenLite.to(this.meshes[i].material.uniforms.opacity, 2, {
                value: -1,
                delay: i * 0.05,
                ease: Sine.easeInOut,
                onComplete: () =>
                {
                    this.group.remove(this.meshes[i]);
                },
            });
        }
    }
}
