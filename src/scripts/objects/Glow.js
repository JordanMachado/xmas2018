import * as THREE from 'three';
import SuperConfig from 'utils/SuperConfig';
import Broadcaster from 'utils/Broadcaster';

let glowgeom = new THREE.SphereGeometry(1, 32, 32);

export default class Glow extends THREE.Object3D
{
    constructor(radius, color = 0x4dff94, geometry)
    {
        super();

        if (geometry)
        {
            glowgeom = geometry;
        }
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                c: {
                    type: 'f',
                    value: SuperConfig.config.c.value,

                },
                p: {
                    type: 'f',
                    value: SuperConfig.config.p.value,

                },
                glowColor: {
                    type: 'c',
                    value: new THREE.Color(color),
                },
                eye: {
                    type: 'v3',
                    value: new THREE.Vector3(0, 0, 10),
                },

            },
            vertexShader: `
              varying vec3 vNormal;
              varying vec3 vEye;
              uniform vec3 eye;

              void main() {
                vNormal = normalize(normal);
                vEye = normalize(eye);
                gl_Position = projectionMatrix * modelViewMatrix *
                vec4(position, 1.0);

              }
            `,
            fragmentShader: `
              varying vec3 vNormal;
              varying vec3 vEye;
              uniform float c;
              uniform float p;
              uniform vec3 glowColor;

              void main() {
              float intensity = pow( c - dot( vNormal, vEye ), p );
              gl_FragColor = vec4( glowColor, 1. ) * intensity;
              // gl_FragColor = vec4( glowColor, 1. );

              }
            `,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            fog: false,

        });
        const sphere = new THREE.Mesh(glowgeom, this.material);

        sphere.scale.set(radius, radius, radius);

        sphere.frustumCulled = false;

        this.mesh = sphere;

        this.add(this.mesh);

        Broadcaster.on('gui__c', () =>
        {
            this.material.uniforms.c.value = SuperConfig.config.c.value;
        });
        Broadcaster.on('gui__p', () =>
        {
            this.material.uniforms.p.value = SuperConfig.config.p.value;
        });
    }
    bloom()
    {
        this.visible = false;
    }
    unBloom()
    {
        this.visible = true;
    }
    update(eye)
    {}
}
