// // Define global variables 

// let VIDEO=null;
// let CANVAS=null;
// let CONTEXT=null;

// function main() {

//     // Define canvas with myCanvas which is defined in the HTML
//     CANVAS = document.getElementById("myCanvas");
//     CONTEXT = CANVAS.getContext("2d");

//     // Create the canvas size
//     CANVAS.width=window.innerWidth;
//     CANVAS.height=window.innerHeight;

//     // Ask for access to video device
//     let promise=navigator.mediaDevices.getUserMedia({video:true});
    
//     // After getting acces to video device
//     promise.then(function(signal){
//         const devices = navigator.mediaDevices.enumerateDevices()
//         console.log(devices);

//         // Attach the video element to the VIDEO and give it the signal
//         VIDEO=document.createElement("video");
//         //VIDEO.setAttribute("playsinline", true); // Maybe not needed
//         VIDEO.srcObject=signal;
//         VIDEO.play();

//         // When video data is available, update it on the canvas
//         VIDEO.onloadeddata = function() {
//             updateCanvas();
//         }

//     }).catch(function(err){
//         alert("Camera error; "+err)
//     })
// }

// // Function to update the canvas
// function updateCanvas() {
//     // Draws the image to the canvas starting at coord(0,0) aka the topleft
//     CONTEXT.drawImage(VIDEO,0,0);

//     window.requestAnimationFrame(updateCanvas);
// }

function main() {
    const video = document.getElementById('video');
    const button = document.getElementById('button');
    const select = document.getElementById('select');
    let currentStream;
    
    // Stops current source of stream
    function stopMediaTracks(stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    // Function to detect video devices and add them to the select node
    function gotDevices(mediaDevices) {
      select.innerHTML = '';
      select.appendChild(document.createElement('option'));  // adds option to select
      let count = 1;  // For making device labels

      // Goes through each media device
      mediaDevices.forEach(mediaDevice => {
        // Sorts by type videoinput
        if (mediaDevice.kind === 'videoinput') {
          const option = document.createElement('option');  // Creates new option for the mediaDevice
          option.value = mediaDevice.deviceId;  // Sets the option value to the device ID
          const label = mediaDevice.label || `Camera ${count++}`;  // Creates label of the mediaDevice prebuilt label, or calls it device #_
          const textNode = document.createTextNode(label);  // Creates a text node using the label
          option.appendChild(textNode);  // Adds the textNode to the option
          select.appendChild(option);  // Adds the option to the select object
        }
      });
    }
    
    button.addEventListener('click', event => {
        // If currentStream is defined, stop the currentStream
      if (typeof currentStream !== 'undefined') {
        stopMediaTracks(currentStream);
      }
      
      // Initialize videoConstraints holder
      const videoConstraints = {};

      // If the select value is empty, just set facing mode to environment as default, but not exact!
      if (select.value === '') {
        videoConstraints.facingMode = 'environment';
      } else {  // If the select value exists, set the video constraint to the device ID exactly
        videoConstraints.deviceId = { exact: select.value };
      }

      // Create the constraints to pass to getUserMedia function using above defined video constraints
      const constraints = {
        video: videoConstraints,
        audio: false
      };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {  // sets the currentStream var to the stream of mediaDevice
          currentStream = stream;
          video.srcObject = stream;
          return navigator.mediaDevices.enumerateDevices();
        })
        // Displays error msg if error raised
        .then(gotDevices)
        .catch(error => {
          console.error(error);
        });
    });
    
    navigator.mediaDevices.enumerateDevices().then(gotDevices);
}