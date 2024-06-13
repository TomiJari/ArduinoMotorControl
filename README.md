
## Arduino Code

The Arduino code (`motor_control.ino`) sets up the pins and listens for serial commands (`click_CW` and `click_CCW`) to control the stepper motor.

## Web Application

The web application consists of `index.html`, `sketch.js`, and `style.css` files. It uses p5.js to analyze audio input and the Web Serial API to send commands to the Arduino.

### index.html

Sets up the HTML structure and includes the p5.js library and the `sketch.js` file.

### sketch.js

Contains the p5.js code to analyze the audio input, detect the target frequency, and communicate with the Arduino.

### style.css

Contains basic styles for the web application.

## How to Use

1. Upload the `motor_control.ino` sketch to your Arduino.
2. Open `index.html` in a browser that supports the Web Serial API (e.g., Chrome).
3. Click the "Connect to Arduino" button to establish a serial connection.
4. The application will analyze audio input and control the stepper motor based on the detected frequency.
