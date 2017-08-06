loadAPI(2);
// from https://github.com/teetrinkers/bitwig-controller-maudio-axiom-25
println("-------------- load -------------");

//Loading External Files
load("MyController_functions.js")
load("rotaries.js");

host.defineController("MAudio", "Axiom 25", "1.0", "436eb006-523d-4fd4-adf1-431af7803e53");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["USB Axiom 25 Port 1"], ["USB Axiom 25 Port 1"]);
host.defineSysexIdentityReply("F0 7E 7F 06 02 00 20 08 63 0E 18 03 20 31 30 30 F7");

var CC_MIN = 1;
var CC_MAX = 119;

var DEVICE_MACRO_COUNT = 8
var ccToUserIndex = []

// send a midi note on channel 1 to use these functions
// NO! use the transport mapping in MyController_functions.js
var CC = {
    LOOP: 20,
    REW: 21,
    FF: 22,
    STOP: 44, 
    PLAY: 43, // toggle
    REC: 45 // toggle
}

// I don't think we need these anymore, since our page-turning functionlity is in MyController_functions.js
var PADS = {
    C14: 36,	// send midi note 36 on channel 10 to switch macro vs common mode
    C15: 38,
    C16: 46,
    C17: 42,
    C18: 50,
    C19: 45,
    C20: 51,
    C21: 49
}

function init() {
    host.getMidiInPort(0).setMidiCallback(onMidi);

    // Print Sysex ID response.
    host.getMidiInPort(0).setSysexCallback(function(data) {println(data);});
    println("Sysex ID:");
    sendSysex("F0 7E 7F 06 01 F7")

    noteInput = host.getMidiInPort(0).createNoteInput("Axiom 25",
        "80????", "90????", "B001??", "B002??", "B00B??", "B040??", "C0????", "D0????", "E0????");
    noteInput.setShouldConsumeEvents(false);

    //Creating a view onto our transport. 
	transport = host.createTransport();
	
	//Creating a Recording Observer
	transport.addIsRecordingObserver(function(value){
		mcTransport.recording = value;
		mcTransport.output();
	})
	
  
    
    //Creating a view onto the selected device.
//     cursorTrack = host.createCursorTrack(3, 0);	
//     cursorDevice = cursorTrack.createCursorDevice();
//     cursorDevice = host.createEditorCursorDevice();
//     remoteControls = cursorDevice.createCursorRemoteControlsPage(8);
	cursorTrack = host.createCursorTrack(3, 0);
	cursorDevice = cursorTrack.createCursorDevice();
	remoteControls = cursorDevice.createCursorRemoteControlsPage(8);
	
// make sure whatever is selected gets an on-screen indication (colors and stuff)
for ( var i = 0; i < 8; i++)
	{
		var p = remoteControls.getParameter(i).getAmount();
		p.setIndication(true);
		p.setLabel("P" + (i + 1));
	}


    

    rotaries = new Rotaries(cursorTrack);

    // Init user controls.
    userControls = host.createUserControls(CC_MAX - CC_MIN + 1 - DEVICE_MACRO_COUNT);
    var index = 0;
    for (var cc = CC_MIN; cc < CC_MAX; cc++) {
        if (!rotaries.isRotary(cc) && !withinRange(cc, CC.LOOP, CC.REC)) {
            ccToUserIndex[cc] = index;
            userControls.getControl(index).setLabel("CC" + cc);
            index++;
        }
    }
    
    parameters.update();
}

function isUserControlCC(cc) {
    return cc < ccToUserIndex.length && ccToUserIndex[cc] != undefined;
}

function onMidi(status, data1, data2) {
    // printMidi(status, data1, data2)

    if (isChannelController(status)) {
    
    	// if we are receiving rotary (macro knob) data
        if (rotaries.isRotary(data1)) {
        println("rotary data");
        println(data1);
        println(data2);
        
        rotaries.onMidi(status, data1, data2);
        userControls.getControl(index).set(data2, 128);
        
        } else if (isUserControlCC(data1)) {
        // if we are not receiving rotary (macro knob) data
        println("control data");
        println(data1);
        println(data2);
            var index = ccToUserIndex[data1];
            userControls.getControl(index).set(data2, 128);
            //parameters.pageScroll(data1, data2);
            
        }
    } else {
    	// if we are not receiving macro data OR control data
    	//parameters.pageScroll(data1, data2);
    	 		if(data1 == 46 && data2 != 0){
 					//cursorDevice.previousParameterPage();
 					remoteControls.selectPreviousPage(true);
 					println("page scroll: previous");
 		}  else if(data1 == 57 && data2 != 0){
 				//cursorDevice.nextParameterPage();
 				remoteControls.selectNextPage(true);
 				println("page scroll: next");
 		}
    	
	mcTransport.input(data1, data2);
	userControls.getControl(index).set(data2, 128);
    	}
  
}

function exit() {
}
