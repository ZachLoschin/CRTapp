function main() {
  const video = document.getElementById('video');  // links video to video object in html
  const button = document.getElementById('button');  // links button to button object in html for starting camera
  const select = document.getElementById('select');  // links select menu to select object in html for selecting which camera to use
  const button_capture_still = document.getElementById("Capture_Still");  // Button for capturing still image of the current stream
  const button_get_curve = document.getElementById("Get_Curve");
  const still_canvas = document.getElementById("Still_Canvas");
  const diff_canvas = document.getElementById("Diff_Canvas");
  instruction_label = document.getElementById("Instructions");
  raw_array_box = document.getElementById("rawArray");
  time_array_box = document.getElementById("timeArray");

  raw_array_box.value = new Date;

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

async function getCurveAbsolute() {
  // For 15 (150 pictures at 10 Hz sampling) seconds take pictures and get their RGB values
  still_context = still_canvas.getContext("2d");
  let count = 0;
  let curve = [];
  let timeArray = [];

  // Start instructions
  instruction_label.innerHTML = "Hold camera still above patients finger";
  await new Promise(r => setTimeout(r, 2000));
  instruction_label.innerHTML = "Press into finger in 3..";
  await new Promise(r => setTimeout(r, 1000));
  instruction_label.innerHTML = "2..";
  await new Promise(r => setTimeout(r, 1000));
  instruction_label.innerHTML = "1..";
  await new Promise(r => setTimeout(r, 1000));

  instruction_label.innerHTML = "Press into patient finger for 5 seconds!";
  await new Promise(r=> setTimeout(r, 5000));

  instruction_label.innerHTML = "Release in one second";
  await new Promise(r=> setTimeout(r, 10));

  let timeInit = Date.now()
  let timeCurrent = Date.now()

  while(timeCurrent - timeInit < 7000) {
    // Get current time
    timeCurrent = Date.now()
    
    // Get image
    still_context.drawImage(video, 0, 0);

    // Get average RGB
    let ave = GetAverageRGB(still_context.getImageData(0, 0, 640, 480).data)
    instruction_label.innerHTML = ave;
    await new Promise(r=> setTimeout(r, 75));

    // Append to array
    curve.push(ave);
    timeArray.push(timeCurrent-timeInit);

    console.log(ave);

  }

  instruction_label.innerHTML = "Test Complete!";

  // Plotting raw
  var toPlot = {
    x: timeArray,
    y: curve,
    type: 'scatter'
  };

  var data = [toPlot];

Plotly.newPlot('myDiv', data);

console.log(curve);
console.log(timeArray);

// Take derivative
let derivativeCurve = derivative(curve);

// Gary CRT
CRT = garyCRT(derivativeCurve, timeArray);

raw_array_box.value = curve;
time_array_box.value = timeArray;

}

// Moving average filter function
function movingAverage(a){
  let moving_avg = new Array(a.length);

  for(i = 0; i < 4; i++){
    moving_avg[i] = a[i];
  }

  for(i = 4; i < a.length; i++){
    moving_avg[i] = (a[i] + a[i-1] + a[i-2] + a[i-3] + a[i-4]) / 5;
  }

  return moving_avg;
}

function derivative(inpArray) {
  let derArray = new Array(inpArray.length);

  for(let i = 0; i<inpArray.length-1; i++) {
    derArray[i] = inpArray[i+1] - inpArray[i]  // Slope calculation, Y2-Y1 = 1 in all cases
  }

  return derArray;

}


  function garyCRT(deri, time) {
    // Slice the derivative array during the refill time zone
    let detectionZone = deri.slice(50,-1);

    // Detect the peak point (aka the minimum of of the array)
    let min = Math.min.apply(null, detectionZone);
    
    // Set threshold of 0.05 * min value
    let threshold = 0.05 * min;

    // Storage variables
    let start = -1;
    let end = -1;

    // Find 5% value at front and end
    for(let i=0; i<detectionZone.length; i++) {
      if(detectionZone[i] <= threshold && start === -1) {
        start = i;
      }
    }

    for(let i=start; i<detectionZone.length; i++) {
      if(detectionZone[i] >= threshold && end === -1) {
        end = i;
      }
    }

    return [start, end];
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
  getCurveAbsolute();
})


} // End main