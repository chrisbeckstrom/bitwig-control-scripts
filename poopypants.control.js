loadAPI(2);
host.setShouldFailOnDeprecatedUse(true);

host.defineController("Beckstrom!", "POOPYPANTS (CC 20-27)", "1.0", "BADEC0B0-806E-46CB-AB8C-06209F7856F9");
host.defineMidiPorts(1, 0);
host.setShouldFailOnDeprecatedUse(true);

// user controls?
var LOWEST_CC = 126;
var HIGHEST_CC = 127;

// remote control .. controls?
var DEVICE_START_CC = 60;
var DEVICE_END_CC = 127;

function init()
{
  println("---------- script loaded ---------------");
  host.getMidiInPort(0).setMidiCallback(onMidi);
  host.getMidiInPort(0).setSysexCallback(onSysex);
  generic = host.getMidiInPort(0).createNoteInput("", "??????");
  generic.setShouldConsumeEvents(false);

  transport = host.createTransport();

	// Map CC 20 - 27 to device parameters
	// CB EDIT: try to make it so we can set each CC specifically

    println("trying to create cursor track and device and stuff");
	cursorTrack = host.createCursorTrack(3, 0);
	cursorDevice = cursorTrack.createCursorDevice();
	remoteControls = cursorDevice.createCursorRemoteControlsPage(8);

	println("for loop with i");
	for ( var i = 0; i < 8; i++)
	{
		var p = remoteControls.getParameter(i).getAmount();
		p.setIndication(true);
		p.setLabel("P" + (i + 1));
	}

// 		println("trying to assign a CC to a remote control parameter");
// 		println("i is");
// 		var i = 11;
// 		println(i);
// 		var rcontrol = 1; // which of the 8 remote controls we are working on
// 		var p = remoteControls.getParameter(rcontrol).getAmount();
// 		p.setIndication(true);
// 		p.setLabel("P" + (i + 1));

	// Make the rest freely mappable
	userControls = host.createUserControls(HIGHEST_CC - LOWEST_CC + 1);

	for ( var i = LOWEST_CC; i < HIGHEST_CC; i++)
	{
		if (!isInDeviceParametersRange(i))
		{
			var index = userIndexFromCC(i);
			userControls.getControl(index).setLabel("CC" + i);
		}
	}
}

function isInDeviceParametersRange(cc)
{
	return cc >= DEVICE_START_CC && cc <= DEVICE_END_CC;
	return cc;
}

function userIndexFromCC(cc)
{
	if (cc > DEVICE_END_CC)
	{
		return cc - LOWEST_CC - 8;
	}

	return cc - LOWEST_CC;
}

function onMidi(status, data1, data2)
{
	if (isChannelController(status))
	{
		if (isInDeviceParametersRange(data1))
		{
			var index = data1 - DEVICE_START_CC;
			println("index:");
			println(index);
			remoteControls.getParameter(index).getAmount().value().set(data2, 128);
		}
		else if (data1 >= LOWEST_CC && data1 <= HIGHEST_CC)
		{
			var index = userIndexFromCC(data1);
			userControls.getControl(index).value().set(data2, 128);
		}
	}
}

function onSysex(data) {
   // MMC Transport Controls:
   switch (data) {
      case "f07f7f0605f7":
         transport.rewind();
         break;
      case "f07f7f0604f7":
         transport.fastForward();
         break;
      case "f07f7f0601f7":
         transport.stop();
         break;
      case "f07f7f0602f7":
         transport.play();
         break;
      case "f07f7f0606f7":
         transport.record();
         break;
   }
}

function exit()
{
}
