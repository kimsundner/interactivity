import MojsCurveEditor from '@mojs/curve-editor';
import Mojs from 'mo-js';
let path = require("svg-path-properties");


let leadProperties = path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");
let followProperties = path.svgPathProperties("M0,100 Q50,-50 100,100 T200,100");

const CMD_WRITE = 0;
const CMD_WRITE_US = 1;
const CMD_READ = 2;
const CMD_DETACH = 3;

let socket = null;

let fullXArr;
let fullYArr;

const timerEnd = 5000;

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
// Set up event handlers and websocket
init();


function onPointerMove(evt) {
    console.dir(evt);
    // var speed = document.getElementById('inputContinuousSpeed').value;
    // var duration = document.getElementById('inputContinuousDuration').value;

    // setStatus(`Rotating at speed: ${speed}, duration: ${duration}`);
    // write(0, speed, duration);
    let x = evt.offsetX;
    let y = evt.offsetY;

    // Get 0..1
    let relativeX = x / evt.target.offsetWidth;
    let relativeY = y / evt.target.offsetHeight;

    if (relativeX < 0) relativeX = 0;
    if (relativeX > 1) relativeX = 1;

    // console.log('pure X coordinate: ', x);

    // console.log('X is devided by the offsetWidht: ', evt.target.offsetWidth);

    // console.log('Which is: ', relativeX);

    // console.log('which multiplied with 180 is: ', 180 * relativeX);

    write(0, 180 * relativeX, 0);
}

function onPointerLeave(evt) {
    detach(0);
}

// --- Servo control
// Sends command to bridge (which forwards to Arduino)
function write(servo, position, durationMs) {
    if (position < 0) throw new Error('Must be greater than zero');
    if (position > 180) throw new Error('Must be equal or less than 180');

    // console.log('Write ' + servo + ' = ' + position);
    socket.send(JSON.stringify({
        cmd: CMD_WRITE,
        servo: servo,
        opt: durationMs,
        pos: position
    }));
}

function detach(servo) {
    // console.log('Detach ' + servo);
    socket.send(JSON.stringify({
        cmd: CMD_DETACH,
        servo: servo,
        pos: 0
    }));
}
// ---- End Servo control

function writeMicroseconds(servo, us) {
    if (us < 0) throw new Error('Must be greater than zero');

    // console.log('Write uS: ' + us);
    socket.send(JSON.stringify({
        cmd: CMD_WRITE_US,
        servo: servo,
        pos: us
    }));
}


function init() {
    // Emergency stop
    document.body.addEventListener('click', () => {
        detach(0);
    });

    // document.getElementById('thing').addEventListener('pointermove', onPointerMove);
    // timer();
    // document.getElementById('thing').addEventListener('pointerleave', onPointerLeave);

    sendCurve();

    socket = new ReconnectingWebsocket('ws://' + location.host + '/serial');
    socket.addEventListener('message', evt => {
        // console.log(evt.data);
    });

    socket.addEventListener('open', () => {
        console.log('Connected to json-serial-bridge 👍');
        detach(0);
    });

    setTimeout(() => {
        initCurves();
    }, 250);
}


function timer() {
    let origin = 0;
    
    let relativeTime;
    
    let seconds = 1000;

    setInterval(() => {

        // chaning between subtracting seconds and adding seconds
        if (relativeTime >= 1) seconds = -1000;
        if (relativeTime <= 0) seconds = 1000;
        
        //get a number between 0 -> 1
        relativeTime = origin / timerEnd;
        
        
        // clamp som that they never go beyon 0 and 1
        if (relativeTime > 1) relativeTime = 1;
        if (relativeTime < 0) relativeTime = 0;
        
        console.log('timer: ', relativeTime);
        
        //add or subtract seconds from earlier
        origin += seconds;
        
        //send to arduiono 0 -> 90
        write(0, 90 * relativeTime, 0);
        console.log('speed: ', 180 * relativeTime);
    }, 1000);
}

// Svg-path... commands:
// var length = properties.getTotalLength();
// var point = properties.getPointAtLength(200);
// var tangent = properties.getTangentAtLength(200);
// var allProperties = properties.getPropertiesAtLength(200);
// var parts = properties.getParts(); 


function sendCurve(){
    let i = 0;
    let direction = 1;
    let relativePos;
    let rotSpeed;
    const speed = 10;
    const maxSpeed = 90;
    const minSpeed = 0;

    setInterval(() => {
        if(fullYArr){
            relativePos = i / fullYArr.length;
            
            if(relativePos >= 1) direction = -1;
            if(relativePos <= 0) direction = 1;
            
            rotSpeed = maxSpeed * relativePos;

            if (rotSpeed >= maxSpeed) rotSpeed = maxSpeed;
            if (rotSpeed <= minSpeed) rotSpeed = minSpeed;

            console.log(rotSpeed);

            write(0, rotSpeed, 0);
            
            i = i + ((1*direction) * speed);
        }else console.warn('no points');
    }, 1000);
    
}



function initCurves() {
    if (lead._prevPath && follow._prevPath) console.log('Path detected: ' + lead._prevPath +',\n'+
                                                        'and: ' + follow._prevPath);
    else console.log('Path was not collected');

    console.log(lead);

    let leadXPoints = [];
    let leadYPoints = [];

    let followXPoints = [];
    let followYPoints = [];

    fullXArr = [];
    fullYArr = [];

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
        // console.log('length of xPoints: ', fullXArr.length);
        console.log('length of yPoints: ', fullYArr.length);

        // for (let i = 0; i < fullXArr.length; i++) {
        //     console.log(i + ' : ' + fullXArr[i] + ' : ' + fullYArr[i]);
        // }

    } else console.log('missing data');
}