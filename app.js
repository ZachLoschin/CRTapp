function main() {
    const video = document.getElementById('video');  // links video to video object in html
    const button = document.getElementById('button');  // links button to button object in html for starting camera
    const select = document.getElementById('select');  // links select menu to select object in html for selecting which camera to use
    const button_capture_still = document.getElementById("Capture_Still");  // Button for capturing still image of the current stream
    const still_canvas = document.getElementById("Still_Canvas");
    const callibration_button = document.getElementById("Callibration_Button");
    rgb_label = document.getElementById("RGB Val");
    rgb_cali_min = document.getElementById("RGB Calbiration Minimum");
    rgb_cali_max = document.getElementById("RGB Calibration Maximum");
    let currentStream;
    
    // Stops current source of stream
    function stopMediaTracks(stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }

    // Gets average RGB data from an RGBA array
    function GetAverageRGB(imgArray) {
      // Take the average of the now RGB array
      const RGBA_average = imgArray.reduce((a, b) => a + b, 0) / imgArray.length;
      const RGB_average = ((RGBA_average * imgArray.length) - (255*imgArray.length / 4)) / (imgArray.length-(imgArray.length/4));
      rgb_label.innerHTML = RGB_average;
      return RGB_average;

    };

    // Callibration funciton
    async function callibrate() {
      console.log("Callibrating...")
      var ave_array = [];
      var count = 0;

      while(count < 35){
      // Get camera feed every 1/8 second
      if(typeof currentStream !== "undefined") {
        still_context.drawImage(video, 0, 0);
        var still_data = still_context.getImageData(0, 0, 640, 480).data;
      } else {
        break;
      }

      // Calculate average RGB value in canvas
      var ave = GetAverageRGB(still_data);

      // Store average in an array
      ave_array.push(ave);

      console.log("Ave stored...");
      // Wait 1/8 s
      await new Promise(r => setTimeout(r, 125));
      count+=1;
      }

      // Store largest and smallest values in the ave array
      let minElement = ave_array[0];
      for(let i = 1; i < 35; i++){
        if(ave_array[i] < minElement){
          minElement = ave_array[i];
        }
      }

      let maxElement = ave_array[0];
      for(let i = 1; i < 35; i++){
        if(ave_array[i] > maxElement){
          maxElement = ave_array[i];
        }
      }

      rgb_cali_min.innerHTML = minElement;
      rgb_cali_max.innerHTML = maxElement;
      console.log(minElement);
      console.log(maxElement);
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
      }
    })

    callibration_button.addEventListener("click", event => {
      callibrate();
    })
}