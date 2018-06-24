'use strict';

const Controller = require('./controller')

const rpio = require('./rpio-mock');
const controller = new Controller("/dev/cu.wchusbserial1460")

controller.start()
