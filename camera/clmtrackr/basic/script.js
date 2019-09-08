const cameraEl = document.getElementById('camera');
const canvasEl = document.getElementById('canvas');
const tracker = new clm.tracker();

let centroid;

startCamera();

cameraEl.addEventListener('play', () => {
    // Resize everything to match the actual
    // video frame size
    canvasEl.width = cameraEl.videoWidth;
    canvasEl.height = cameraEl.videoWidth;
    cameraEl.width = cameraEl.videoWidth;
    cameraEl.height = cameraEl.videoHeight;

    tracker.init();
    tracker.start(cameraEl);
    window.requestAnimationFrame(renderFrame);
});

function renderFrame() {
    var c = canvasEl.getContext('2d');
    var p = tracker.getCurrentPosition();


    if (p) {
        centroid = getTriCentroid(p[19], p[7], p[15]);
        console.log(p[19] + "\n" + p[7] + "\n" + p[15]);
        console.log('centroid at: ', centroid);
        // Optional visual feedback of tracker
        c.translate(0, 0);
        c.scale(-1, 1);
        c.drawImage(cameraEl, 0, 0);
        tracker.draw(canvasEl);

        //display the centroid representing the center of the face
        c.fillStyle = "#ff0000";
        c.fillRect(centroid[0], centroid[1], 10, 10);

        // c.fillStyle = "black";
        // c.fillRect(p[19][0], p[19][1], 10, 10);
        // c.fillRect(p[15][0], p[15][1], 10, 10);
        // c.fillRect(p[7][0], p[7][1], 10, 10);
    }

    // Repeat!
    window.requestAnimationFrame(renderFrame);
}

//get a center-point of a face throuh a simple calculation
function getTriCentroid(x, y, z) {
    xCent = (x[0] + y[0] + z[0]) / 3;
    yCent = (x[1] + y[1] + z[1]) / 3;

    return new Array(xCent, yCent);
}



// ------------------------

// Reports outcome of trying to get the camera ready
function cameraReady(err) {
    if (err) {
        console.log("Camera not ready: " + err);
        return;
    }
}

// Tries to get the camera ready, and begins streaming video to the cameraEl element.
function startCamera() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    if (!navigator.getUserMedia) {
        cameraReady("getUserMedia not supported");
        return;
    }
    navigator.getUserMedia({ video: true },
        (stream) => {
            cameraEl.srcObject = stream;
            //DEPRECATED in chrome
            // video.play();
            // cameraEl.src = window.URL.createObjectURL(stream);
            cameraReady();
        },
        (error) => {
            cameraNotReady(error);
        }
    );
}