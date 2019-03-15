import * as THREE from 'three';

import vertexSim from 'shaders/simulation.vert';
import positionfragmentSim from 'shaders/mouseposition.frag';
import * as Const from 'Const';

import PingPong from 'utils/PingPong';
import { random } from 'utils/functions';
import SuperConfig from 'utils/SuperConfig';

export default class ParticleSystem extends THREE.Object3D
{
    constructor()
    {
        super();
        const width = 128;
        const height = 128;

        const vertices = new Float32Array(width * height * 3);
        const uvs = new Float32Array(width * height * 2);
        const size = new Float32Array(width * height * 1);

        this.geometry = new THREE.BufferGeometry();

        let count = 0;

        this.dataPos = new Float32Array(width * height * 4);

        for (let i = 0, l = width * height * 4; i < l; i += 4)
        {
            this.dataPos[i] = random(-0.01, 0.01);
            this.dataPos[i + 1] = random(-0.01, 0.01);
            this.dataPos[i + 2] = random(0.05, 0.1);
            this.dataPos[i + 3] = Math.random();

            uvs[count * 2 + 0] = (count % width) / width;
            uvs[count * 2 + 1] = Math.floor(count / width) / height;

            vertices[count * 3 + 0] = this.dataPos[i];
            vertices[count * 3 + 1] = this.dataPos[i + 1];
            vertices[count * 3 + 2] = this.dataPos[i + 2];
            count++;

            size[count * 3 + 0] = random(8, 10);
        }

        this.simulation = new PingPong({
            data: this.dataPos,
            width,
            height,
            vertex: vertexSim,
            fragment: positionfragmentSim,
            uniforms: {
                mouse:
              {
                  type: 'v3',
                  value: new THREE.Vector3(),
              },
            },
        });

        this.geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        this.geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        this.geometry.addAttribute('size', new THREE.BufferAttribute(size, 1));

        const map = new THREE.Texture();

        map.image = window.getAsset('particles');
        map.needsUpdate = true;

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uBuffer:
                {
                    type: 't',
                    value: this.simulation.fbo.out.texture,
                },
                map: {
                    type: 't',
                    value: map,
                },
            },
            vertexShader: `
            attribute float size;
            uniform sampler2D uBuffer;
            varying float vLife;
            void main() {

            	vec4 buffer = texture2D(uBuffer,uv);
            	vec3 p = buffer.xyz;
            	gl_PointSize = size * buffer.a;
            	gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
              vLife = buffer.a;

            }


            `,
            fragmentShader: `
            uniform sampler2D map;
            varying float vLife;


            void main() {
              vec4 colors = texture2D(map,gl_PointCoord);
              gl_FragColor = vec4(gl_PointCoord,1.0,1.0);
              gl_FragColor = vec4(colors.xyz,colors.a * vLife);
            }


            `,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthTest: true,
            depthWrite: false,

        });

        this.system = new THREE.Points(this.geometry, this.material);
        // this.system.visible = false;
        this.system.frustumCulled = false;
        this.system.renderOrder = 999;
        this.add(this.system);
        this.time = 0.000;
    }

    update(mouse)
    {
        this.time += 0.005 * 0.8;

        this.simulation.shader.uniforms.mouse.value = mouse;

        this.simulation.update();

        this.material.uniforms.uBuffer.value = this.simulation.fbo.out.texture;
    }
}
