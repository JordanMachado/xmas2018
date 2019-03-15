import deviceType from 'ua-device-type';

const device = deviceType(navigator.userAgent);

const config = {
    name: 'XMAS',
    orbitControl: false,
    camMove: true,
    postPro: true,
    start: false,
    end: false,
    ambientParticles: {
        sizeMin: {
            value: 0.02,
            min: 0.01,
            max: 0.1,
        },
        sizeMax: {
            value: 0.02,
            min: 0.01,
            max: 0.1,
        },
    },
    fog: {
        color: '#7facd9',
        density: {
            value: 0.03,
            min: 0.01,
            max: 0.1,
        },
    },

    c: {
        value: 0.36,
        min: 0.1,
        max: 1,
    },
    p: {
        value: 1.4,
        min: 0.1,
        max: 5,
    },

};
//

export default config;
