#define PIN_ENABLE D2
#define PIN_STEP D3
#define PIN_DIR D1

#define DIR_CW LOW
#define DIR_CCW HIGH

int stepDelay = 1000; // Delay between steps in microseconds
const int stepsPerRevolution = 800; // Number of steps for one full rotation
bool motorActive = false;
int stepsRemaining = 0;

void setup() {
    pinMode(PIN_ENABLE, OUTPUT);
    pinMode(PIN_STEP, OUTPUT);
    pinMode(PIN_DIR, OUTPUT);

    digitalWrite(PIN_ENABLE, LOW);

    Serial.begin(9600);
}

void loop() {
    // Check if data is available to read from serial port
    if (Serial.available() > 0) {
        // Read the incoming message
        String message = Serial.readStringUntil('\n');
        
        // Check if the received message is "click_CW" or "click_CCW"
        if (message == "click_CW") {
            motorActive = true;
            stepsRemaining = stepsPerRevolution; // Set to one full rotation
            setDirection(DIR_CW);
        } else if (message == "click_CCW") {
            motorActive = true;
            stepsRemaining = stepsPerRevolution; // Set to one full rotation
            setDirection(DIR_CCW);
        }
    }

    // If the motor is active, perform steps
    if (motorActive) {
        if (stepsRemaining > 0) {
            singleStep();
            stepsRemaining--;
        } else {
            motorActive = false; // Stop the motor after completing the steps
            Serial.println("done"); // Send "done" message when rotation is complete
        }
    }
}

void setDirection(int dir) {
    digitalWrite(PIN_DIR, dir);
}

void singleStep() {
    digitalWrite(PIN_STEP, HIGH);
    delayMicroseconds(stepDelay);
    digitalWrite(PIN_STEP, LOW);
    delayMicroseconds(stepDelay);
}
