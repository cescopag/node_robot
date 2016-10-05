char command; // for incoming serial data
long cm; //distance in cm
int autopilot = 0; //status of the autopilot

//left motor pins
const int motorL_pos = 3;
const int motorL_neg = 2;
const int motorL_pwm = 6;

//right motor pins
const int motorR_pos = 5;
const int motorR_neg = 4;
const int motorR_pwm = 9;

//sonar pins
const int distancePin = 7;

//------------------------------------------------------------------------------
// MAIN SETUP
//------------------------------------------------------------------------------
void setup() {
  Serial.begin(57600);

  pinMode(motorL_pos, OUTPUT);
  pinMode(motorL_neg, OUTPUT);
  pinMode(motorL_pwm, OUTPUT);

  pinMode(motorR_pos, OUTPUT);
  pinMode(motorR_neg, OUTPUT);
  pinMode(motorR_pwm, OUTPUT);

  pinMode(distancePin, OUTPUT); //trig out
}

//------------------------------------------------------------------------------
// MAIN LOOP
//------------------------------------------------------------------------------
void loop() {
  // read the incoming command
  command = check();

  //in case of command, react
  switch (command) {
    case 'w':
      Serial.println("Going forward...");
      motorL(1, 255);
      motorR(1, 255);
      autopilot = 0;
      break;
    case 's':
      Serial.println("Going backward...");
      motorL(-1, 255);
      motorR(-1, 255);
      autopilot = 0;
      break;
    case 'a':
      Serial.println("Turning left...");
      motorL(0, 0);
      motorR(1, 128);
      autopilot = 0;
      break;
    case 'd':
      Serial.println("Turning right...");
      motorL(1, 128);
      motorR(0, 0);
      autopilot = 0;
      break;
    case 'x':
      Serial.println("STOP!");
      motorL(0, 0);
      motorR(0, 0);
      autopilot = 0;
      break;
    case 'i':
      Serial.println("Autopilot ON!");
      motorL(1, 128);
      motorR(1, 128);
      autopilot = 1;
      break;
    case 'r':
      cm = dist();
      Serial.print(cm);
      Serial.println("cm");
      break;
  }

  //Autopilot
  if (autopilot == 1) {
    runAutopilot();
  }

  //Reduce the loop time
  delay(10);
}

//------------------------------------------------------------------------------
// Autopilot
//------------------------------------------------------------------------------
void runAutopilot() {
  cm = dist();
  if (cm < 20) {
    //obstacle, turn around
    motorL(-1, 0);
    motorR(-1, 128);
  } else {
    //no more obstacles, go ahead
    motorL(1, 128);
    motorR(1, 128);
  }
}

//------------------------------------------------------------------------------
// Method to control the left motor
//------------------------------------------------------------------------------
void motorL(int direction, int speed) {
  if (direction > 0) {
    digitalWrite(motorL_pos, HIGH);
    digitalWrite(motorL_neg, LOW);
    analogWrite(motorL_pwm, speed);
  }
  if (direction < 0) {
    digitalWrite(motorL_pos, LOW);
    digitalWrite(motorL_neg, HIGH);
    analogWrite(motorL_pwm, speed);
  }
  if (direction == 0) {
    digitalWrite(motorL_pos, LOW);
    digitalWrite(motorL_neg, LOW);
    analogWrite(motorL_pwm, speed);
  }
}

//------------------------------------------------------------------------------
// Method to control the right motor
//------------------------------------------------------------------------------
void motorR(int direction, int speed) {
  if (direction > 0) {
    digitalWrite(motorR_pos, HIGH);
    digitalWrite(motorR_neg, LOW);
    analogWrite(motorR_pwm, speed);
  }
  if (direction < 0) {
    digitalWrite(motorR_pos, LOW);
    digitalWrite(motorR_neg, HIGH);
    analogWrite(motorR_pwm, speed);
  }
  if (direction == 0) {
    digitalWrite(motorR_pos, LOW);
    digitalWrite(motorR_neg, LOW);
    analogWrite(motorR_pwm, speed);
  }
}

//------------------------------------------------------------------------------
// Method that reads from serial port
//------------------------------------------------------------------------------
char check() {
  char comm;
  if (Serial.available() > 0) {
    comm = Serial.read();
  }
  return comm;
}

//------------------------------------------------------------------------------
// Method that reads distance
//------------------------------------------------------------------------------
long dist() {
  long duration, distance; // start the scan
  pinMode(distancePin, OUTPUT); //trig out
  digitalWrite(distancePin, LOW);
  delayMicroseconds(2);
  digitalWrite(distancePin, HIGH);
  delayMicroseconds(10);
  digitalWrite(distancePin, LOW);
  pinMode(distancePin, INPUT); //trig in
  duration = pulseIn(distancePin, HIGH);
  distance = (duration / 2) / 29.1; // convert the distance to centimeters.
  return distance;
}
