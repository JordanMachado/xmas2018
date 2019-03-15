import * as THREE from 'three';
import SuperConfig from 'utils/SuperConfig';

export default class CurvesMananger
{
    constructor(scene)
    {
        this.scene = scene;
    }
    createBezier(vectors, color)
    {
        for (let i = 0; i < vectors.length; i++)
        {
            const v = vectors[i].clone();
        }

        const curveBezier = new THREE.CubicBezierCurve3(vectors[0], vectors[1], vectors[2], vectors[3]);

        if (SuperConfig.query.debug)
        {
            this.addCurve(curveBezier, color);
        }

        return curveBezier;
    }
    createCurves(vectors, color)
    {
        const curve = this.createBezier(vectors, color);

        const points = [];
        const pts = curve.getPoints(50);

        // push the line and remove the end
        for (let i = 0; i < pts.length - 4; i++)
        {
            points.push(pts[i]);
        }

        let count = 0;
        // correct end of the line

        for (let i = pts.length - 4; i < pts.length; i++)
        {
            points.push(pts[i]);
            count++;
        }
        const spline = new THREE.SplineCurve(points, false, false, 10);

        return curve;
    }
    addCurve(curve, color = 0xff0000)
    {
        const pts = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(pts);
        const material = new THREE.LineBasicMaterial({ color, fog: false, linewidth: 10 });
        const curveObject = new THREE.Line(geometry, material);

        this.scene.add(curveObject);
    }
}
