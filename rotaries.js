// from https://github.com/teetrinkers/bitwig-controller-maudio-axiom-25

function Rotaries(cursorTrack) {
    this.cursorTrack = cursorTrack;

    this.modes = {
        MACRO: 0,
        COMMON: 1
    }

    this.mode = this.modes.MACRO;
    this.setDeviceIndication(true, false)

	// set your 8 knobs/pots/etc. for the 8 remote controls HERE
	// far right evolution x-session default ccs:
	// 			28 29 12 11
	// 			35 36 15 14
    this.ccToParam = []
    this.ccToParam[28] = 0
    this.ccToParam[29] = 1
    this.ccToParam[12] = 2
    this.ccToParam[11]  = 3
    this.ccToParam[35] = 4
    this.ccToParam[36] = 5
    this.ccToParam[15]  = 6
    this.ccToParam[14] = 7
}

Rotaries.prototype.toggleMode = function() {
    if (this.mode === this.modes.MACRO) {
        this.mode = this.modes.COMMON;
        host.showPopupNotification("Rotaries: Common");
        this.setDeviceIndication(false, true);
    } else {
        this.mode = this.modes.MACRO;
        host.showPopupNotification("Rotaries: Macros");
        this.setDeviceIndication(true, false);
    }
}

Rotaries.prototype.setDeviceIndication = function(macro, common) {
    primaryDevice = this.cursorTrack.getPrimaryDevice();
    
    for(var i = 0; i < 8; i++) {
        //primaryDevice.getMacro(i).getAmount().setIndication(macro);
        //primaryDevice.getCommonParameter(i).setIndication(common);
    }
}

Rotaries.prototype.isRotary = function(cc) {
    return cc < this.ccToParam.length && this.ccToParam[cc] != undefined;
}

Rotaries.prototype.onMidi = function(status, data1, data2) {
    primaryDevice = this.cursorTrack.getPrimaryDevice();
    var index = this.ccToParam[data1];
    if (this.mode === this.modes.MACRO) {
        //primaryDevice.getMacro(index).getAmount().set(data2, 128);
        remoteControls.getParameter(index).getAmount().value().set(data2, 128);
    } else {
        primaryDevice.getCommonParameter(index).set(data2, 128);
        primaryDevice.getMacro(index).getAmount().set(data2, 128);
    }
}
