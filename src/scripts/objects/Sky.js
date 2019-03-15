import * as THREE from 'three';

export default class Sky extends THREE.Object3D
{
    constructor()
    {
        super();

        const texture = new THREE.Texture();

        texture.image = window.getAsset('gradient');
        texture.needsUpdate = true;

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: {
                    type: 't',
                    value: texture,
                },
                uColorStart: {
                    type: 'c',
                    value: new THREE.Color(0x6ca5a9),
                },
                uColorEnd: {
                    type: 'c',
                    value: new THREE.Color(0x84d0de),
                },
            },
            vertexShader:
            `
            varying vec2 vUv;
            void main() {
              vec4 p = vec4(position,1.);
              vUv=uv;
              gl_Position = projectionMatrix * viewMatrix * modelMatrix * p;
            }
            `,
            fragmentShader:
            `
            varying vec2 vUv;
            uniform vec3 uColorStart;
            uniform vec3 uColorEnd;
            uniform sampler2D uTexture;


            float random (vec2 st) {
              return fract(sin(dot(st.xy, vec2(12.9898,78.233)))
              * 43758.5453123);
            }

            void main() {
              vec4 colors = texture2D(uTexture,vec2(0.1,vUv.y + random(vUv) * 0.01));
              vec3 color = mix(uColorStart, uColorEnd, vUv.y + random(vUv));
              gl_FragColor = vec4(colors);
              // gl_FragColor = vec4(random(vUv));
            }

            `,
            side: THREE.BackSide,
        });

        this.mesh = new THREE.Mesh(new THREE.SphereGeometry(120, 36, 36, 0, Math.PI * 2, 0, Math.PI / 2), this.material);
        this.mesh.position.y = -5;

        this.add(this.mesh);
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
