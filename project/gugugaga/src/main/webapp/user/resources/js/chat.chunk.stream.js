var JavaESoftware = JavaESoftware || {};
JavaESoftware.Writer = {
    inputElemId: "message_input",
    inputElemName: "chat__input",
    submitData: function (chunk) {console.log("Method submitData(chunk) not implemented yet.");},
    submitPartialData: function (chunk) {console.log("Method submitParcialData(chunk) not implemented yet.");},
    notifyActive: function() {console.log("Method notifyActive() not implemented yet.");},
    notifyPassive: function() {console.log("Method notifyPassive() not implemented yet.");}

};
JavaESoftware.Reader = {
    inputElemId: "message_input",
    inputElemName: "chat__input",
//    submitChunkData: function (chunk) {console.log("Mothod submitChunkData(chunk) not implemented yet.");},
//    cancelChunkData: function (chunk) {console.log("Mothod cancelChunkData(chunk) not implemented yet.");},
//    submitLastChunkData: function (chunk) {console.log("Mothod submitLastChunkData(chunk) not implemented yet.");},
    notifyActive: function() {this.isWriting = true;},
    notifyPassive: function() {this.isWriting = false;},
    isWriting: false
};

JavaESoftware.Util = {
    getInputEmement: function () {
        return document.getElementById(JavaESoftware.Writer.inputElemId);
    },
    getInputElementValue: function () {
        return this.getInputEmement().value;
    },
    dataRemoved: function() {
        if(this.getInputElementValue().trim().length === 0) {
            this.notifyPassive();
        }
    },
    submitPartialData: function () {
        if(this.validatePartialDataInput()) {
            var data = this.getInputElementValue();
            JavaESoftware.Writer.submitPartialData(data);
        }
    },
    submitData: function () {
        var data = this.getInputElementValue();
        JavaESoftware.Writer.submitData(data);
        this.clearInput();
    },
    notifyActive: function() {
        if(!this.statusActive) {
            JavaESoftware.Writer.notifyActive();
            this.statusActive = true;
        }
    },
    notifyPassive: function() {
        JavaESoftware.Writer.notifyPassive();
        this.statusActive = false;
    },
    clearInput: function() {
        this.getInputEmement().value = "";
    },
    validatePartialDataInput: function () {
        var input = "";
        input = this.getInputElementValue();
        
        return input.charAt(input.length-2) !== ' ';
    },
    statusActive: false
    
};

(function () {
// we use a keyup event to ensure to only check after text has been
// typed into the field
                $(".chat__input").on('keyup', function (event) {
                    var $input = this;

// determine keycode of the last character typed. This works in desktop
// browsers very well. event.which is a JQuery wrapper to ensure
// the right keyCode is returned in every browser
                    var kc = event.which || event.keyCode;

// if we are on a crazy mobile device, then determine the last 
// character typed based on where the selection start is located
                    if (!kc || kc == 229) {
                        var ss = $input.selectionStart - 1;
                        var ssv = ss || 0;
                        var char = $input.value.substr(ssv, 1);
                        kc = char.charCodeAt(0);
                    }

// for this piece of code, we are only interested in keyCodes for 
// space, comma, semi-colon, single-quote, open bracket, close bracket 
                    if ([32].indexOf(kc) > -1) {
                        // space hit
                        JavaESoftware.Util.submitPartialData();
                    }
                    if ([13].indexOf(kc) > -1) {
                        JavaESoftware.Util.submitData();
                    }
                    if ([8].indexOf(kc) > -1) {
                        JavaESoftware.Util.dataRemoved();
                    }
             
                    

// if none of those keycodes were fired, then we should try to detect if a
// paste action occurred and process the text based off that
//                    else {
//                        detectPaste(textarea, function () {
//                            // do stuff
//                            alert("paste");
//                        });
//                    }
                });
})();
