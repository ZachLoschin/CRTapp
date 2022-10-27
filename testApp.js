function main() {
    const video = document.getElementById('video');  // links video to video object in html
    const button = document.getElementById('button');  // links button to button object in html for starting camera
    const select = document.getElementById('select');  // links select menu to select object in html for selecting which camera to use
    const button_capture_still = document.getElementById("Capture_Still");  // Button for capturing still image of the current stream
    const button_get_curve = document.getElementById("Get_Curve");
    const still_canvas = document.getElementById("Still_Canvas");
    const diff_canvas = document.getElementById("Diff_Canvas");
    instruction_label = document.getElementById("Instructions");

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
    return RGB_average;

  };


  // Function to draw still image to canvas
  function drawStill() {
    if(typeof currentStream !== "undefined") {
      // still_context.drawImage(video, 0, 0);
      detect_motion();
    }
  }

// Manual function to subtract arrays and average
function manualDifference(imgA, imgB) {

    // Subtract elementwise the two arrays
    var imgC = imgA.map((n, i) => n - imgB[i]);

    // Take average of array
    var ave = GetAverageRGB(imgC) + 85;

    return ave;
  }

  async function getCurve() {
    // For 15 (150 pictures at 10 Hz sampling) seconds take pictures and get their RGB values
    still_context = still_canvas.getContext("2d");
    let count = 0;
    let curve = [];

    // Start instructions
    instruction_label.innerHTML = "Hold camera still above patients finger";
    await new Promise(r => setTimeout(r, 2000));
    instruction_label.innerHTML = "Hold camera stably above in 3..";
    await new Promise(r => setTimeout(r, 1000));
    instruction_label.innerHTML = "2..";
    await new Promise(r => setTimeout(r, 1000));
    instruction_label.innerHTML = "1..";
    await new Promise(r => setTimeout(r, 1000));

    instruction_label.innerHTML = "Hold above patients finger for 5 seconds.";


    while(count <= 150){
        if(count === 20){
            console.log("ENTERRRRREEEEEDDDD");
            instruction_label.innerHtml = "Press into patients finger in 3..";
        }

        if(count === 30){
            instruction_label.innerHtml = "Press into patients finger in 2..";
        }

        if(count === 40){
            instruction_label.innerHtml = "Press into patients finger in 1..";
        }
        if(count === 50){
            instruction_label.innerHtml = "Press!";
        }
        if(count === 70){
            instruction_label.innerHtml = "Hover above finger in 3..";
        }
        if(count === 80){
            instruction_label.innerHtml = "Hover above finger in 2..";
        }
        if(count === 90){
            instruction_label.innerHtml = "Hover above finger in 1..";
        }
        if(count === 100){
            instruction_label.innerHtml = "Hover!";
        }
        if(count === 120){
            instruction_label.innerHtml = "Test completing in 3..";
        }
        if(count === 130){
            instruction_label.innerHtml = "Test completing in 2..";
        }
        if(count === 140){
            instruction_label.innerHtml = "Test completing in 1..";
        }
        
      // Get image
      still_context.drawImage(video, 0, 0);

      // Get average RGB
      let ave = GetAverageRGB(still_context.getImageData(0, 0, 640, 480).data)

      // Append to array
      curve.push(ave);

      console.log(count);
      console.log(ave);
      // Await 1/10 of a second
      
      await new Promise(r => setTimeout(r, 100));

      count+=1;
      
      if(count === 150){
        instruction_label.innerHtml = "Test complete!";
    }

    }

    // Low pass filter
    lpCurve = movingAverage(curve);

    console.log(curve);
    console.log("\n");
    console.log(lpCurve);

    // Plotting raw
    var toPlot = {
      x: count,
      y: curve,
      type: 'scatter'
    };

    var data = [toPlot];
  
  Plotly.newPlot('myDiv', data);

  // Plotting low pass filtered
  var toPlot2 = {
    x: count,
    y: lpCurve,
    type: 'scatter'
  };

var lpData= [toPlot2];

Plotly.newPlot('myDiv2', lpData);

    return curve;
  }

  
  // Moving average filter function
  function movingAverage(a){
    let moving_avg = new Array(a.length);

    for(i = 0; i < 2; i++){
      moving_avg[i] = a[i];
    }

    for(i = 2; i < a.length; i++){
      moving_avg[i] = (a[i] + a[i-1] + a[i-2]) / 3;
    }

    return moving_avg;
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

  var still_context = still_canvas.getContext("2d");

  button_get_curve.addEventListener("click", event => {
    getCurve();
  })


} // End main