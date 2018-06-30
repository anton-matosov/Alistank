'use strict';

const uart = require('./pi-pins').uart;
const SerialPort = require('serialport');
const fs = require('fs');

class Stick {
  constructor() {
    this.neutralDebounce = 5
    this.min = 0
    this.max = 255
    this.neutral = (this.max - this.min) / 2 
    this.value = this.neutral
  }

  get stickValue() {
    if (this.neutral == 0) {
      return 0
    }
    let value = Math.max(this.value, this.min)
    value = Math.min(value, this.max)

    const position = value - this.neutral
    if (Math.abs(position) < this.neutralDebounce) {
      return 0
    }

    if (position < 0) {
      return position / (this.neutral - this.min)
    } else {
      return position / (this.max - this.neutral)
    }
  }

  captureNeutral() {
    this.neutral = this.value
  }

  prepareToCaptureMinMax() {
    this.min = this.value
    this.max = this.value
  }

  captureMinMax() {
    this.min = Math.min(this.value, this.min)
    this.max = Math.max(this.value, this.max)
  }

  save(path) {
    fs.writeFileSync(path, JSON.stringify(this, null, 2));
  }

  load(path) {
    if (fs.existsSync(path)) {
      const content=fs.readFileSync(path, "utf8");
      const obj = JSON.parse(content);

      Object.assign(this, obj);
    }
  }
}

class Buttons {
  constructor(buttons1, buttons2) {
    // Buttons 2:
    // bit 0 - L1
    // bit 1 - L2
    // bit 2 - L3
    // bit 3 ------- unused. always 1
    this.L1 = this.isBitSet(buttons2, 0)
    this.L2 = this.isBitSet(buttons2, 1)
    this.L3 = this.isBitSet(buttons2, 2)

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

    this.Bluetooth = this.isBitSet(buttons1, 5)
    this.Power = this.isBitSet(buttons1, 6)
    this.Release = this.isBitSet(buttons1, 4)

    this.leftX = 0
    this.leftY = 0

    this.rightX = 0
    this.rightY = 0
  }

  isBitSet(value, bitNumber) {
    return (value & (1 << bitNumber)) != 0
  }
}

class Joystick {
  constructor(device = uart.gpio) {
    this.device = device

    this.leftX = new Stick()
    this.leftY = new Stick()
    this.rightX = new Stick()
    this.rightY = new Stick()

    this.leftX.load(`${this.calibrationDataPath}/leftX.json`)
    this.leftY.load(`${this.calibrationDataPath}/leftY.json`)
    this.rightX.load(`${this.calibrationDataPath}/rightX.json`)
    this.rightY.load(`${this.calibrationDataPath}/rightY.json`)
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

      let ack = new Buffer.alloc(1)
      ack.writeInt8(tick)
      port.write(ack)

      if (this.changedCallback) {
        this.changedCallback(buttons)
      }
    });
  }

  parsePacket(data) {
    console.log('Joystick Data:', data);
    if (data.length < 7) {
      return {
        header: -1
      }
    }
    const header = data.readUInt8(0)
    this.leftX.value = data.readUInt8(1)
    this.leftY.value = data.readUInt8(2)
    this.rightX.value = data.readUInt8(3)
    this.rightY.value = data.readUInt8(4)

    const buttons1 = data.readUInt8(5)
    const buttons2andTick = data.readUInt8(6)

    const tick = (buttons2andTick & 0xF0) >> 4
    const buttons2 = (buttons2andTick & 0xF)

    // console.log('header: 0x' + header.toString(16), 'tick:', tick);
    
    let buttons = new Buttons(buttons1, buttons2)
    buttons.leftX = this.leftX.stickValue
    buttons.leftY = this.leftY.stickValue
    buttons.rightX = this.rightX.stickValue
    buttons.rightY = this.rightY.stickValue

    return {
      header,
      buttons,
      tick
    }
  }

  onChanged(callback) {
    this.changedCallback = callback
  }

  calibrate() {
    const oldCallback = this.changedCallback

    console.log("Starting calibration. Turn on joystick and press any button...")
    let stage = 3
    this.changedCallback = function (buttons) {
      
      switch (stage) {
        case 1:
          stage += 1
          break;
        case 2:
          if (buttons.L3 && buttons.R3) {

            console.log("Neutral positions captured.")
            console.log("Release all buttons")
            stage += 1
          }
          break;
        case 3:
          console.log("Move joystick all sticks to extrem positions.")
          console.log("Once done release sticks to neutral position and press L3+R3")

          this.leftX.prepareToCaptureMinMax()
          this.leftY.prepareToCaptureMinMax()
          this.rightX.prepareToCaptureMinMax()
          this.rightY.prepareToCaptureMinMax()

          stage += 1
          break;
        case 4:
          this.leftX.captureNeutral()
          this.leftY.captureNeutral()
          this.rightX.captureNeutral()
          this.rightY.captureNeutral()
          
          this.leftX.captureMinMax()
          this.leftY.captureMinMax()
          this.rightX.captureMinMax()
          this.rightY.captureMinMax()
          
          if (buttons.L3 && buttons.R3) {
            console.log("Extreme positions captured.")
            console.log("this.leftX.neutral", this.leftX.neutral)
            console.log("this.leftY.neutral", this.leftY.neutral)
            console.log("this.rightX.neutral", this.rightX.neutral)
            console.log("this.rightY.neutral", this.rightY.neutral)

            console.log("this.leftX.min/max", this.leftX.min, "/", this.leftX.max)
            console.log("this.leftY.min/max", this.leftY.min, "/", this.leftY.max)
            console.log("this.rightX.min/max", this.rightX.min, "/", this.rightX.max)
            console.log("this.rightY.min/max", this.rightY.min, "/", this.rightY.max)
            console.log("Calibration complete. Release all buttons")
            stage += 1

            this.leftX.save(`${this.calibrationDataPath}/leftX.json`)
            this.leftY.save(`${this.calibrationDataPath}/leftY.json`)
            this.rightX.save(`${this.calibrationDataPath}/rightX.json`)
            this.rightY.save(`${this.calibrationDataPath}/rightY.json`)
            // const.calibrationDataPath = 
            // fs.writeFile(`${calibrationDataPath}/leftX.json`, JSON.stringify(this.leftX, null, 2));
            // fs.writeFile(`${calibrationDataPath}/leftY.json`, JSON.stringify(this.leftY, null, 2));
            // fs.writeFile(`${calibrationDataPath}/rightX.json`, JSON.stringify(this.rightX, null, 2));
            // fs.writeFile(`${calibrationDataPath}/rightY.json`, JSON.stringify(this.rightY, null, 2));

            this.changedCallback = oldCallback
          }
          break;
      }
    }
  }

  get calibrationDataPath() {
    // return process.env["$HOME"] + "/tmp/"
    // return "/Users/antonmatosov/Develop/XYZRobot/Alistank/calibration"
    
    if (process.env.NODE_ENV === 'test') {
      return process.cwd() + "/.test"
    }
    return process.cwd() + "/calibration"
  }
}

module.exports = {
  Joystick,
  Buttons,
  Stick
}