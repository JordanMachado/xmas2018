import style from 'styles/main.scss';
import SuperConfig from 'utils/SuperConfig';
import domready from 'domready';
import gsap from 'gsap';
import assetsLoader from 'assets-loader';
import manifest from './manifest';
import Webgl from './Webgl';
import sono from 'sono';

const alertFallback = false;

if (typeof console === 'undefined' || typeof console.log === 'undefined')
{
    console = {};
    if (alertFallback)
    {
        console.log = function (msg)
        {
            // alert(msg);
        };
    }
    else
    {
        console.log = function () { };
    }
}

const loader = assetsLoader({
    assets: [].concat(manifest),
});

window.getAsset = (id) =>
    loader.get(id);

domready(() =>
{
    console.log('%c Merry Christmas! ', 'background: #e42727; color: #ffffff;font-weight: bold');
    console.log('%c Made by Jordan Machado & Julien Suard ', 'background: #e42727; color: #ffffff;font-weight: bold');
    console.log('%c window.fun() ', 'background: #e42727; color: #ffffff;font-weight: bold');

    window.fun = () =>
    {
        console.log('%c Clue ↑ ↑ ↓ ↓ ← ....', 'background: #e42727; color: #ffffff;font-weight: bold');
    };
    const labelLoader = document.querySelector('.label');

    loader.on('error', (error) =>
    {
        console.error(error);
    })
        .on('progress', (progress) =>
        {
            labelLoader.innerHTML = `${(progress * 100).toFixed()}%`;
        })
        .on('complete', (assets) =>
        {
            window.assets = assets;
            document.body.classList.remove('loading');

            init();
        });

    if (manifest.length > 0)
    {
        loader.start();
    }
    else
    {
        init();
    }
});
let scene;

function init()
{
    const sound = sono.create({
        src: ['assets/ambiance.mp3', 'assets/ambiance.ogg'],
        loop: true,
        volume: 0.5 });

    sono.create({
        id: 'boom',
        url: ['assets/click.mp3', 'assets/click.ogg'],
        volume: 0.5,
    });

    sound.play();

    scene = new Webgl();

    const loaderScreen = document.querySelector('.loaderScreen');

    TweenLite.to(loaderScreen, 0.5, {
        autoAlpha: 0,
    });
    if (!SuperConfig.config.start && !SuperConfig.config.end)
    {
        scene.intro();
    }

    document.body.appendChild(scene.renderer.domElement);

    scene.render();

    window.addEventListener('resize', () =>
    {
        scene.resize();
    });

    window.addEventListener('mousemove', (e) =>
    {
        scene.mouseMove(e.clientX, e.clientY);
    });
    window.addEventListener('click', (e) =>
    {
        scene.click(e.clientX, e.clientY);
    });
}
