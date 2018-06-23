'use strict';


module.exports.pwm = Object.freeze({ pin12: 12, pin32: 32, pin33: 33, pin35: 35 });

module.exports.uartP2 = Object.freeze({ gpio: "/dev/ttyAMA0", });

// On PI3 gpio serial is disabled. Enable it in sudo nano /boot/config.txt
// enable_uart=1
// Disable Console
// Pi2:
// $ sudo systemctl stop serial-getty@ttyAMA0.service
// $ sudo systemctl disable serial-getty@ttyAMA0.service
//
// Pi3:
// $ sudo systemctl stop serial-getty@ttyS0.service
// $ sudo systemctl disable serial-getty@ttyS0.service
// In sudo nano /boot/cmdline.txt
// Remove `console=serial0,115200`
// dwc_otg.lpm_enable=0 console=serial0,115200 console=tty1 root=/dev/mmcblk0p2 rootfstype=ext4 elevator=deadline fsck.repair=yes root wait
//
// PI3 Overlays to use HW UART
// sudo nano /boot/config.txt
// dtoverlay=pi3-miniuart-bt # Swap UART for Bluetooth
// dtoverlay=pi3-disable-bt # Disable Bluetooth entirely
module.exports.uartP3 = Object.freeze({ bluetooth: "/dev/ttyAMA0", gpio: "/dev/ttyS0" });

module.exports.uart = Object.freeze({ gpio: "/dev/serial0", bluetooth: "/dev/serial1" });