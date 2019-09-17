const cameraEl = document.getElementById('camera');
const canvasEl = document.getElementById('canvas');
const tracker = new clm.tracker();

let centroid, faceWidth, faceHeight;

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
    let img = document.getElementById("putin");


    if (p) {
        centroid = getTriCentroid(p[19], p[7], p[15]);
        //console.log('centroid at: ', centroid);

        faceWidth = getDist(p[1][0], p[1][1], p[13][0], p[13][1]); //smaller number = smaller object = larger distance
        faceHeight = getDist(p[33][0], p[17][1], p[7][0], p[7][1]);
        console.log('hypo: ', Math.hypot(p[33][0], p[17][1], p[7][0], p[7][1]));
        console.log('getdist: ', faceHeight);

        faceHeight += 50; //fix image height

        //console.log(p[19] + "\n" + p[7] + "\n" + p[15]);


        // Optional visual feedback of tracker
        c.drawImage(cameraEl, 0, 0);
        // tracker.draw(canvasEl);

        //draw putin
        c.drawImage(img,
            centroid[0] - faceWidth / 2,
            centroid[1] - faceHeight / 2,
            faceWidth, faceHeight);


        //display the centroid representing the center of the face
        // c.fillStyle = "#ff0000";
        // c.fillRect(centroid[0], centroid[0], 10, 10);

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

    return [xCent, yCent];
}

function getDist(x1, y1, x2, y2) {
    let a = x1 - x2;
    let b = y1 - y2;

    let c = Math.sqrt(a * a + b * b);
    return c;
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