const directions = [
  ArrowNames.North, ArrowNames.NorthEast,
  ArrowNames.East, ArrowNames.SouthEast,
  ArrowNames.South, ArrowNames.SouthWest,
  ArrowNames.West, ArrowNames.NorthWest
];
let current = 1;
//serial.onDataReceived("\n", ()=>{
//    let msg = serial.readUntil("\n");
bluetooth.startUartService();
bluetooth.onUartDataReceived("\n", () => {
  let msg = bluetooth.uartReadUntil("\n");
  if (!msg.length) return;

  current = parseInt(msg);
  if (current > 7) current = 0;
  if (current < 0) current = 7;
  //serial.writeNumber(current);
  bluetooth.uartWriteNumber(current);
});
basic.forever(() => {
  basic.showArrow(directions[current]);
});