

const bleno = require('bleno');
const PrimaryService = bleno.PrimaryService;
const Characteristic = bleno.Characteristic;




// var characteristic = new Characteristic({
//     uuid: 'fffffffffffffffffffffffffffffff1', // or 'fff1' for 16-bit
//     properties: [ ... ], // can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify', 'indicate'
//     secure: [ ... ], // enable security for properties, can be a combination of 'read', 'write', 'writeWithoutResponse', 'notify', 'indicate'
//     value: null, // optional static value, must be of type Buffer - for read only characteristics
//     descriptors: [
//         // see Descriptor for data type
//     ],
//     onReadRequest: null, // optional read request handler, function(offset, callback) { ... }
//     onWriteRequest: null, // optional write request handler, function(data, offset, withoutResponse, callback) { ...}
//     onSubscribe: null, // optional notify/indicate subscribe handler, function(maxValueSize, updateValueCallback) { ...}
//     onUnsubscribe: null, // optional notify/indicate unsubscribe handler, function() { ...}
//     onNotify: null, // optional notify sent handler, function() { ...}
//     onIndicate: null // optional indicate confirmation received handler, function() { ...}
// });

// process.env.BLENO_DEVICE_NAME = 'XYZrobot';

bleno.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    var name = 'XYZrobot';
    var serviceUuids = ['6E400001-B5A3-F393-E0A9-E50E24DCCA9E']
    
    bleno.startAdvertising(name, serviceUuids, (error) => {
      console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
    });

  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {

  if (!error) {
    var primaryService = new PrimaryService({
      uuid: '0001', // or 'fff0' for 16-bit
      characteristics: [
        new Characteristic({
          uuid: '0003',
          properties: ['notify']
        }),
        new Characteristic({
          uuid: '0002',
          properties: ['writeWithoutResponse', 'write'],
          onWriteRequest: (data, offset, withoutResponse, callback) => {
            console.log('Data:', data);
            
            callback(this.RESULT_SUCCESS);
          }
        })
      ]
    });

    bleno.setServices([primaryService], (error) => {
      console.log('set services: ' + (error ? 'error ' + error : 'success'));
    });
  }
});