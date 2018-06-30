'use strict';


const rpio = require('./rpio-mock');
const track = require('./track')

describe("WHEN constructed", () => {
  const sut = new track.Track();

  it('SHOULD set 0 value for outputValue', () => {
    expect(sut.outputValue).toEqual(0);
  })
  it('SHOULD set median PWM (midPWM) value for outputPwm', () => {
    expect(sut.outputPwm).toEqual(sut.midPWM);
  })
})
