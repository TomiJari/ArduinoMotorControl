let port;
let writer;
let mic, fft;
let isConnected = false;
let targetFrequency = 1000; // Frequency to detect in Hz
let threshold = 0.1; // Threshold for the amplitude of the target frequency
let amplitudeHistory = []; // Array to store amplitude history
let smoothingFactor = 5; // Number of frames to average for smoothing
let debounceCount = 0; // Counter for debounce mechanism
let debounceThreshold = 10; // Number of frames amplitude must be above threshold
let currentDirection = 'CW'; // Current direction state, 'CW' or 'CCW'
let motorBusy = false; // Flag to indicate if the motor is currently busy

function setup() {
  createCanvas(400, 400);

  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT();
  fft.setInput(mic);

  let button = createButton('Connect to Arduino');
  button.position(10, 10);
  button.mousePressed(connectToArduino);
}

function draw() {
  background(0);

  let spectrum = fft.analyze();
  let targetIndex = freqToIndex(targetFrequency);
  let amplitude = spectrum[targetIndex];

  amplitudeHistory.push(amplitude);
  if (amplitudeHistory.length > smoothingFactor) {
    amplitudeHistory.shift();
  }

  let smoothedAmplitude = amplitudeHistory.reduce((a, b) => a + b) / amplitudeHistory.length;
  console.log('Smoothed Amplitude of ' + targetFrequency + ' Hz: ' + smoothedAmplitude);

  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text('Smoothed Amplitude of ' + targetFrequency + ' Hz: ' + smoothedAmplitude.toFixed(2), width / 2, height / 2);

  fill(255);
  if (smoothedAmplitude > threshold * 255 && !motorBusy) {
    debounceCount++;
    fill(255, 0, 0);
  } else {
    debounceCount = 0;
  }

  if (debounceCount > debounceThreshold) {
    console.log('Target frequency detected! Sending click!');
    if (writer) {
      motorBusy = true;
      let message = currentDirection === 'CW' ? 'click_CW\n' : 'click_CCW\n';
      writer.write(new TextEncoder().encode(message)).then(() => {
        console.log('Data sent to Arduino:', message);
        currentDirection = currentDirection === 'CW' ? 'CCW' : 'CW';
      }).catch((err) => {
        console.error('Error sending data to Arduino:', err);
      });
    }
    debounceCount = 0;
  }

  if (isConnected) {
    fill(0, 255, 0);
    text('Connected', width / 2, height / 2 + 30);
  }

  ellipse(width / 2, height / 2, 100, 100);
}

async function connectToArduino() {
  if ("serial" in navigator) {
    try {
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      writer = port.writable.getWriter();
      isConnected = true;

      console.log('Connected to the Arduino.');

      readFromArduino();
    } catch (err) {
      console.error('There was an error opening the serial port:', err);
    }
  } else {
    console.error('Web Serial API not supported.');
  }
}

async function readFromArduino() {
  while (port.readable) {
    const reader = port.readable.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        const data = new TextDecoder().decode(value);
        console.log('Received from Arduino:', data);

        if (data.trim() === 'done') {
          motorBusy = false;
        }
      }
    } catch (err) {
      console.error('Error reading from Arduino:', err);
    } finally {
      reader.releaseLock();
    }
  }
}

function freqToIndex(freq) {
  let nyquist = sampleRate() / 2;
  let index = Math.round((freq / nyquist) * (fft.bins - 1));
  return index;
}
