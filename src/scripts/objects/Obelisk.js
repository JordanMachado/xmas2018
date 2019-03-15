import * as THREE from 'three';
const loader =  new THREE.OBJLoader();

import Glow from './Glow';
import * as Const from 'Const';

export default class Obelisk extends THREE.Object3D
{
    constructor(noiseTexture)
    {
        super();
        this.group = new THREE.Group();
        const localPlane = new THREE.Plane(new THREE.Vector3(0, 0.1, 0), 1);

        this.add(this.group);

        this.mapOff = new THREE.Texture();

        this.mapOff.image = window.getAsset('stone-off');
        this.mapOff.needsUpdate = true;

        this.mapOn = new THREE.Texture();

        this.mapOn.image = window.getAsset('stone-on');
        this.mapOn.needsUpdate = true;

        this.normal = new THREE.Texture();

        this.normal.image = window.getAsset('normal-obe');
        this.normal.needsUpdate = true;

        const normal = new THREE.Texture();

        normal.image = window.getAsset('waterNormal');
        normal.needsUpdate = true;

        const scale = 0.1;

        const obe = loader.parse(window.getAsset('stone'));

        const threeuniforms = [
            THREE.UniformsLib.common,
            THREE.UniformsLib.specularmap,
            THREE.UniformsLib.envmap,
            THREE.UniformsLib.aomap,
            THREE.UniformsLib.lightmap,
            THREE.UniformsLib.emissivemap,
            THREE.UniformsLib.bumpmap,
            THREE.UniformsLib.normalmap,
            THREE.UniformsLib.displacementmap,
            THREE.UniformsLib.gradientmap,
            THREE.UniformsLib.fog,
            THREE.UniformsLib.lights,
            {
                foggy: {
                    type: 'f',
                    value: 0,
                },
                switchText: {
                    type: 'f',
                    value: -1,
                },

                noiseTexture: {
                    type: 't',
                    value: noiseTexture,
                },
                mapOn: {
                    type: 't',
                    value: this.mapOn,
                },

            },
        ];

        const uniforms = threeuniforms.reduce((result, current) =>
            Object.assign(result, current), {});

        this.material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader:
          `
            #define PHONG
            varying vec3 vViewPosition;
            varying float vHeight;

            #ifndef FLAT_SHADED
              varying vec3 vNormal;
            #endif
            #include <common>
            #include <uv_pars_vertex>
            #include <uv2_pars_vertex>
            #include <displacementmap_pars_vertex>
            #include <envmap_pars_vertex>
            #include <color_pars_vertex>
            #include <fog_pars_vertex>
            #include <morphtarget_pars_vertex>
            #include <skinning_pars_vertex>
            #include <shadowmap_pars_vertex>
            #include <logdepthbuf_pars_vertex>
            #include <clipping_planes_pars_vertex>
            void main() {
              #include <uv_vertex>
              #include <uv2_vertex>
              #include <color_vertex>
              #include <beginnormal_vertex>
              #include <morphnormal_vertex>
              #include <skinbase_vertex>
              #include <skinnormal_vertex>
              #include <defaultnormal_vertex>
            #ifndef FLAT_SHADED
              vNormal = normalize( transformedNormal );
            #endif
              #include <begin_vertex>
              #include <morphtarget_vertex>
              #include <skinning_vertex>
              #include <displacementmap_vertex>
              #include <project_vertex>
              #include <logdepthbuf_vertex>
              #include <clipping_planes_vertex>
              vViewPosition = - mvPosition.xyz;
              #include <worldpos_vertex>
              #include <envmap_vertex>
              #include <shadowmap_vertex>
              #include <fog_vertex>
              vHeight = (transformed.y+30.)/50. + modelMatrix[3].y;
              vHeight = vec4(modelMatrix * vec4(transformed,1.0)).y/ 10.;
              gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(transformed,1.0);

            }
            `,
            fragmentShader:
            `

            #define PHONG
  uniform vec3 diffuse;
  uniform sampler2D noiseTexture;
  uniform sampler2D mapOn;
  uniform vec3 emissive;
  uniform vec3 specular;
  uniform float foggy;
  uniform float switchText;
  uniform float shininess;
  uniform float opacity;
  varying float vHeight;

  #include <common>
  #include <packing>
  #include <dithering_pars_fragment>
  #include <color_pars_fragment>
  #include <uv_pars_fragment>
  #include <uv2_pars_fragment>
  #include <map_pars_fragment>
  #include <alphamap_pars_fragment>
  #include <aomap_pars_fragment>
  #include <lightmap_pars_fragment>
  #include <emissivemap_pars_fragment>
  #include <envmap_pars_fragment>
  #include <gradientmap_pars_fragment>
  #include <fog_pars_fragment>
  #include <bsdfs>
  #include <lights_pars_begin>
  #include <lights_phong_pars_fragment>
  #include <shadowmap_pars_fragment>
  #include <bumpmap_pars_fragment>
  #include <normalmap_pars_fragment>
  #include <specularmap_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  #include <clipping_planes_pars_fragment>
  void main() {
    #include <clipping_planes_fragment>
    vec4 diffuseColor = vec4( diffuse, opacity );
    ReflectedLight reflectedLight = ReflectedLight( vec3( .0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;
    #include <logdepthbuf_fragment>



    vec4 noise = texture2D( noiseTexture, vUv );
    vec4 mapOff = texture2D( map, vUv );
    vec4 mapOn = texture2D( mapOn, vUv );

    vec4 texelColor = mix(mapOff,mapOn,clamp(noise.x + switchText,0.,1.));
    texelColor = mapTexelToLinear( texelColor );
    diffuseColor *= texelColor;


    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <specularmap_fragment>
    #include <normal_fragment_begin>
    #include <normal_fragment_maps>
    #include <emissivemap_fragment>
    #include <lights_phong_fragment>
    #include <lights_fragment_begin>
    #include <lights_fragment_maps>
    #include <lights_fragment_end>
    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
    #include <envmap_fragment>
    gl_FragColor = vec4( outgoingLight, diffuseColor.a );
    #include <tonemapping_fragment>
    #include <encodings_fragment>

    #ifdef USE_FOG
    #ifdef FOG_EXP2
      float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 ) );
    #else
      float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
    #endif
      gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, (fogFactor * 1.0 - clamp(vHeight,0.0,1.0))*foggy);
      // gl_FragColor.rgb = vec3(clamp(vHeight,0.0,1.0));
    #endif
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
    // gl_FragColor = vec4(normal,1.0);

  }
            `,
            fog: true,
            lights: false,
            clippingPlanes: [localPlane],
            clipping: true,
            side: THREE.DoubleSide,
            transparent: true,
            defines: {
                USE_MAP: true,
                USE_NORMALMAP: true,
                derivatives: true,
            },

            // flatShading: true,

        });

        this.material.uniforms.map.value = this.mapOff;
        this.material.uniforms.normalScale.value.x = 0.3;
        this.material.uniforms.normalScale.value.y = 0.3;
        this.material.uniforms.normalMap.value = this.normal;
        this.material.extensions.derivatives = true;
        let geometry = null;

        obe.traverse((child) =>
        {
            if (child instanceof THREE.Mesh)
            {
                geometry = child.geometry;
                child.material = this.material;
                child.scale.set(-scale, scale, -scale);
                this.obelisk = child;
            }
        });

        this.group.add(obe);

        this.group.position.z = Const.obeliskPos.z;
        this.group.offsetY = -7;
        // this.group.offsetY = Const.obeliskPos.y;
        this.tick = 0;

        this.hitArea = new THREE.Mesh(new THREE.PlaneGeometry(6, 11), new THREE.MeshBasicMaterial({
            color: 0xff0000,
            fog: false,
            opacity: 0,
            transparent: true,
            depthWrite: false,
        }));
        this.hitArea.name = 'obelisk';

        this.group.add(this.hitArea);
    }
    show(cb)
    {
        TweenLite.to(this.group, 7, {
            offsetY: Const.obeliskPos.y,
            delay: 6,
            ease: Sine.EaseInOut,
            onComplete: () =>
            {
                if (cb)
                {
                    cb();
                }
            },
        });
        TweenLite.to(this.material.uniforms.switchText, 4, {
            value: 1,
            delay: 12,
            ease: Sine.easeInOut,
        });
    }
    hide()
    {
        TweenLite.to(this.group, 0.5, {
            offsetY: -6,
        });
    }
    update()
    {
        this.tick += 0.02;
        this.obelisk.rotation.y += 0.0025;
        this.group.position.x = Math.cos(this.tick) * 0.1;
        this.group.position.y = Math.sin(this.tick) * 0.1 + this.group.offsetY;
    }
    bloom()
    {
        this.material.uniforms.foggy.value = 0;
    }
    unBloom()
    {
        this.material.uniforms.foggy.value = 1;
    }
}
