const int trigPins[4] = {2, 4, 6, 8};
const int echoPins[4] = {3, 5, 7, 9};

const int LEDS[4] = {10, 11, 12, 13};
//
const int threshDist = 8;

//variable to store number of free spots
int freeSpots = 0;

void setup() {
  Serial.begin(9600);

//initialize sensor inputs
  for (int i = 0; i<4; i++){
    pinMode(trigPins[i], OUTPUT);
    pinMode(echoPins[i], INPUT);
    pinMode(LEDS[i], OUTPUT);
  }
}

void loop() {
  freeSpots = 0;

  for (int i = 0; i<4; i++){
    digitalWrite(trigPins[i], LOW); // Set LOW 
    delayMicroseconds(2); 
    digitalWrite(trigPins[i], HIGH); // Set HIGH 
    delayMicroseconds(10);
    digitalWrite(trigPins[i], LOW); // Set LOW

    long duration = pulseIn(echoPins[i], HIGH); // Measure pulse length

    int dist = duration * 0.034/2;

    if (dist >= threshDist){
      freeSpots++;
      digitalWrite(LEDS[i], HIGH);
    } else {
      digitalWrite(LEDS[i], LOW);
    }
  }
  // Send the current number of free spots over the serial connection
  Serial.println(freeSpots);

  delay(500);

}

