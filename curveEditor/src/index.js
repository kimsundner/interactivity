import MojsCurveEditor from '@mojs/curve-editor';
import Mojs from 'mo-js';
import ParseSVG from 'svg-path-parser';
import { toPoints } from 'svg-points';
let path = require("svg-path-properties");


let leadProperties = path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");
let followProperties = path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");

// var length = properties.getTotalLength();
// var point = properties.getPointAtLength(200);
// var tangent = properties.getTangentAtLength(200);
// var allProperties = properties.getPropertiesAtLength(200);
// var parts = properties.getParts(); 

const lead = new MojsCurveEditor({
    name: 'lead',
    isSaveState: true,
    onChange: function (path) {},
    startPath: 'M0, 100 L100, 0'
});

const follow = new MojsCurveEditor({
    name: 'follow',
    isSaveState: true,
    onChange: function (path) {},
    startPath: 'M0, 0 L100, 100'
});


setTimeout(() => {
    init();
}, 250);

function init() {
    if (lead._prevPath && follow._prevPath) console.log('Path detected: ' + lead._prevPath +',\n'+
                                                        'and: ' + follow._prevPath);
    else console.log('Path was not collected');

    console.log(lead);

    let leadXPoints = [];
    let leadYPoints = [];

    let followXPoints = [];
    let followYPoints = [];

    let fullXArr = [];
    let fullYArr = [];

    leadProperties = path.svgPathProperties(lead._prevPath);
    followProperties = path.svgPathProperties(lead._prevPath);

    let leadLength = leadProperties.getTotalLength();
    let followLength = leadProperties.getTotalLength();

    for (let i = 0; i < leadLength; i++) { 
        if (!leadXPoints.includes(Math.round(leadProperties.getPointAtLength(i).x))) {
            leadXPoints.push(Math.round(leadProperties.getPointAtLength(i).x));
            leadYPoints.push(Math.round(leadProperties.getPointAtLength(i).y));
        }
    }
    console.log('\n\n\n');
    for (let i = 100; i < followLength + 100; i++) {
        if (!followXPoints.includes(Math.round(followProperties.getPointAtLength(i).x))) {
            followXPoints.push(Math.round(followProperties.getPointAtLength(i).x));
            followYPoints.push(Math.round(followProperties.getPointAtLength(i).y));
        }
    }

    fullXArr = leadXPoints.concat(leadXPoints);
    fullYArr = leadYPoints.concat(leadYPoints);
    
    if (fullXArr) {
        console.log('length of xPoints: ', fullXArr.length);
        console.log('length of yPoints: ', fullYArr.length);

        for (let i = 0; i < fullXArr.length; i++) {
            console.log(i + ' : ' + fullXArr[i] + ' : ' + fullYArr[i]);
        }

    } else console.log('missing data');
}