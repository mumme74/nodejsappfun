/**
 * Detta är ett exempel på att styra en robot arm med en simpel arduino i 4 axlar
 * Tar emot info via serial
 * 
 * 
 * protokoll: L fram back, U=upp-ned, S=vrid sida, G = grip
 * värden kan vara mellan 0-180, 90 mittläge
 * 
 * För att stätta i mittläget
 * L90\n
 * U90\n
 * S90\n
 * G90\n
 * 
 * sänder maximal 20bytes för att styra alla axlarna.
 * Koden avgränsar på newline '\n' måste ta emot ett helt komplett meddelande annars ändrar den inte värde. 
 */

 #include <Servo.h>

const int L_AXIS = PD5,
          U_AXIS = PD4,
          S_AXIS = PD6,
          G_AXIS = PD7;
          
Servo servoL, servoU, servoS, servoG;


// koden i denna funktion startar serie kommunikationen med värddatorn
// samt startar servodrivarna
// körs endast 1 gång
void setup() {
  
  Serial.begin(9600);//38400);//115200);
  delay(100); // pausa 100ms för att sätta upp denna.

  // starta servodrivarna
  servoL.attach(L_AXIS);
  servoU.attach(U_AXIS);
  servoS.attach(S_AXIS);
  servoG.attach(G_AXIS);

  // sätt i mittläget
  servoL.write(90);
  servoU.write(90);
  servoS.write(90);
  servoG.write(90);
}


// det är i denna som vår evighetsloop finns.
void loop() {
  // vänta på ett meddelande som avslutas med ny rad
  String msg = Serial.readStringUntil('\n');
  // kolla så att meddelandet innehåller ett värde
  if (msg.length() > 1) {
    int vlu = msg.substring(1).toInt(); // läs allt efter först byten upp till newline
    // om det är L skall vi ändra på Fram-Back axeln
    if (msg[0] == 'L') 
      servoL.write(map(vlu, 0, 180, 15, 180));
    // om det är U skall vi ändra på Upp-Ned
    else if (msg[0] == 'U')
      servoU.write(map(vlu, 0, 180, 25, 140));
    // om det är S skall vi ändra på sida(vridning)
    else if (msg[0] == 'S')
      servoS.write(map(vlu, 0, 180, 0, 180));
    // eller gripklon
    else if (msg[0] == 'G')
      servoG.write(map(vlu, 0, 180, 10, 140));

    // om vi inte har blivit uppsnappade här så släpper vi meddelandet. 
    // om börjar om väntan i nästa loop.
    Serial.println(msg);
  }
}
