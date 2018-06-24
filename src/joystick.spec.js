'use strict';


const joystick = require('./joystick')

describe("WHEN joystick constructed", () => {
  const sut = new joystick.Joystick();

  it('SHOULD initialize connection', () => {
    
    // const mockCallback = jest.fn();
    // sut.onChanged(mockCallback)
    // expect(mockCallback).toBeCalled()
    // expect(mockCallback.mock.calls.length).toBe(1);

  })

  it('SHOULD parse data and pass buttons to callback', () => {
    const header = 0
    const leftX = 127
    const leftY = 127
    const rightX = 127
    const rightY = 127
    const buttons1 = 0b1 // R1 set
    const buttons2andTick = 0

    let data = new Buffer.alloc(7);
    data.writeUInt8(header, 0);
    data.writeUInt8(leftX, 1);
    data.writeUInt8(leftY, 2);
    data.writeUInt8(rightX, 3);
    data.writeUInt8(rightY, 4);
    data.writeUInt8(buttons1, 5);
    data.writeUInt8(buttons2andTick, 6);
    
    const {header: headerOut, buttons, tick} = sut.parsePacket(data);
    expect(buttons).not.toBeNull()
    expect(buttons).toBeInstanceOf(joystick.Buttons)

    expect(buttons.R1).toBe(true)
    expect(buttons.R2).toBe(false)
    expect(buttons.R3).toBe(false)

    expect(buttons.leftX).toBeCloseTo(0)
    expect(buttons.leftY).toBeCloseTo(0)

    expect(buttons.rightX).toBeCloseTo(0)
    expect(buttons.rightY).toBeCloseTo(0)
  })
})

describe("WHEN buttons constructed with zeros", () => {
  const sut = new joystick.Buttons(0, 0);
  it('SHOULD have all buttons set to inactive', () => {
    
    expect(sut.L1).toBe(false)
    expect(sut.L2).toBe(false)
    expect(sut.L3).toBe(false)

    expect(sut.R1).toBe(false)
    expect(sut.R2).toBe(false)
    expect(sut.R3).toBe(false)

    expect(sut.Release).toBe(false)
    expect(sut.Bluetooth).toBe(false)
    expect(sut.Power).toBe(false)
  });


  it('SHOULD have all sticks set to neutral values', () => {
    expect(sut.leftX).toBeCloseTo(0)
    expect(sut.leftY).toBeCloseTo(0)

    expect(sut.rightX).toBeCloseTo(0)
    expect(sut.rightY).toBeCloseTo(0)
  });
});

describe("WHEN buttons constructed with ones", () => {
  const sut = new joystick.Buttons(0xFF, 0xFF);

  it('SHOULD have all buttons set to active', () => {
    expect(sut.L1).toBe(true)
    expect(sut.L2).toBe(true)
    expect(sut.L3).toBe(true)

    expect(sut.R1).toBe(true)
    expect(sut.R2).toBe(true)
    expect(sut.R3).toBe(true)

    expect(sut.Release).toBe(true)
    expect(sut.Bluetooth).toBe(true)
    expect(sut.Power).toBe(true)
  });

  it('SHOULD have all sticks set to neutral values', () => {
    expect(sut.leftX).toBeCloseTo(0)
    expect(sut.leftY).toBeCloseTo(0)

    expect(sut.rightX).toBeCloseTo(0)
    expect(sut.rightY).toBeCloseTo(0)
  });
});

describe("WHEN buttons constructed with zeros", () => {
  describe("AND sticks are set to 0 value", () => {
    const sut = new joystick.Buttons(0, 0);
    sut.leftX = 0
    sut.leftY = 0
    sut.rightX = 0
    sut.rightY = 0

    it('SHOULD have all sticks set value close to -1', () => {
      const minimumValue = -1;
      expect(sut.leftX).toBeCloseTo(minimumValue)
      expect(sut.leftY).toBeCloseTo(minimumValue)

      expect(sut.rightX).toBeCloseTo(minimumValue)
      expect(sut.rightY).toBeCloseTo(minimumValue)
    });
  });
});


describe("WHEN buttons constructed with zeros", () => {
  describe("AND sticks are set to 255 value", () => {
    const sut = new joystick.Buttons(0, 0);
    sut.leftX = 255
    sut.leftY = 255
    sut.rightX = 255
    sut.rightY = 255

    it('SHOULD have all sticks set value close to +1', () => {
      expect(sut.leftX).toBeCloseTo(1)
      expect(sut.leftY).toBeCloseTo(1)

      expect(sut.rightX).toBeCloseTo(1)
      expect(sut.rightY).toBeCloseTo(1)
    });
  });
});