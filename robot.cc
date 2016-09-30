#include <math.h>
int incomingByte = 0;   // for incoming serial data
long duration;
long cm, cm1;

const int motorA_pos = 3;
const int motorA_neg = 2;
const int motorA_pwm = 6;

const int motorB_pos = 5;
const int motorB_neg = 4;
const int motorB_pwm = 9;

const int ping = 7;
const int pong = 8;

const int ledPin = 13;

void setup() {
    Serial.begin(9600); //opens serial port, sets data rate to 9600 bps

    pinMode(motorA_pos, OUTPUT);
    pinMode(motorA_neg, OUTPUT);
    pinMode(motorA_pwm, OUTPUT);

    pinMode(motorB_pos, OUTPUT);
    pinMode(motorB_neg, OUTPUT);
    pinMode(motorB_pwm, OUTPUT);

    pinMode(ping, OUTPUT);
    pinMode(pong, INPUT);

    pinMode(ledPin, OUTPUT);
    digitalWrite(ledPin, LOW);

    motorA('stop', 0);
    motorB('stop', 0);
}

void loop() {
    digitalWrite(ledPin, LOW);
    // send data only when you receive data:
    if (Serial.available() > 0) {
        // read the incoming byte:
        incomingByte = Serial.read();
        if (incomingByte == 'w') {
            motorA('forward', 255);
            motorB('forward', 255);
        } else if (incomingByte == 's') {
            motorA('backward', 255);
            motorB('backward', 255);
        } else if (incomingByte == 'a') {
            motorA('backward', 128);
            motorB('forward', 128);
        } else if (incomingByte == 'd') {
            motorA('forward', 128);
            motorB('backward', 128);
        } else {
            motorA('stop', 0);
            motorB('stop', 0);
        }
        digitalWrite(ledPin, HIGH);
    }

    distance();

    if (cm < 1) {
        motorA('stop', 0);
        motorB('stop', 0);
    }

    //write the distance to the serial port
    if (Serial.available() > 0) {
        Serial.write(cm);
    }

    delay(100);
}

void distance() {
    // The PING))) is triggered by a HIGH pulse of 2 or more microseconds.
    // Give a short LOW pulse beforehand to ensure a clean HIGH pulse:
    digitalWrite(ping, LOW);
    delayMicroseconds(2);
    digitalWrite(ping, HIGH);
    delayMicroseconds(5);
    digitalWrite(ping, LOW);

    // The same pin is used to read the signal from the PING))): a HIGH
    // pulse whose duration is the time (in microseconds) from the sending
    // of the ping to the reception of its echo off of an object.

    duration = pulseIn(pong, HIGH);
    cm1 = duration / 29 / 2;
    cm = (int) cm + (cm1 - cm) * 0.25; //ease the read
    if (cm > 255) cm = 255;
    return cm;
}

void motorA(char direction, int speed) {
    if (direction == 'forward') {
        digitalWrite(motorA_pos, HIGH);
        digitalWrite(motorA_neg, LOW);
        analogWrite(motorA_pwm, speed);
    } else if (direction == 'backward') {
        digitalWrite(motorA_pos, LOW);
        digitalWrite(motorA_neg, HIGH);
        analogWrite(motorA_pwm, speed);
    } else if (direction == 'stop') {
        digitalWrite(motorA_pos, LOW);
        digitalWrite(motorA_neg, LOW);
        analogWrite(motorA_pwm, speed);
    }
}

void motorB(char direction, int speed) {
    if (direction == 'forward') {
        digitalWrite(motorB_pos, HIGH);
        digitalWrite(motorB_neg, LOW);
        analogWrite(motorB_pwm, speed);
    } else if (direction == 'backward') {
        digitalWrite(motorB_pos, LOW);
        digitalWrite(motorB_neg, HIGH);
        analogWrite(motorB_pwm, speed);
    } else if (direction == 'stop') {
        digitalWrite(motorB_pos, LOW);
        digitalWrite(motorB_neg, LOW);
        analogWrite(motorB_pwm, speed);
    }
}
