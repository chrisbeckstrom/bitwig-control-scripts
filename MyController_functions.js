//functions.js
// from https://github.com/dataf1ow/Contoller_Scripting_Examples/blob/master/Bitwig_pt7/MyController.control.js

//Our Custom Transport functionality. 
var mcTransport = {

	playing: false,
	recording: false,

	// set the MIDI notes that control transport here
	input: function(data1, data2){
		if (data1 == 43 && data2 > 64){
			println("transport: play");
			transport.play();
		}else if (data1 == 44 && data2 > 64){
			println("transport: stop");
			transport.stop();
		}else if (data1 == 45 && data2 > 64){
			println("transport: record");
			transport.record();
		}
	},	

 	output: function(){
		if (this.playing){
			sendMidi(144, 35, 127);
			sendMidi(144, 34, 0);
		}else{
			sendMidi(144, 35, 0);
			sendMidi(144, 34, 127);
		}

		if(this.recording){
			sendMidi(144, 33, 127)
		}else{
			sendMidi(144, 33, 0)
		}

	}
}

var parameters = {
	offset: 1,
	control: function(data1, data2)
 	{
 		if(data1 >= this.offset && data1 < this.offset + 7){
 			println("control function");
			cursorDevice.getParameter(data1 - this.offset).set(data2,128);
 		}
 	},

 	pageScroll: function(data1, data2)
 	{
	 	// change device parameter pages using MIDI notes
		// the x-session defaults to sending 127 and 64 for button presses
		// made it so only the 127 actually does anything
 		// if(data1 == 46 && data2 != 64){
//  			cursorDevice.previousParameterPage();
//  			println("page scroll: previous");
//  		}else if(data1 == 57 && data2 != 64){
//  			cursorDevice.nextParameterPage();
//  			println("page scroll: next");
//  		}
 	},

 	update: function()
 	{
 		for(var p = 0; p <8; p ++)
 		{
 			//cursorDevice.getParameter(p).setIndication(true);
 		}
 	}

}
