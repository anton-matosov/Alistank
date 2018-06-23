'use strict';

const uart = require('./pi-pins').uart;
const SerialPort = require('serialport');


class Joystick {
  constructor(device = uart.gpio) {
    this.device = device

    // '/dev/cu.wchusbserial1440'
  }

  start() {


    var port = new SerialPort(this.device, {
      baudRate: 9600
    });
    
    // Open errors will be emitted as an error event
    port.on('error', function(err) {
      console.log('Error: ', err.message);
    })
  
    // Read data that is available but keep the stream from entering "flowing mode"
    port.on('readable', function () {
      const data = port.read()
      console.log('Data:', data);

      const header = data.readUInt8(0)
      const leftX = data.readUInt8(1)
      const leftY = data.readUInt8(2)
      const rigthX = data.readUInt8(3)
      const rightY = data.readUInt8(4)
      const buttons1 = data.readUInt8(5)
      const buttons2andTick = data.readUInt8(6)

      const tick = (buttons2andTick & 0xF0) >> 4
      const buttons2 = (buttons2andTick & 0xF)

      console.log('header: 0x' + header.toString(16), 'tick:', tick);
      console.log('leftX:', leftX.toString(10));
      console.log('leftY:', leftY.toString(10));
      console.log('rigthX:', rigthX.toString(10));
      console.log('rightY:', rightY.toString(10));
      console.log('buttons1: ' + buttons1.toString(2));
      console.log('buttons2: ' + buttons2.toString(2));
      console.log(' ');


      // Buttons 1:
      // bit 0 - R1
      // bit 1 - R2
      // bit 2 - R3
      // bit 3 ------- unused. always 1
      // bit 4 - Release
      // bit 5 - BT
      // bit 6 - power
      // bit 7 ------- unused. always 1
      // 
      // Buttons 2:
      // bit 0 - L1
      // bit 1 - L2
      // bit 2 - L3
      // bit 3 ------- unused. always 1

      let ack = new Buffer(1)
      ack.writeInt8(tick)
      port.write(ack)
    });
  }
}

module.exports = {
  Joystick
}