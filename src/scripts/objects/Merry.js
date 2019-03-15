import * as THREE from 'three';
import { random } from 'utils/functions';
import * as Const from 'Const';
export default class PlayButton extends THREE.Object3D
{
    constructor(noiseTexture, textureName = 'merry', offsetY = 5)
    {
        super();

        const texture = new THREE.Texture();

        texture.image = window.getAsset(textureName);
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

        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(3, 1), this.material);

        mesh.position.y = offsetY;
        // mesh.position.y = Const.obeliskPos.z.y - 2;
        mesh.position.z = -15;

        // mesh.material.opacity = 0;

        this.mesh = mesh;
        this.add(mesh);
        this.shown = false;
    }
    show()
    {
        if (this.shown) return;
        this.shown = true;
        TweenLite.to(this.mesh.material.uniforms.opacity, 2, {
            value: 1,
            ease: Sine.easeInOut,
        });
        TweenLite.to(this.mesh.position, 2, {
            z: -10,
            ease: Sine.easeInOut,
        });
        TweenLite.to(this.mesh.scale, 2, {
            x: 1,
            y: 1,
            ease: Sine.easeInOut,
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
