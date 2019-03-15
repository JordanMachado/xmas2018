import * as THREE from 'three';

export default class Mountain extends THREE.Object3D
{
    constructor()
    {
        super();

        const normal = new THREE.Texture();

        normal.image = window.getAsset('mountainNormal');
        normal.needsUpdate = true;
        const heightMap = new THREE.Texture();

        heightMap.image = window.getAsset('mountain');
        heightMap.needsUpdate = true;

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
                heightMap: {
                    type: 't',
                    value: heightMap,
                },
                normalMap: {
                    type: 't',
                    value: normal,
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

            uniform sampler2D heightMap;

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
              float height = texture2D(heightMap, uv).z;
              vHeight = height;
              transformed.z += height * 15.;
              gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(transformed,1.0);

            }
            `,
            fragmentShader:
            `

            #define PHONG
  uniform vec3 diffuse;
  uniform vec3 emissive;
  uniform vec3 specular;
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
  	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  	vec3 totalEmissiveRadiance = emissive;
  	#include <logdepthbuf_fragment>
  	#include <map_fragment>
  	#include <color_fragment>
  	#include <alphamap_fragment>
  	#include <alphatest_fragment>
  	#include <specularmap_fragment>
  	#include <normal_fragment_begin>
  	#include <normal_fragment_maps>
  	#include <emissivemap_fragment>
    BlinnPhongMaterial material;
    material.diffuseColor = diffuseColor.rgb;
    material.specularColor = specular;
    material.specularShininess = 3.;
    material.specularStrength = specularStrength;
  	#include <lights_fragment_begin>
  	#include <lights_fragment_maps>
  	#include <lights_fragment_end>
  	#include <aomap_fragment>
  	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
  	#include <envmap_fragment>
  	gl_FragColor = vec4( outgoingLight, diffuseColor.a );
  	#include <tonemapping_fragment>
  	#include <encodings_fragment>
  	// #include <fog_fragment>

    #ifdef USE_FOG
    #ifdef FOG_EXP2
      float fogFactor = whiteCompliment( exp2( - fogDensity * fogDensity * fogDepth * fogDepth * LOG2 ) );
    #else
      float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
    #endif
      gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor * 1.0-vHeight );
    #endif
  	#include <premultiplied_alpha_fragment>
  	#include <dithering_fragment>
  }
            `,
            fog: true,
            lights: true,
            side: THREE.DoubleSide,
            defines: {
                USE_NORMALMAP: true,
                derivatives: true,
            },

        });

        this.material.extensions.derivatives = true;

        this.material.uniforms.diffuse.value = new THREE.Color(0x3a5c64);
        this.material.uniforms.normalMap.value = normal;
        this.material.uniforms.normalMap.value.needsUpdate = true;

        this.plane = new THREE.Mesh(new THREE.PlaneGeometry(200, 100, 100, 100), this.material);
        this.plane.position.z = -99;
        this.plane.position.y = -1;
        this.plane.rotation.x = -90 * Math.PI / 180;

        this.add(this.plane);

        this.moon = new THREE.Mesh(new THREE.SphereGeometry(5, 36, 36), new THREE.MeshBasicMaterial({
            fog: false,
        }));
        this.moon.position.x = 35;
        this.moon.position.z = -100;
        this.moon.position.y = 40;
        this.add(this.moon);

        this.bloomMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            fog: false,
        });
    }
    bloom()
    {
        this.plane.visible = false;
    }
    unBloom()
    {
        this.plane.visible = true;
    }
}
