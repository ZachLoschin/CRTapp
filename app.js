function main() {
    const video = document.getElementById('video');  // links video to video object in html
    const button = document.getElementById('button');  // links button to button object in html for starting camera
    const select = document.getElementById('select');  // links select menu to select object in html for selecting which camera to use
    const button_capture_still = document.getElementById("Capture_Still");  // Button for capturing still image of the current stream
    const still_canvas = document.getElementById("Still_Canvas");
    let currentStream;
    
    // Stops current source of stream
    function stopMediaTracks(stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }

    // Gets average RGB data from an RGBA array
    function GetAverageRGB(imgArray) {
      // Set all obacity values to -1
      // for(i=imgArray.length; i>0; i-=1) {
      //   if(i % 4 === 3) {
      //     imgArray[i] = -1;
      //   }
      // }

      // // Remove all -1 indices
      // for(i=0; i<imgArray.length; i+=1) {
      //   if(imgArray[i] === -1) {
      //     imgArray.splice(i, 1);
      //   }
      // }

      // Take the average of the now RGB array
      const average = imgArray.reduce((a, b) => a + b, 0) / imgArray.length;
      console.log(imgArray);

    };
    
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


    var still_context = still_canvas.getContext("2d");

    button_capture_still.addEventListener("click", event => {
      if(typeof currentStream !== "undefined") {
        still_context.drawImage(video, 0, 0);
        var still_data = still_context.getImageData(0, 0, 640, 480).data;
        GetAverageRGB(still_data);

      }
    })
}