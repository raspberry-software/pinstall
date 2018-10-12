var JavaESoftware = JavaESoftware || {};
JavaESoftware.Writer = {
    inputElemId: "javae-chunked-input",
    inputElemName: "chat__input",
    submitChunkData: function (chunk) {console.log("Mothod submitChunkData(chunk) not implemented yet.");},
    cancelChunkData: function (chunk) {console.log("Mothod cancelChunkData(chunk) not implemented yet.");},
    submitLastChunkData: function (chunk) {console.log("Mothod submitLastChunkData(chunk) not implemented yet.");},
    notifyActive: function() {console.log("Mothod notifyActive() not implemented yet.");},
    notifyPassive: function() {console.log("Mothod notifyPassive() not implemented yet.");}

};
JavaESoftware.Reader = {
    inputElemId: "javae-chunked-input",
    inputElemName: "javae-chunked-input",
//    submitChunkData: function (chunk) {console.log("Mothod submitChunkData(chunk) not implemented yet.");},
//    cancelChunkData: function (chunk) {console.log("Mothod cancelChunkData(chunk) not implemented yet.");},
//    submitLastChunkData: function (chunk) {console.log("Mothod submitLastChunkData(chunk) not implemented yet.");},
    notifyActive: function() {this.isWriting = true;},
    notifyPassive: function() {this.isWriting = false;},
    isWriting: false
};

JavaESoftware.Util = {
    getInputEmement: function () {
        return document.getElementsByClassName(JavaESoftware.Writer.inputElemId)[0];
    },
    getInputEmementValue: function () {
        return this.getInputEmement().value;
    },
    getChunkDataWithoutSpace: function () {
        var data = "";
        data = this.getInputEmementValue();
        var chunk = data.split(" ");
        return chunk[chunk.length - 2];
    },
    getChunkData: function () {
        var data = "";
        data = this.getInputEmementValue();
        var lastIndex = data.lastIndexOf(" ");
        return data.substring(lastIndex + 1,data.length);
    },
    getInputElementValueLastChar: function () {
        var data = "";
        data = this.getInputEmementValue();
        return data.substring(data.length-1, data.length);

    },
    cancelChunkData: function() {
        if(this.getInputEmementValue().length === 0) {
            this.notifyPassive();
        }
//        var lastInputChar = JavaESoftware.Util.getInputElementValueLastChar();
//        if (lastInputChar.trim() !== '') {
//            var inputElem = this.getInputEmement();
//            var inputElemValue = this.getInputEmementValue();
//
//            var lastIndex = inputElemValue.lastIndexOf(" ");
//            var chunk = inputElem.value.substring(lastIndex + 1,inputElem.value.length);
//            inputElem.value = inputElem.value.substring(0, lastIndex + 2);
//            
//            if(this.readyToCancel) {
//                JavaESoftware.Writer.cancelChunkData(chunk);
//                this.readyToCancel = false;
//            }
//        } else {
//            JavaESoftware.Util.readyToCancel = true;
//        }
    },
    submitFinalData: function () {
        if(this.getInputEmementValue().trim().length > 0) {
            var data = this.getChunkData().trim();
            JavaESoftware.Writer.submitLastChunkData(data);
        }
        this.getInputEmement().value = "";
    },
    submitChunkedData: function() {
        var chunk = this.getChunkDataWithoutSpace();
        if (chunk.trim() !== '') {
            JavaESoftware.Writer.submitChunkData(chunk);
        } else {
            // Do nothing
        }
    },
    notifyActive: function() {
        if(!this.statusActive) {
            JavaESoftware.Writer.notifyActive();
            this.statusActive = true;
        }
    },
    notifyPassive: function() {
        if (this.getInputEmementValue().length === 0) {
            JavaESoftware.Writer.notifyPassive();
            this.statusActive = false;
        }
    },
    readyToCancel: false,
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
                        JavaESoftware.Util.submitChunkedData();
                    }
                    if ([13].indexOf(kc) > -1) {
                        JavaESoftware.Util.submitFinalData();
                    }
                    if ([8].indexOf(kc) > -1) {
                        JavaESoftware.Util.cancelChunkData();
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
