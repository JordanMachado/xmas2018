import * as THREE from 'three';
import { random } from 'utils/functions';
import * as Const from 'Const';
export default class PlayButton extends THREE.Object3D
{
    constructor(noiseTexture)
    {
        super();

        const texture = new THREE.Texture();

        texture.image = window.getAsset(`play`);
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

        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), this.material);

        this.name = 'playbtn';
        mesh.name = 'playbtn';
        mesh.position.y = 5;
        mesh.position.y = Const.cameraStartPosition.y - 2;
        mesh.position.z = Const.cameraStartPosition.z - 8;
        // mesh.material.opacity = 0;

        this.mesh = mesh;
        this.add(mesh);
    }
    show()
    {
        TweenLite.to(this.mesh.material.uniforms.opacity, 2, {
            value: 1,
            ease: Sine.easeInOut,
        });
        TweenLite.to(this.mesh.position, 2, {
            y: Const.cameraStartPosition.y - 1,
            z: Const.cameraStartPosition.z - 6,

            ease: Sine.easeInOut,
        });
        TweenLite.to(this.mesh.scale, 2, {
            x: 1,
            y: 1,
            ease: Sine.easeInOut,
        });
    }
    hover()
    {
        this.ishover = true;
        TweenLite.to(this.mesh.scale, 0.4, {
            x: 1.2,
            y: 1.2,
        });
    }
    out()
    {
        if (!this.ishover) return;
        this.ishover = false;
        TweenLite.to(this.mesh.scale, 0.4, {
            x: 1,
            y: 1,
        });
    }
    hide()
    {
        TweenLite.to(this.mesh.material.uniforms.opacity, 2, {
            value: -1,
            ease: Sine.easeInOut,
            onComplete: () =>
            {
                this.remove(this.mesh);
            },
        });
    }
}
