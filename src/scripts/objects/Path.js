import * as THREE from 'three';
export default class Path
{
    constructor(curve)
    {
        this.width = 48;
        this.height = 48;

        const points = curve.getPoints(this.width * this.height);

        this.points = points;

        let count = 0;

        const data = new Float32Array(this.width * this.height * 3);

        for (let i = 0, l = this.width * this.height * 3; i < l; i += 3)
        {
            const point = this.points[count];

            if (point)
            {
                data[i] = point.x;
                data[i + 1] = point.y;
                data[i + 2] = point.z;
                // console.log(point.z);
            }

            count++;
        }
        this.length = this.width;
        this.textureData = new THREE.DataTexture(data, this.width, this.height, THREE.RGBFormat, THREE.FloatType);
        // this.textureData.minFilter = THREE.NearestFilter;
        // this.textureData.magFilter = THREE.NearestFilter;
        this.textureData.needsUpdate = true;
    }
}
