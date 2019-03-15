import raf from 'raf';
import * as THREE from 'three';
window.THREE = THREE;
const OrbitControls = require('three-orbit-controls')(THREE);

import sono from 'sono';

import OBJLoader from 'utils/OBJLoader';

import Water from 'objects/Water';
import Ponton from 'objects/Ponton';
import Barque from 'objects/Barque';
import Clouds from 'objects/Clouds';
import AmbientParticles from 'objects/AmbientParticles';
import Particles from 'objects/Particles';
import Mountain from 'objects/Mountain';
import Obelisk from 'objects/Obelisk';
import Sky from 'objects/Sky';
import Glow from 'objects/Glow';
import Text from 'objects/Text';
import CurvesManager from 'objects/CurvesManager';
import Path from 'objects/Path';
import PlayButton from 'objects/PlayButton';
import SuperConfig from 'utils/SuperConfig';
import Broadcaster from 'utils/Broadcaster';
import MouseParticles from 'objects/MouseParticles';
import PostPro from './PostPro';
import Konami from 'konami-js';
import Lol from 'objects/Lol';
import Merry from 'objects/Merry';
import NoiseTexture from 'utils/NoiseTexture';
import * as Const from './Const';

export default class Scene
{
    constructor()
    {
        window.scene = this;

        this.resolution = window.devicePixelRatio > 1.7 ? 1.7 : window.devicePixelRatio;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.clickObeliskCount = 0;

        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.01, 3000);
        this.camera.offset = new THREE.Vector3();
        this.camera2 = new THREE.PerspectiveCamera(45, this.width / this.height, 0.01, 3000);
        this.camera.position.y = 5;
        this.camera.position.z = 35;

        this.camera.position.x = Const.cameraInitialPosition.x;
        this.camera.position.y = Const.cameraInitialPosition.y;
        this.camera.position.z = Const.cameraInitialPosition.z;

        this.targetCamera = new THREE.Vector3(0, 1.5, Const.obeliskPos.z);

        this.renderer = new THREE.WebGLRenderer();
        window.renderer = this.renderer;
        this.renderer.localClippingEnabled = true;
        this.renderer.setPixelRatio(this.resolution);

        this.renderer.setSize(this.width, this.height, false);
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(SuperConfig.config.fog.color, SuperConfig.config.fog.density.value);

        Broadcaster.on('gui_fog_color', () =>
        {
            this.scene.fog.color = new THREE.Color(SuperConfig.config.fog.color);
        });

        Broadcaster.on('gui_fog_density', () =>
        {
            this.scene.fog.density = SuperConfig.config.fog.density.value;
        });

        this.mouse = new THREE.Vector2();
        this.mouseEase = new THREE.Vector2();
        this.mouse3d = new THREE.Vector3();
        this.mouse3dEase = new THREE.Vector3();
        this.mouseDivisor = 3;

        this.raycaster = new THREE.Raycaster();
        this.objectsToRayCast = [];

        this.noise = new NoiseTexture(this.renderer);

        this.noise.render(false);

        this.addObjects();
        this.addLights();

        this.postPro = new PostPro(this);
        this.tick = 0;

        if (SuperConfig.config.orbitControl)
        {
            this.controls = new OrbitControls(this.camera);
            this.camera.position.y = 10;
            this.camera.position.z = 20;
            this.camera.lookAt(new THREE.Vector3(0, 0, -20));
            this.controls.target = new THREE.Vector3(0, 0, -20);
            this.scene.fog.density = 0;
        }
        if (SuperConfig.config.start)
        {
            this.text.show();
            setTimeout(() =>
            {
                this.playButton.show();
            }, 1200);
        }

        if (SuperConfig.config.end)
        {
            this.camera.position.z = Const.cameraEndPosition.z;
            this.obelisk.show(0.1);
            this.particles.start();
        }

        new Konami(this.konami.bind(this));
    }
    addLights()
    {
        const ambient = new THREE.AmbientLight(0x24294c);

        this.scene.add(ambient);
        const directionalLight = new THREE.DirectionalLight(0x7facd9, 0.5);

        directionalLight.position.set(-100, 1, 0);
        directionalLight.lookAt(new THREE.Vector3());

        this.scene.add(directionalLight);
        const radius = 20;
        const point = this.point = new THREE.PointLight(0xd1d1d1, 3, radius);

        this.point = point;
        point.position.set(0, 8, Const.obeliskPos.z + 7);
        this.scene.add(point);
    }

    addObjects()
    {
        this.plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({
            color: 0xff0000,
            fog: false,
            opacity: 0.0,
            transparent: true,
            depthWrite: false,
        }));
        this.objectsToRayCast.push(this.plane);

        this.scene.add(this.plane);

        this.text = new Text(this.noise.texture);
        this.scene.add(this.text);

        this.playButton = new PlayButton(this.noise.texture);
        this.scene.add(this.playButton);
        this.objectsToRayCast.push(this.playButton);

        this.sky = new Sky();
        this.scene.add(this.sky);

        this.mountains = new Mountain();
        this.scene.add(this.mountains);

        this.renderTarget = new THREE.WebGLRenderTarget(
            this.width,
            this.height,
            {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBFormat,
            });
        this.renderTarget.texture.flipY = false;

        this.water = new Water(this.renderTarget, this.camera);

        this.scene.add(this.water);

        this.ponton = new Ponton();
        this.scene.add(this.ponton);

        this.noise2 = new NoiseTexture(this.renderer, 20);
        this.noise2.render(false);

        this.obelisk = new Obelisk(this.noise2.texture);
        this.scene.add(this.obelisk);

        this.barque = new Barque();
        this.scene.add(this.barque);

        this.clouds = new Clouds();
        this.scene.add(this.clouds);

        this.glowLeft = new Glow(38, 0x4dff94);
        this.glowLeft.position.x = -20;
        this.glowLeft.position.z = -35;
        this.scene.add(this.glowLeft);

        this.glowRight = new Glow(38, 0x2575d0);
        this.glowRight.position.x = 20;
        this.glowRight.position.z = -35;
        this.scene.add(this.glowRight);

        this.ambientParticles = new AmbientParticles(500);
        this.scene.add(this.ambientParticles);

        this.mouseParticles = new MouseParticles();
        this.scene.add(this.mouseParticles);

        const curvesManager = new CurvesManager(this.scene);
        const curve = curvesManager.createCurves(
            [
                new THREE.Vector3(0, 1, 20),
                new THREE.Vector3(8, 8, 20),
                new THREE.Vector3(-10, 1, 0),
                new THREE.Vector3(0, 5, -30),
            ]
        );

        this.curveCamera = curvesManager.createCurves(
            [
                new THREE.Vector3(0, 0, Const.cameraStartPosition.z),
                new THREE.Vector3(1, 2, 20),
                new THREE.Vector3(-2, -2, 10),
                new THREE.Vector3(0, 1, Const.cameraEndPosition.z),
            ]
            , 0x00ff00);

        const initpoint = this.curveCamera.getPoint(0);

        this.camera.offset.x = initpoint.x;
        this.camera.offset.y = initpoint.y;
        this.camera.offset.z = initpoint.z;

        const path = new Path(curve);

        this.particles = new Particles(path);
        this.scene.add(this.particles);

        this.debugMouse = new THREE.Mesh(new THREE.SphereGeometry(0.05), new THREE.MeshBasicMaterial());
        this.scene.add(this.debugMouse);

        const merry = this.merry = new Merry(this.noise.texture, 'merry', 6);

        this.scene.add(merry);

        const xmas = this.xmas = new Merry(this.noise.texture, 'xmas', 5);

        this.scene.add(xmas);
    }
    mouseMove(x, y)
    {
        this.mouse.x = (x / window.innerWidth - 0.5) * 2;
        this.mouse.y = -(y / window.innerHeight - 0.5) * 2;

        this.rayCast();
    }
    click(x, y)
    {
        this.mouse.x = (x / window.innerWidth - 0.5) * 2;
        this.mouse.y = -(y / window.innerHeight - 0.5) * 2;

        this.rayCast('click');
    }
    rayCast(type)
    {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.objectsToRayCast, true);

        this.playButton.hoverRay = false;

        if (intersects.length > 0)
        {
            for (let i = 0; i < intersects.length; i++)
            {
                const intersect = intersects[i];

                if (intersect.object.name === 'playbtn')
                {
                    if (type === 'click')
                    {
                        this.start();
                        this.objectsToRayCast = this.objectsToRayCast.filter((el) => el.name != 'playbtn');
                    }
                    else
                    {
                        this.playButton.hover();
                        this.playButton.hoverRay = true;
                    }
                }
                else if (intersect.object.name === 'obelisk')
                {
                    if (type === 'click')
                    {
                        this.clickObelisk();
                    }
                }
                else
                {
                    this.mouse3d = intersects[i].point;
                }
            }
        }
        if (!this.playButton.hoverRay)
        {
            this.playButton.out();
        }
    }
    update()
    {
        this.mouseEase.x += ((this.mouse.x / this.mouseDivisor) - this.mouseEase.x) * 0.04;
        this.mouseEase.y += ((this.mouse.y / this.mouseDivisor) - this.mouseEase.y) * 0.04;

        this.mouse3dEase.x += ((this.mouse3d.x) - this.mouse3dEase.x) * 0.1;
        this.mouse3dEase.y += ((this.mouse3d.y) - this.mouse3dEase.y) * 0.1;
        this.mouse3dEase.z = this.mouse3d.z;

        this.plane.position.z = this.camera.position.z - 10;
        this.debugMouse.position.copy(this.mouse3dEase);

        this.particles.update(this.mouse3d);
        this.mouseParticles.update(this.mouse3dEase);
        this.clouds.update(this.camera);
        this.obelisk.update();
        this.water.update();
        this.ambientParticles.update();

        if (SuperConfig.config.camMove)
        {
            this.camera.position.x += (this.mouseEase.x - this.camera.position.x) + this.camera.offset.x;
            this.camera.position.y += (this.mouseEase.y - this.camera.position.y) + 5 + this.camera.offset.y;
            this.camera.position.z = this.camera.offset.z;
            this.camera.lookAt(this.targetCamera);
        }

        this.camera2.position.x = this.camera.position.x;
        this.camera2.position.y = -this.camera.position.y - 1;
        this.camera2.position.z = this.camera.position.z;
        this.camera2.lookAt(this.targetCamera);

        this.scene.position.x = Math.cos(this.tick) * 0.05;
        this.scene.position.y = Math.sin(this.tick) * 0.1;
    }
    render()
    {
        this.raf = raf(this.render.bind(this));
        this.tick += 0.01;

        this.update();

        this.water.visible = false;
        this.renderer.render(this.scene, this.camera2, this.renderTarget, true);
        this.water.visible = true;

        if (SuperConfig.config.postPro)
        {
            this.postPro.render();
        }
        else
        {
            this.renderer.render(this.scene, this.camera);
        }
    }
    bloomScene()
    {
        this.recursiveChildren(this.scene.children, 'bloom');
    }
    unbloomScene()
    {
        this.recursiveChildren(this.scene.children, 'unBloom');
    }
    recursiveChildren(children, method)
    {
        for (let i = 0; i < children.length; i++)
        {
            const child = children[i];

            if (child.children.length > 0)
            {
                this.recursiveChildren(child.children);
            }
            if (child[method])
            {
                child[method]();
            }
        }
    }

    intro()
    {
        if (!SuperConfig.config.orbitControl)
        {
            TweenLite.to(this.camera.position, 20, {
                z: Const.cameraStartPosition.z,
                ease: Sine.easeInOut,
            });
        }
        this.text.show();
        setTimeout(() =>
        {
            this.playButton.show();
        }, 1200);
    }
    start()
    {
        if (!SuperConfig.config.orbitControl)
        {
            const obj = {
                value: 0,
            };

            TweenLite.to(obj, 20, {
                value: 1,
                ease: Sine.easeInOut,
                onUpdate: () =>
                {
                    const pt = this.curveCamera.getPoint(obj.value);

                    this.camera.offset.x = pt.x;
                    this.camera.offset.y = pt.y;
                    this.camera.offset.z = pt.z;
                },
                onComplete: () =>
                {
                    TweenLite.to(this, 2, {
                        mouseDivisor: 2,
                    });
                    this.particles.repulsion();
                },
            });
        }
        this.playButton.hide();
        this.text.hide();

        this.obelisk.show(() =>
        {
            this.objectsToRayCast.push(this.obelisk.hitArea);
        });
        this.particles.start();
    }
    clickObelisk()
    {
        sono.play('boom');
        TweenLite.to(this.point, 0.5, {
            intensity: 5,
        });
        TweenLite.to(this.point, 0.5, {
            intensity: 3,
            delay: 0.5,
        });
        this.particles.clickObelisk();
        this.clickObeliskCount++;
        if (this.clickObeliskCount > 8)
        {
            this.merry.show();
            this.xmas.show();
        }
    }
    konami()
    {
        const lol = new Lol();

        this.scene.add(lol);
    }

    resize()
    {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera.aspect = this.width / this.height;
        this.camera2.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.camera2.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height, false);
    }
}
