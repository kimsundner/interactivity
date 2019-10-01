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

function init(){
  if (mojsCurve._prevPath) console.log('Path detected', mojsCurve._prevPath);
  else console.log('Path was not collected');
  
  console.log(mojsCurve);
  properties = path.svgPathProperties(mojsCurve._prevPath);
  let obj = ParseSVG(mojsCurve._prevPath);
  
  console.log('y of 0:',findY(mojsCurve._prevPath, 0));
  let length = properties.getTotalLength();
  console.log(length);

  

  // breaksthe page
  // for(let i = 0; i < length; i++){
  //   if (!findY(mojsCurve._prevPath, i)) console.log(i+' : '+findY(mojsCurve._prevPath, i));
  //   else break;
  // }

  obj.forEach(e => {
    console.log('y: ', Math.floor(e.y));
  });

  console.log(mojsCurve._prevPath);
}


// https://stackoverflow.com/a/47935325
function findY(path, x) {
  var pathLength = properties.getTotalLength();
  var start = 0;
  var end = pathLength;
  var target = (start + end) / 2;

  // Ensure that x is within the range of the path
  x = Math.max(x, properties.getPointAtLength(0).x);
  x = Math.min(x, properties.getPointAtLength(pathLength).x);

  // Walk along the path using binary search 
  // to locate the point with the supplied x value
  while (target >= start && target <= pathLength) {
    var pos = properties.getPointAtLength(target);

    // use a threshold instead of strict equality 
    // to handle javascript floating point precision
    if (Math.abs(pos.x - x) < 0.001) {
      return pos.y;
    } else if (pos.x > x) {
      end = target;
    } else {
      start = target;
    }
    target = (start + end) / 2;
  }
}