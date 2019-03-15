import * as THREE from 'three';

import vertexSim from 'shaders/simulation.vert';
import fragmentSim from 'shaders/velocity.frag';
import positionfragmentSim from 'shaders/position.frag';
import * as Const from 'Const';

import PingPong from 'utils/PingPong';
import { random } from 'utils/functions';
import SuperConfig from 'utils/SuperConfig';

export default class ParticleSystem extends THREE.Object3D
{
    constructor(path)
    {
        super();
        this.path = path;
        const width = 128;
        const height = 128;

        const vertices = new Float32Array(width * height * 3);
        const uvs = new Float32Array(width * height * 2);
        const size = new Float32Array(width * height * 1);
        const opacity = new Float32Array(width * height * 1);
        const textureIndex = new Float32Array(width * height * 1);

        this.geometry = new THREE.BufferGeometry();

        let count = 0;

        this.dataPos = new Float32Array(width * height * 4);

        for (let i = 0, l = width * height * 4; i < l; i += 4)
        {
            this.dataPos[i] = random(-5, 5);
            this.dataPos[i + 1] = random(-5, 5);
            // this.dataPos[i + 2] = random(Const.cameraStartPosition.z, Const.cameraStartPosition.z + 5);
            if (SuperConfig.config.end)
            {
                this.dataPos[i + 2] = Const.obeliskPos.z;

                this.dataPos[i + 3] = 1;
            }
            else
            {
                this.dataPos[i + 2] = Const.cameraStartPosition.z;

                this.dataPos[i + 3] = random(-1, 0);
            }

            textureIndex[count * 3] = Math.random() > 0.5 ? 1 : 0;

            uvs[count * 2 + 0] = (count % width) / width;
            uvs[count * 2 + 1] = Math.floor(count / width) / height;

            vertices[count * 3 + 0] = this.dataPos[i];
            vertices[count * 3 + 1] = this.dataPos[i + 1];
            vertices[count * 3 + 2] = this.dataPos[i + 2];
            count++;

            size[count * 3 + 0] = random(8, 10);
            opacity[count * 3 + 0] = random(1, 1);
        }

        this.center = new THREE.Vector3(0, Const.obeliskPos.y, Const.cameraStartPosition.z);
        this.force = new THREE.Vector3(0.5, 0.5, 0);

        this.simulationVel = new PingPong({
            data: this.dataPos,
            width,
            height,
            vertex: vertexSim,
            fragment: fragmentSim,
            uniforms: {
                mouse: {
                    type: 'v3',
                    value: new THREE.Vector3(),
                },
                seperationDistance: {
                    type: 'f',
                    value: 20 / 100,
                },
                alignmentDistance: {
                    type: 'f',
                    value: 20 / 100,
                },
                cohesionDistance: {
                    type: 'f',
                    value: 20 / 100,
                },
                center: {
                    type: 'v3',
                    value: this.center,
                },
                uforce: {
                    type: 'v3',
                    value: this.force,
                },
                tPositionsPos:
              {
                  type: 't',
                  value: new THREE.Texture(),
              },
                tPath: {
                    type: 't',
                    value: this.path.textureData,
                },
                uPathLength: {
                    type: 'f',
                    value: this.path.length,
                },

            },
        });

        this.simulationPos = new PingPong({
            data: this.dataPos,
            width,
            height,
            vertex: vertexSim,
            fragment: positionfragmentSim,
            uniforms: {
                tVelocity:
              {
                  type: 't',
                  value: this.simulationVel.fbo.out.texture,
              },
            },
        });

        this.geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
        this.geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        this.geometry.addAttribute('size', new THREE.BufferAttribute(size, 1));
        this.geometry.addAttribute('opacity', new THREE.BufferAttribute(opacity, 1));
        this.geometry.addAttribute('textureIndex', new THREE.BufferAttribute(textureIndex, 1));

        const map = new THREE.Texture();

        map.image = window.getAsset('particles3');
        map.needsUpdate = true;

        const map2 = new THREE.Texture();

        map2.image = window.getAsset('particles4');
        map2.needsUpdate = true;

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uBuffer:
                {
                    type: 't',
                    value: this.simulationPos.fbo.out.texture,
                },
                uMap: {
                    type: 't',
                    value: map,
                },
                uMap2: {
                    type: 't',
                    value: map2,
                },
            },
            vertexShader: `
            attribute float size;
            attribute float opacity;
            attribute float textureIndex;
            uniform sampler2D uBuffer;
            varying float vOpacity;
            varying float vTextureIndex;
            void main() {

            	vec4 buffer = texture2D(uBuffer,uv);
            	vec3 p = buffer.xyz;
            	// vec3 p = position;
            	gl_PointSize = size;
            	gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
              vOpacity = opacity;
              vTextureIndex = textureIndex;

            }


            `,
            fragmentShader: `
            uniform sampler2D uMap;
            uniform sampler2D uMap2;
            varying float vOpacity;
            varying float vTextureIndex;

            void main() {

              vec4 colors = texture2D(uMap, gl_PointCoord);
              vec4 colors2 = texture2D(uMap2, gl_PointCoord);
              vec4 texColor = mix(colors,colors2,clamp(vTextureIndex,0.0,1.0));
              gl_FragColor = vec4(texColor.rgb,texColor.a * vOpacity);


            }


            `,
            // blending: THREE.AdditiveBlending,
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
    start()
    {
        this.canUpdate = true;
    }
    repulsion()
    {
        TweenLite.to(this.simulationVel.shader.uniforms.uforce.value, 2, {
            y: 3,
        });
    }
    clickObelisk()
    {
        TweenLite.to(this.simulationVel.shader.uniforms.uforce.value, 0.1, {
            x: 100,
        });

        TweenLite.to(this.simulationVel.shader.uniforms.uforce.value, 0.1, {
            x: 0,
            delay: 0.1,
        });
    }
    update(mouse)
    {
        if (!this.canUpdate) return;
        this.time += 0.005 * 0.8;
        this.simulationVel.shader.uniforms.mouse.value = mouse;

        this.simulationVel.shader.uniforms.tPositionsPos.value = this.simulationPos.fbo.out.texture;

        this.simulationVel.update();
        this.simulationPos.update();

        this.material.uniforms.uBuffer.value = this.simulationPos.fbo.out.texture;
    }
}
