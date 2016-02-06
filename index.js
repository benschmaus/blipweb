var formToCCs = {
    "aDecay": 54,
    "fDecay": 53,
    "sustain": 64,
    "fCut": 52,
    "wave": 51,
    "detune": 50,
    "octave": 65,
    "lDepth": 48,
    "lRate": 49,
    "lDest": 67,
    "pwmSweep": 66,
    "glide": 55,
    "vcfEnvAmount": 56,
    "lRand": 68,
    "lNoteRetrig": 69,
    "oscBWave": 70
};


var midi = {

onMIDISuccess: function(midiAccess) {
    console.log('MIDI Access Object', midiAccess);
    //console.log(this);

    var self = this;
    midiAccess.onstatechange = function(e) {
        self.onMIDIAccessChange(e);
    }
    this.midiAccess = midiAccess;
    this.inputs = {};
    this.outputs = {};

    this.initPorts();
},

initPorts: function() {    

    var self = this;

    var inputs = this.midiAccess.inputs;
    if (inputs.size > 0) {
        inputs.forEach(
            function(port, key) {
                //console.log(port);
                self.registerPort(port);
            }
        );
    } else {
        
    }

    var outputs = this.midiAccess.outputs;
    if (outputs.size > 0) {
        outputs.forEach(
            function(port, key) {
                self.registerPort(port);        
                self.renderPort(port);
            }
        );
    } else {
        
    }
},

onMIDIAccessChange: function(e) {
    console.log("MIDI access change: " + e);
    //console.log(this);
    var port = e.port;

    if (port.type == "input") {
        if (this.inputs[port.name] === undefined) {
            this.registerPort(port);
        }
    } else {
        if (this.outputs[port.name] === undefined) {
            this.registerPort(port);
        }
        this.renderPort(port);
    }
},

renderPort: function(port) {
    var portOptions = $("#port").children();

    if (port.state == "connected") {
        if ((portOptions.length == 1) && (portOptions.get(0).text == "none")) {
            $("#port").empty();
        }

        if (!$("#" + port.type + port.id).length) {
            var html = '<option id="' + port.type + port.id + '" value="' + port.name + '">' + port.name + '</option>';
            $("#port").append(html);
        }
    } else {
        $("#" + port.type + port.id).remove();

        if ($("#port").children().length == 0) {
            $("#port").append('<option value="none">none</option>')
        }
    }
},

registerPort: function(port) {
    var self = this;
    if (port.type == "input") {
        this.inputs[port.name] = port;
        port.onmidimessage = function(m) { self.onMIDIMessage(m); };
    } else {
        this.outputs[port.name] = port;
    }

    port.onstatechange = function(e) { self.onPortStateChange(e); };
},

onMIDIFailure: function(e) {
    // when we get a failed response, run this code
    alert("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
},

onPortStateChange: function(event) {
	console.log("port state change: " + event);
},

onMIDIMessage: function(message) {
    //console.log(message);
}

};

if (navigator.requestMIDIAccess) {

    navigator.requestMIDIAccess({
        sysex: false
    }).then(
        function(midiAccess) { midi.onMIDISuccess(midiAccess); },
        function(e) { midi.onMIDIFailure(e); }
    );

} else {
    alert("No MIDI support in your browser.");
}