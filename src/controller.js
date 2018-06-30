'use strict';

const track = require('./track')
const joystick = require('./joystick')
const pins = require('./pi-pins')

class Controller {
  constructor(uart = null) {
    this.leftTrack = new track.Track(pins.pwm.pin33);
    this.rightTrack = new track.Track(pins.pwm.pin12);

    this.joystick = new joystick.Joystick(uart || pins.uart.gpio);

    this.joystick.onChanged(buttons => {
      this.leftTrack.outputValue = -buttons.leftY
      this.rightTrack.outputValue = buttons.rightY

      // console.clear()
      // console.log(JSON.stringify(buttons, null, 2))
    })

    process.on('SIGINT', () => {
      console.log("\nStopping the tank...");
  
      this.joystick.onChanged(undefined)

      this.leftTrack.outputValue = 0
      this.rightTrack.outputValue = 0

      process.exit();
  });
  }

  start() {
    this.joystick.start()
  }

  calibrate() {
    this.joystick.calibrate()
  }
}

module.exports = Controller


