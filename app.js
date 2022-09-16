// Define global variables 

let VIDEO=null;
let CANVAS=null;
let CONTEXT=null;

function main() {
    // Define constraints for looking for media device
    const constraints = {
        video: {
            facingMode: "environment"
        }
    }

    // Define canvas with myCanvas which is defined in the HTML
    CANVAS = document.getElementById("myCanvas");
    CONTEXT = CANVAS.getContext("2d");

    // Create the canvas size
    CANVAS.width=window.innerWidth;
    CANVAS.height=window.innerHeight;

    // Ask for access to video device
    let promise=navigator.mediaDevices.getUserMedia(constraints);

    // After getting acces to video device
    promise.then(function(signal){
        // Attach the video element to the VIDEO and give it the signal
        VIDEO=document.createElement("video");
        //VIDEO.setAttribute("playsinline", true);
        VIDEO.srcObject=signal;
        VIDEO.play();

        // When video data is available, update it on the canvas
        VIDEO.onloadeddata = function() {
            updateCanvas();
        }

    }).catch(function(err){
        alert("Camera error; "+err)
    })
}

// Function to update the canvas
function updateCanvas() {
    // Draws the image to the canvas starting at coord(0,0) aka the topleft
    CONTEXT.drawImage(VIDEO,0,0);

    window.requestAnimationFrame(updateCanvas);
}