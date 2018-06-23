'use strict';


const rpio = require('./rpio-mock');

const controller = require('./controller')

describe("WHEN constructed", () => {
  const sut = new controller.Controller();

  it('SHOULD create both tracks', () => {
    expect(sut.leftTrack).not.toBeNull()
    expect(sut.rightTrack).not.toBeNull()
  });

  it('SHOULD create joystick', () => {
    expect(sut.joystick).not.toBeNull()
    
  })
})
