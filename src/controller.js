'use strict';

const track = require('./track')
const joystick = require('./joystick')
const pins = require('./pi-pins')

class Controller {
  constructor() {
    this.leftTrack = new track.Track(pins.pwm.pin12);
    this.rightTrack = new track.Track(pins.pwm.pin32);

    this.joystick = new joystick.Joystick(pins.uart.gpio);
  }
}

module.exports = {
  Controller
}