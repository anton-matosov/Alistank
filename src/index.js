'use strict';

const Controller = require('./controller')

const rpio = require('rpio');

rpio.init({
  // mock: 'raspi-3',
  mapping: 'physical',    /* Use the P1-P40 numbering scheme */
  gpiomem: false
});

// const controller = new Controller() // RPi
const controller = new Controller("/dev/cu.Bluetooth-Incoming-Port") // RPi
// const controller = new Controller("/dev/cu.wchusbserial1460") // Mac

var program = require('commander');

program
  .version('1.0.0')
  .option('-c, --calibrate', 'Run joystick calibration')
  .parse(process.argv);

controller.start()

if (program.calibrate) {
  controller.calibrate()
}