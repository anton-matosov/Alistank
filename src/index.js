'use strict';

const Controller = require('./controller')

const rpio = require('./rpio-mock');
const controller = new Controller("/dev/cu.wchusbserial1460")

var program = require('commander');

program
  .version('1.0.0')
  .option('-c, --calibrate', 'Run joystick calibration')
  .parse(process.argv);

controller.start()

if (program.calibrate) {
  controller.calibrate()
}