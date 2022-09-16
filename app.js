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
    
    function stopMediaTracks(stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    
    function gotDevices(mediaDevices) {
      select.innerHTML = '';
      select.appendChild(document.createElement('option'));
      let count = 1;
      mediaDevices.forEach(mediaDevice => {
        if (mediaDevice.kind === 'videoinput') {
          const option = document.createElement('option');
          option.value = mediaDevice.deviceId;
          const label = mediaDevice.label || `Camera ${count++}`;
          const textNode = document.createTextNode(label);
          option.appendChild(textNode);
          select.appendChild(option);
        }
      });
    }
    
    button.addEventListener('click', event => {
      if (typeof currentStream !== 'undefined') {
        stopMediaTracks(currentStream);
      }
      const videoConstraints = {};
      if (select.value === '') {
        videoConstraints.facingMode = 'environment';
      } else {
        videoConstraints.deviceId = { exact: select.value };
      }
      const constraints = {
        video: videoConstraints,
        audio: false
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          currentStream = stream;
          video.srcObject = stream;
          return navigator.mediaDevices.enumerateDevices();
        })
        .then(gotDevices)
        .catch(error => {
          console.error(error);
        });
    });
    
    navigator.mediaDevices.enumerateDevices().then(gotDevices);
}