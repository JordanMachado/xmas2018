import * as THREE from 'three';
import { random } from 'utils/functions';
import * as Const from 'Const';

export default class Particles extends THREE.Object3D
{
    constructor(number)
    {
        super();
        const l = number * 3;
        const vertices = new Float32Array(l);
        const colors = new Float32Array(l);

        const size = new Float32Array(l / 3);
        const textureIndex = new Float32Array(l / 3);
        const speed = new Float32Array(number * 2);
        const rotation = new Float32Array(l / 3);
        const colorPalette = [
            new THREE.Color(0xe0e1e6),
            new THREE.Color(0xd9cb7a),

        ];

        for (let i = 0; i < l / 3; i++)
        {
            const i3 = i * 3;

            size[i] = random(1, 20);
            size[i] = random(1, 20);
            rotation[i] = random(0, 360 * Math.PI / 180);

            textureIndex[i] = Math.random() > 0.5 ? 1 : -1;
            speed[i * 2] = random(-1, 1);
            speed[i * 2 + 1] = random(0.4, 1);
            // size[i] = 40;
            vertices[i3] = random(-80, 80);
            vertices[i3 + 1] = random(0, 40);
            vertices[i3 + 2] = random(-100, Const.cameraInitialPosition.z);
            const currentColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];

            colors[i3] = currentColor.r;
            colors[i3 + 1] = currentColor.g;
            colors[i3 + 2] = currentColor.b;
        }
        const geometry = new THREE.BufferGeometry();
        const map = new THREE.Texture();

        map.image = window.getAsset('particles');
        map.needsUpdate = true;

        const map2 = new THREE.Texture();

        map2.image = window.getAsset('particles2');
        map2.needsUpdate = true;
        geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.addAttribute('rotation', new THREE.BufferAttribute(rotation, 1));
        geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.addAttribute('size', new THREE.BufferAttribute(size, 1));
        geometry.addAttribute('textureIndex', new THREE.BufferAttribute(textureIndex, 1));
        geometry.addAttribute('speed', new THREE.BufferAttribute(speed, 2));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uMap: {
                    type: 't',
                    value: map,
                },
                uMap2: {
                    type: 't',
                    value: map2,
                },
                uTime: {
                    type: 'f',
                    value: 0,
                },
            },
            vertexShader: `
          attribute float size;
          attribute float rotation;
          attribute vec2 speed;
          attribute float textureIndex;
          attribute vec3 color;

          uniform float uTime;

          varying vec3 vColor;
          varying float vRotation;
          varying float vTexture;
          void main() {

            vec4 p = vec4(position,1.0);
            p.x += cos(uTime) * speed.x * speed.y;
            p.y += sin(uTime) * speed.x * speed.y;
            gl_PointSize = size;
            gl_Position = projectionMatrix * modelViewMatrix * p;
            vColor = color;
            vRotation = rotation;
            vTexture = textureIndex;
          }

          `,
            fragmentShader: `
          uniform sampler2D uMap;
          uniform sampler2D uMap2;
          varying vec3 vColor;
          varying float vRotation;
          varying float vTexture;


          vec2 rotateUV(vec2 uv, float rotation)
          {
              float mid = 0.5;
              return vec2(
                  cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid,
                  cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid
              );
          }


          void main() {
            vec4 colors = texture2D(uMap, rotateUV(gl_PointCoord, vRotation));
            vec4 colors2 = texture2D(uMap2, rotateUV(gl_PointCoord, vRotation));
            vec4 texColor = mix(colors,colors2,clamp(vTexture,0.0,1.0));
            gl_FragColor = vec4(texColor.rgb * vColor,texColor.a);
            // gl_FragColor = vec4(vec3(0.),1.);

          }

          `,
            // blending: THREE.AdditiveBlending,
            transparent: true,
            depthTest: true,
            // depthWrite: false,

        });

        this.mesh = new THREE.Points(geometry, material);
        this.mesh.renderOrder = 99;

        this.add(this.mesh);
        this.tick = 0;
    }
    update()
    {
        this.mesh.material.uniforms.uTime.value += 0.01;
    }
}
