'use strict';

const uart = require('./pi-pins').uart;
const SerialPort = require('serialport');

class Buttons {
  constructor(buttons1, buttons2) {
    // Buttons 1:
    // bit 0 - R1
    // bit 1 - R2
    // bit 2 - R3
    // bit 3 ------- unused. always 1
    // bit 4 - Release
    // bit 5 - BT
    // bit 6 - power
    // bit 7 ------- unused. always 1
    this.R1 = this.isBitSet(buttons1, 0)
    this.R2 = this.isBitSet(buttons1, 1)
    this.R3 = this.isBitSet(buttons1, 2)

    this.Release = this.isBitSet(buttons1, 4)
    this.Bluetooth = this.isBitSet(buttons1, 5)
    this.Power = this.isBitSet(buttons1, 6)


    // Buttons 2:
    // bit 0 - L1
    // bit 1 - L2
    // bit 2 - L3
    // bit 3 ------- unused. always 1
    this.L1 = this.isBitSet(buttons2, 0)
    this.L2 = this.isBitSet(buttons2, 1)
    this.L3 = this.isBitSet(buttons2, 2)
    

    this._leftX = 0
    this._leftY = 0

    this._rightX = 0
    this._rightY = 0
  }

  set leftX(value) {
    this._leftX = this.toStickRange(value)
  }

  get leftX() {
    return this._leftX
  }

  set leftY(value) {
    this._leftY = this.toStickRange(value)
  }

  get leftY() {
    return this._leftY
  }

  set rightX(value) {
    this._rightX = this.toStickRange(value)
  }

  get rightX() {
    return this._rightX
  }

  set rightY(value) {
    this._rightY = this.toStickRange(value)
  }

  get rightY() {
    return this._rightY
  }

  isBitSet(value, bitNumber) {
    return (value & (1 << bitNumber)) != 0
  }

  toStickRange(value) {
    value = Math.max(value, 0)
    value = Math.min(value, 255)
    return (value - 127) / 128
  }
}

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
    port.on('error', (err) => {
      console.log('Error: ', err.message);
    })
  
    // Read data that is available but keep the stream from entering "flowing mode"
    port.on('readable', () => {
      const data = port.read()
      const {header, buttons, tick} = this.parsePacket(data)

      const validHeader = 0
      if (header != validHeader) {
        return
      }

      let ack = new Buffer(1)
      ack.writeInt8(tick)
      port.write(ack)

      if (this.changedCallback) {
        this.changedCallback(buttons)
      }
    });
  }

  onChanged(callback) {
    this.changedCallback = callback
  }

  parsePacket(data) {
    // console.log('Data:', data);
    const header = data.readUInt8(0)
    const leftX = data.readUInt8(1)
    const leftY = data.readUInt8(2)
    const rightX = data.readUInt8(3)
    const rightY = data.readUInt8(4)
    const buttons1 = data.readUInt8(5)
    const buttons2andTick = data.readUInt8(6)

    const tick = (buttons2andTick & 0xF0) >> 4
    const buttons2 = (buttons2andTick & 0xF)

    // console.log('header: 0x' + header.toString(16), 'tick:', tick);
    
    let buttons = new Buttons(buttons1, buttons2)
    buttons.leftX = leftX
    buttons.leftY = leftY
    buttons.rightX = rightX
    buttons.rightY = rightY

    return {
      header,
      buttons,
      tick
    }
  }
}

module.exports = {
  Joystick,
  Buttons
}