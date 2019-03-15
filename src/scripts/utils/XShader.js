import * as THREE from "three";

import THREEShader from "./THREEShader.js";

export default class XShaderMat extends THREE.ShaderMaterial {
  constructor (originalShaderName, options = {}) {
    let vertexShaderHooks = Object.assign({prefix: "", main: "", suffix: ""}, options.vertexShaderHooks);
    let fragmentShaderHooks = Object.assign({prefix: "", main: "", suffix: ""}, options.fragmentShaderHooks);

    let originalShader = THREE.ShaderLib[originalShaderName];
    let tempShader = new THREEShader(vertexShaderHooks.prefix, fragmentShaderHooks.prefix);

    options.uniforms = Object.assign(THREE.UniformsUtils.clone(originalShader.uniforms), tempShader.uniforms, options.uniforms);

    var regExp = /([\s\S]*?\bvoid\b +\bmain\b[\s\S]*?{)([\s\S]*)}/m;

    let generateSubstringFromHooks = (hooks) => {
      return `${hooks.prefix}\n\n$1\n\n${hooks.main}\n\n$2\n\n${hooks.suffix}\n\n}`
    }

    delete options.vertexShaderHooks;
    delete options.fragmentShaderHooks;

    super(Object.assign({
      vertexShader: originalShader.vertexShader.replace(regExp, generateSubstringFromHooks(vertexShaderHooks)),
      fragmentShader: originalShader.fragmentShader.replace(regExp, generateSubstringFromHooks(fragmentShaderHooks))
    }, options));

    this.lights = /lambert|phong|standard|physical/.test(originalShaderName);
  }
}