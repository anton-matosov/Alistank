'use strict';

const rpio = require('rpio');
const pwm = require('./pi-pins').pwm;

class Track {
// 26-pin models: pin 12
// 40-pin models: pins 12, 32, 33, 35
  constructor(pin = pwm.pin12) {
    
    this.pin = pin;
    this.minPWM = 100;
    this.pwmRange = 100;
    this.midPWM = this.minPWM + this.pwmRange / 2;
    this.maxPWM = this.minPWM + this.pwmRange;
    this._outputValue = 0;
    
    this.clockdiv = 192;  //If pwmClock is 192 and pwmRange is 2000 we'll get the PWM frequency = 50 Hz
         /* This is a power-of-two divisor of the base 19.2MHz rate, with a maximum value of 4096 (4.6875kHz) (PWM refresh rate), 8 == 2.4MHz */
    this.gpioPwmRange = 2000;

    this.outputPwm = 0;

    this.setup()
  }

  setup() {
    rpio.open(this.pin, rpio.PWM);

    rpio.pwmSetClockDivider(this.clockdiv);
    // rpio.pwmSetMode(rpio.PWM_MODE_MS)
    rpio.pwmSetRange(this.pin, this.gpioPwmRange);

    this.outputValue = 0
  }

  /// Value is in range of -1 (bwd) to 1 (fwd)
  set outputValue(value) {
    this._outputValue = Math.max(-1, Math.min(value, 1))

    this.outputPwm = this.midPWM + (this.pwmRange / 2) * this._outputValue

    rpio.pwmSetData(this.pin, this.outputPwm)
  }
  get outputValue() {
    return this._outputValue
  }
}

module.exports = {
  Track
}
