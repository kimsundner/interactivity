const CMD_WRITE = 0;
const CMD_WRITE_US = 1;
const CMD_READ = 2;
const CMD_DETACH = 3;

let socket = null;

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
    timer();
    document.getElementById('thing').addEventListener('pointerleave', onPointerLeave);

    socket = new ReconnectingWebsocket('ws://' + location.host + '/serial');
    socket.addEventListener('message', evt => {
        // console.log(evt.data);
    });

    socket.addEventListener('open', () => {
        console.log('Connected to json-serial-bridge 👍');
        detach(0);
    });
}

const timerEnd = 5000;

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