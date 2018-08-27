var SoftwareRaspberryPi = SoftwareRaspberryPi || {};

SoftwareRaspberryPi.Logger = {
    print: function (msg) {
        document.getElementById("logger").textContent = msg;
    }
};

//SoftwareRaspberryPi.Socket = new WebSocket("ws://192.168.0.21:8082");
//SoftwareRaspberryPi.Socket.onopen = function (event) {
//    //TODO onopen
//};
//SoftwareRaspberryPi.Socket.onmessage = onMessage;
//SoftwareRaspberryPi.Socket.onerror = function (evt) {
//    onError(evt);
//};

function onMessage(event) {
    if (typeof event.data === "string") {
        switch (event.data) {
            case "vehicle-dashcam-play":
                SoftwareRaspberryPi.Logger.print("Turn dash cam ON");
                SoftwareRaspberryPi.Action.playVideo();
                break;
            case "vehicle-dashcam-stop":
                SoftwareRaspberryPi.Logger.print("Turn dash cam OFF");
                break;
            case "vehicle-lights-on":
                SoftwareRaspberryPi.Logger.print("Turn lights ON!");
                break;
            case "vehicle-lights-off":
                SoftwareRaspberryPi.Logger.print("Turn lights OFF!");
                break;
            case "vehicle-sound-horn-beep":
                SoftwareRaspberryPi.Logger.print("Play Beep");
                break;
            case "vehicle-sound-engine-on":
                SoftwareRaspberryPi.Logger.print("Engine ON");
                break;
            case "vehicle-sound-engine-off":
                SoftwareRaspberryPi.Logger.print("Engine OFF");
                break;
            default:
                SoftwareRaspberryPi.Logger.print(event.data);
        }
    }
}
;
function onError(event) {
    console.log("Socket Error ");
    console.log(event.data);
    //TODO onError
}
;
SoftwareRaspberryPi.SocketAction = {
    sendMessage: function (message) {
        // Available states CONNECTING OPEN CLOSING or CLOSED
        if (SoftwareRaspberryPi.Socket.readyState === SoftwareRaspberryPi.Socket.CLOSED) {
            console.log("Cannot send message. Socket is closed already.");
        } else {
            SoftwareRaspberryPi.Socket.send(message);
        }
    }
};


SoftwareRaspberryPi.Action = {
    playVideo: function () {
        
    },
    stopVideo: function () {
        SoftwareRaspberryPi.Vehicle.DashCam.Player.stop();
    }
};
//Data----------------
SoftwareRaspberryPi.Vehicle = {
    Engine: {
        Gear: {
            value: "N"
        },
        Throttle: {
            id: "",
            value: .5,
            setSwitchId: function (val) {
                this.id = val;
            },
            switch : function () {
                var throttleSwitchEl = document.getElementById(this.id);
                if (throttleSwitchEl.checked === false) {
                    throttleSwitchEl.checked = false;
                    this.value = .5;
                } else {
                    throttleSwitchEl.checked = true;
                    this.value = 1.0;
                }
            }
        },
        Force: {
            value: 0.0
        },
        Move: {
            forward: function () {
//                SoftwareRaspberryPi.SocketAction.sendMessage("vehicle-engine-move-forward");
//                SoftwareRaspberryPi.Socket.send("vehicle-engine-move-forward");

                SoftwareRaspberryPi.Logger.print("Move forward.. " + this.getForce());
            },
            backward: function () {
//                SoftwareRaspberryPi.SocketAction.sendMessage("vehicle-engine-move-backward");
                SoftwareRaspberryPi.Logger.print("Move back.. " + this.getForce());
            },
            getForce: function () {
                return SoftwareRaspberryPi.Vehicle.Engine.force * SoftwareRaspberryPi.Vehicle.Engine.throttle;
            }
        },
        stop: function () {
//            SoftwareRaspberryPi.Socket.send("vehicle-engine-stop");
            SoftwareRaspberryPi.Logger.print("Stop");
            this.gear = "N";
            this.throttle = .5;
        }
    },
    Steering: {
        force: 0.0,
        direction: "",
        Turn: {
            left: function () {
//                SoftwareRaspberryPi.SocketAction.sendMessage("vehicle-steering-turn-left");
                SoftwareRaspberryPi.Logger.print("Turn left.. " + Math.random());
            },
            right: function () {
//                SoftwareRaspberryPi.SocketAction.sendMessage("vehicle-steering-turn-right");
                SoftwareRaspberryPi.Logger.print("Turn right.. " + Math.random());
            }
        }
    },
    Lights: {
        lightsSwitchId: "",
        working:false,
        setSwitchId: function (val) {
            this.lightsSwitchId = val;
        },
        switch : function () {
            var lightbeamSwitchMediumEl = document.getElementById(this.lightsSwitchId);
            var lightbeamSwitchSmallEl = document.getElementsByClassName("lightbeam")[1];
            if (this.working === true) {
                this.working = false;
                if(lightbeamSwitchMediumEl) lightbeamSwitchMediumEl.checked = false;
                if(lightbeamSwitchSmallEl)   lightbeamSwitchSmallEl.setAttribute("data-active", "false");
                this.off();
            } else {
                this.working = true;
                if(lightbeamSwitchMediumEl) lightbeamSwitchMediumEl.checked = true;
                if(lightbeamSwitchSmallEl) lightbeamSwitchSmallEl.setAttribute("data-active", true);
                this.on();
            }
        },
        on: function () {
            SoftwareRaspberryPi.SocketAction.sendMessage("vehicle-lights-on");
        },
        off: function () {
            SoftwareRaspberryPi.SocketAction.sendMessage("vehicle-lights-off");
        }
    },
    DashCam: {
        switchId: "",
        working:false,
        setSwitchId: function (val) {
            this.switchId = val;
        },
        switch : function () {
            console.log("is checked? " + dashCamSwitchEl.checked);
            if (this.working === false) {
                this.working = true;
                if(dashCamSwitchEl) dashCamSwitchEl.checked = false;
                this.stop();
            } else {
                this.working = true;
                if(dashCamSwitchEl) dashCamSwitchEl.checked = true;
                this.play();
            }
        },
        Player: {
            player: {},
            init: function () {
                console.log("Init player");
                var canvas = document.getElementById("dashCamCanvas");
                var url = 'ws://' + document.location.hostname + ':8082/';
                this.player = new JSMpeg.Player(url, {canvas: canvas, audio: false});
            },
            /*Init and play video stream in the dashcam*/
            play: function () {
                if (!this.isReady())
                    this.init();
                this.player.play();
            },
            stop: function () {
                if (this.isReady()) {
                    this.player.destroy();
                    this.player={};
                }
            },
            pause: function () {
                if (this.isReady())
                    this.player.pause();
            },
            destroy: function () {
                if (this.isReady())
                    this.player.destroy();
            },
            isReady: function () {
                if (Object.keys(this.player).length === 0)
                    return false;
                else
                    return true;
            }
        },
        play: function (NoIR) {
            document.getElementById('dashCamCanvas').classList.add("active");
            this.Player.play();
            SoftwareRaspberryPi.SocketAction.sendMessage("vehicle-dashcam-play");
        },
        stop: function (NoIR) {
            this.Player.pause();
            SoftwareRaspberryPi.SocketAction.sendMessage("vehicle-dashcam-stop");
        },
//        pause: function (NoIR) {
//            SoftwareRaspberryPi.Socket.send("vehicle-dashcam-pause");
//        },
        Record: {
            /* Take once picture and send it */
            still: function () {
                SoftwareRaspberryPi.Socket.send("vehicle-dashcam-record-still");
            },
            video: function () {
                SoftwareRaspberryPi.Socket.send("vehicle-dashcam-record-video");
            }
        }
    },
    turnoff: function () {
        SoftwareRaspberryPi.Socket.send("vehicle-turnoff");
        SoftwareRaspberryPi.Logger.print("Turn off Raspberry Pi");
    },
    Sound: {
        Horn: {
            /* Play once beep sound */
            beep: function () {
                SoftwareRaspberryPi.SocketAction.sendMessage("vehicle-sound-horn-beep");
            }
        },
        /*Make start engine sound*/
        Engine: {
            mediumControlId: "",
            smallControlId: "",
            working:false,
            /* Play once start engine sound */
            setMediumControlId: function (val) {
                this.mediumControlId = val;
            },
            switch : function () {
                var engineSoundSwitchEl = document.getElementById(this.mediumControlId);
                if (engineSoundSwitchEl.checked === false) {
                    engineSoundSwitchEl.checked = false;
                    this.off();
                } else {
                    engineSoundSwitchEl.checked = true;
                    this.startOff();
                    this.on();
                }
            },
            startOff: function () {
                SoftwareRaspberryPi.Socket.send("vehicle-sound-engine-startoff");
            },
            /* Play continous sound of working engine */
            on: function () {
                this.working=true;
//                SoftwareRaspberryPi.SocketAction.sendMessage("vehicle-sound-engine-on");
            },
            /* Stop playing sound of working engine */
            off: function () {
                this.working=false;
//                SoftwareRaspberryPi.Socket.send("vehicle-sound-engine-off");
            }
        },
//      Experimental - say custom message on Car's Megaphone
        Megaphone: {
            message: function (msg) {
                SoftwareRaspberryPi.Socket.send("vehicle-engine-megaphone-message");
            }
        }
    }
};


