
const rpio = require('rpio');

rpio.init({
  mock: 'raspi-3',
  gpiomem: false
});

module.exports = rpio
