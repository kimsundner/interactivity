const cameraEl = document.getElementById('camera');
const canvasEl = document.getElementById('canvas');
const resultsEl = document.getElementById('results');

let model = null;
let objects, people;

// where to find flash SWFs, if needed...
// soundManager.url = '/soundmanager2';

soundManager.onready(async function() {
    soundManager.createSound({
        id: 'mySound',
        url: 'sound.mp3'
    });

    //soundManager.setVolume(0);
    soundManager.play('mySound');
});

document.getElementById('btnFreeze').addEventListener('click', evt => {
    if (cameraEl.paused) {
        cameraEl.play();
    } else {
        cameraEl.pause();
    }
});


console.log('Loading coco-ssd model')
cocoSsd.load().then(m => {
    model = m;
    console.log('Model loaded, starting camera');
    startCamera();
});


cameraEl.addEventListener('play', () => {
    // Resize canvas to match camera frame sie
    canvasEl.width = cameraEl.videoWidth;
    canvasEl.height = cameraEl.videoHeight;

    // Start processing!
    window.requestAnimationFrame(process);
});

// Processes the last frame from camera
function process() {
    // Draw frame to canvas
    var c = canvasEl.getContext('2d');
    c.drawImage(cameraEl, 0, 0, cameraEl.videoWidth, cameraEl.videoHeight);

    // Run through model
    model.detect(canvasEl).then(predictions => {
        //console.log('Predictions: ', predictions);

        //Number of objects present
        objects = predictions.length;

        //number of people present + remove pople from object collection
        predictions.forEach(p => {
            if (p.class === 'person') {
                people += 1;
                objects -= 1;
            }
        });


        //people variable & object varieble = amount


        // ...and play it
        soundManager.setVolume(10 * people);

        //Darken screen depending on number of people
        // if there are 10+ people then the screen becomes black
        c.fillStyle = "rgba(0, 255, 0," + (objects / 10) + ")";
        c.fillRect(0, 0, cameraEl.videoWidth, cameraEl.videoHeight);
        // console.log('colour', c.fillStyle);


        //compete with the amount of objects by  adding white transparency to the canvas
        c.fillStyle = "rgba(255, 0, 0," + (people / 10) + ")";
        c.fillRect(0, 0, cameraEl.videoWidth, cameraEl.videoHeight);


        //display debug text
        c.fillStyle = "#ffffff";
        c.fillText("obejcts: " + objects + ", " +
            "people :" + people, 20, 20);
        // As a demo, draw each prediction

        predictions.forEach(p => {
            drawPrediction(p, c);
        });
    });


    // Repeat, if not paused
    if (cameraEl.paused) {
        console.log('Paused processing');
        return;
    }
    window.requestAnimationFrame(process);

    //reset
    people = 0;
}

/**
Prediction consists of:
 class (string)
 score (0..1)
 bbox[x1,y1,x2,y2]
*/
function drawPrediction(prediction, canvasContext) {
    // Get bounding box coordinates
    var [x1, y1, x2, y2] = prediction.bbox;

    // Draw a white and black offset rectangle around the prediction.
    // Two are used so that rectangle appears in dark or light images
    canvasContext.strokeStyle = 'black';
    canvasContext.strokeRect(x1 + 1, y1 + 1, x2 + 1, y2 + 1);
    canvasContext.strokeStyle = 'white';
    canvasContext.strokeRect(x1, y1, x2, y2);

    // Create a debug string showing prediction
    let msg = prediction.class + ' (' + Math.floor(prediction.score * 100) + ')';

    // Measure how long this will be in pixels
    canvasContext.textBaseline = 'top';
    let metrics = canvasContext.measureText(msg);
    let textHeight = 10;

    // Draw rectangle behind text, now we know how wide
    canvasContext.fillStyle = 'rgba(0,0,0,0.5)';
    canvasContext.fillRect(x1, y1 - textHeight - 2,
        metrics.width + 6,
        textHeight + 4);

    // Draw text on top of rect
    canvasContext.fillStyle = 'white';
    canvasContext.fillText(msg, x1 + 2, y1 - textHeight - 1);

}

// ------------------------
// Reports outcome of trying to get the camera ready
function cameraReady(err) {
    if (err) {
        console.log('Camera not ready: ' + err);
        return;
    }
    console.log('Camera ready');
}

// Tries to get the camera ready, and begins streaming video to the cameraEl element.
function startCamera() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (!navigator.getUserMedia) {
        cameraReady('getUserMedia not supported');
        return;
    }
    navigator.getUserMedia({ video: true },
        (stream) => {
            try {
                cameraEl.srcObject = stream;
            } catch (error) {
                cameraEl.srcObject = window.URL.createObjectURL(stream);
            }
            cameraReady();
        },
        (error) => {
            cameraReady(error);
        });
}