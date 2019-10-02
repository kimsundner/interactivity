import MojsCurveEditor from '@mojs/curve-editor';
import Mojs from 'mo-js';
import ParseSVG from 'svg-path-parser';
import { toPoints } from 'svg-points';
var path = require("svg-path-properties");


var properties = path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");

// var length = properties.getTotalLength();
// var point = properties.getPointAtLength(200);
// var tangent = properties.getTangentAtLength(200);
// var allProperties = properties.getPropertiesAtLength(200);
// var parts = properties.getParts(); 

const mojsCurve = new MojsCurveEditor({
    name: 'bounce curve'
});


setTimeout(() => {
    init();
}, 250);

function init() {
    if (mojsCurve._prevPath) console.log('Path detected', mojsCurve._prevPath);
    else console.log('Path was not collected');

    let xPoints = [];
    let yPoints = [];

    properties = path.svgPathProperties(mojsCurve._prevPath);

    let cOneLength = properties.getTotalLength();

    for (let i = 0; i < cOneLength; i++) {
        if (!xPoints.includes(Math.round(properties.getPointAtLength(i).x))) {
            xPoints.push(Math.round(properties.getPointAtLength(i).x));
            yPoints.push(Math.round(properties.getPointAtLength(i).y));
        }
    }
    if (xPoints) {
        console.log('length of xPoints: ', xPoints.length);
        console.log('length of yPoints: ', yPoints.length);

        for (let i = 0; i < xPoints.length; i++) {
            console.log(xPoints[i] + ' : ' + yPoints[i]);
        }

    } else console.log('missing data');
}