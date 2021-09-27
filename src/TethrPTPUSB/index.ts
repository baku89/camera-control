import {DeviceInfo} from '../DeviceInfo'
import {PTPDevice} from '../PTPDevice'
import {TethrPanasonic} from './TethrPanasonic'
import {TethrPTPUSB} from './TethrPTPUSB'
import {TethrRicohTheta} from './TethrRicohTheta'
import {TethrSigma} from './TethrSigma'

export async function initTethrUSBPTP(
	usb: USBDevice
): Promise<TethrPTPUSB | null> {
	const device = new PTPDevice(usb)
	let info: DeviceInfo

	try {
		await device.open()
		info = await TethrPTPUSB.getDeviceInfo(device)
	} catch (err) {
		if (
			err instanceof DOMException &&
			err.message === 'Unable to claim interface.' &&
			navigator.userAgent.match(/mac/i)
		) {
			throw new Error(
				'Unable to claim interface. On macOS, you need run "killall -9 PTPCamera" in Terminal before connecting to a camera via USB.'
			)
		}
		return null
	}

	let tethr: TethrPTPUSB | null = null

	switch (info.vendorExtensionID) {
		case 0x00000006: // Microsoft / Sigma / Ricoh
			if (info.vendorExtensionDesc === 'SIGMA') {
				tethr = new TethrSigma(device)
			} else if (info.model.match(/theta/i)) {
				tethr = new TethrRicohTheta(device)
			}
			break
		case 0x0000001c: // Panasnoic
			tethr = new TethrPanasonic(device)
			break
	}

	if (!tethr) {
		tethr = new TethrPTPUSB(device)
	}

	return tethr
}

export {TethrPTPUSB}
