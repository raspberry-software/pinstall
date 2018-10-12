var GuGuGaGa = GuGuGaGa || {};
GuGuGaGa.Socket = {};

GuGuGaGa.properties = {
    username:"",
    lastMessageByUser: "",
    defaultOtherUserColour: "#f8f8f8;"
};

if (window.WebSocket !== undefined) {
    if (GuGuGaGa.Socket.readyState === undefined || GuGuGaGa.Socket.readyState > 1)
    {
        GuGuGaGa.Socket = new WebSocket("wss://" + window.location.hostname + "/agata/ws");
        GuGuGaGa.Socket.onopen = function (event) {
//            JavaE.ActionEvent.messageOnOpen();
            console.log("open session!");
        };
        GuGuGaGa.Socket.onmessage = onMessage;
        GuGuGaGa.Socket.onerror = function (evt) {
            onError(evt);
        };
        GuGuGaGa.Socket.onclose = function (evt) {
            
        };
    }
}
window.onbeforeunload = function () {
    GuGuGaGa.Socket.onclose = function () {
        
    }; // disable onclose handler first
    GuGuGaGa.Socket.close();
};

function onMessage(event) {
    // handle text message

    var ActionMessage = JSON.parse(event.data);
    var action = "";
    action = ActionMessage.action;

    console.log("Message received:");
    console.log(ActionMessage);
    
    switch (action) {
        case "connect_successfull" :
            {
                // save this user username
                var username = "";
                username = ActionMessage.source;
                if (username) {
                    console.log("connect_successfull!" + " set username " + username);
                    GuGuGaGa.Utils.setCurrentUsername(username);
                }
                GuGuGaGa.ActionEvent.updateUserList();
                GuGuGaGa.ActionEvent.pingOut(true);
            } break;
        case "connection_status" :
            {
                var username = ActionMessage.source;
                var status   = ActionMessage.content;
                GuGuGaGa.DOM.updateUserConnectionStatus(username, status);
            } break;
        case "update_connected_users" :
            {
                var connectedUsers = ActionMessage.content;
                
                var length = connectedUsers.length;
                for (var i=0; i<length; i++) {
                    GuGuGaGa.DOM.updateUserConnectionStatus(connectedUsers[i], true);
                }
            } break;
        case "update_disconnected_users" :
            {
                var disconnectedUsers = ActionMessage.content;
                
                var length = disconnectedUsers.length;
                for (var i=0; i<length; i++) {
                    GuGuGaGa.DOM.updateUserConnectionStatus(disconnectedUsers[i], false);
                }
            } break;
        case "update_user" :
            {
                GuGuGaGa.Action.updateUserView(ActionMessage.content);
            } break;
        case "text_partial_message" : {
                GuGuGaGa.Action.printPartialTextMessage(ActionMessage);
            } break;
        case "text_message" :
            {
                GuGuGaGa.Action.printTextMessage(ActionMessage);
            } break;
        case "text_message_poke" :
            {
                console.log("Message received:" + event.data);
                
                var sourceUsername, targetUsername = "";
                var TextMessage = {};
                TextMessage = ActionMessage.content;
                
                sourceUsername = TextMessage.source;
                targetUsername = TextMessage.target;
                
                if(GuGuGaGa.Utils.isRelevantChatOpened(sourceUsername, targetUsername)){
                    GuGuGaGa.Action.printPokeMessage();
                }
            } break;
        case "stop_partial_text_message" : {
                GuGuGaGa.DOM.stopTyping();
            } break;
        case "info" :
            {
                console.log("ERROR. Info message not implemented yet.");
            } break;
        case "update_users_list" :
            {
                var usersList = ActionMessage.content;
                GuGuGaGa.DOM.clearUsersList();
                usersList.forEach(user => {
                    GuGuGaGa.DOM.printUserView(user);
                });
                GuGuGaGa.ActionEvent.pingIn();
            } break;
        case "load_chat" :
            {
                GuGuGaGa.Action.loadChat(ActionMessage);
            } break;
        default :
        {
            console.log("Unsupported action. Received message:" + event.data);
        }


    }
    ;
}




//if ("connect_successfull" === action) {
//    var username = "";
//    username = ActionMessage.content;
//    if (username) {
//        console.log("connect_successfull!" + " set username " + username);
//        JavaE.Utils.setCurrentUsername(username);
//    }
//    ;
//} else if ("update_user" === action) {
//    var User = {};
//    User = ActionMessage.content;
//    JavaE.Action.updateUserView(User);
//} else if ("info" === action) {
//    alert(ActionMessage.content);
//} else if ("start-partial-text-message" === action) {
//    console.log("start-partial-text-message from: " + ActionMessage.source + " to " + ActionMessage.target);
//    JavaE.DOM.notifyStartWriting(ActionMessage.source);
//} else if ("stop-chunked-text-message" === action) {
//    console.log("stop-chunked-text-message from: " + ActionMessage.source);
//    JavaE.DOM.notifyStopWriting(ActionMessage.source);
//} else if ("chunked-text-message" === action) {
//    console.log("chunked-text-message: " + ActionMessage.content);
//} else if ("final-chunked-text-message" === action) {
//    console.log("FINAL chunked-text-message: " + ActionMessage.content);
//    JavaE.Action.printChunkedTextMessage(ActionMessage);
//}
//}
//;

function onError(event) {
    console.log("WS Error " + event.data);
}

/*
 * Helper common methods
 */
GuGuGaGa.Action = {
    updateUserView: function (user) {
        var User = {};
        User = user;
        if (GuGuGaGa.Utils.getUserElem(User.username)) {
            GuGuGaGa.DOM.updateUserView(User);
        } else {
            GuGuGaGa.DOM.printUserView(User);
        }
    },
    printTextMessage: function (ActionMessage) {
        var sourceUsername, targetUsername = "";
        sourceUsername = ActionMessage.source;
        targetUsername = ActionMessage.target;
        if (GuGuGaGa.Utils.isRelevantChatOpened(sourceUsername, targetUsername)) {
            GuGuGaGa.DOM.removeExcessTextMessage(5);
            if (GuGuGaGa.Utils.isCurrentUsername(sourceUsername)) {
                // do nothing
                GuGuGaGa.DOM.printMineTextMessage(ActionMessage);
            } else {
                GuGuGaGa.DOM.removePartialMessage();
                GuGuGaGa.DOM.printOtherUserTextMessage(ActionMessage);
            }
            GuGuGaGa.Action.scrollMessagesToBottom();
        }
    },
    printPokeMessage: function () {
        console.log("printTextMessage... " );

        GuGuGaGa.DOM.printOtherUserPokeMessage();
        GuGuGaGa.Action.scrollMessagesToBottom();
    },
    printPartialTextMessage: function (ActionMessage) {
        console.log("printPartialTextMessage...");
        
        if (GuGuGaGa.Utils.isRelevantChatOpened(ActionMessage.source, ActionMessage.target)) {
            var partialMessageElem = GuGuGaGa.Utils.getOtherUserPartialTextMessage();
            if (partialMessageElem) {
                console.log("printPartialTextMessage - last elem exist");
            } else {
                console.log("printPartialTextMessage - last elem does NOT exist");
            }
            if (partialMessageElem) {
                GuGuGaGa.DOM.updateOtherUserPartialTextMessage(partialMessageElem, ActionMessage.content);
            } else {
                GuGuGaGa.DOM.printOtherUserPartialTextMessage(ActionMessage);
                GuGuGaGa.Action.scrollMessagesToBottom();
            }
        }
    },
    scrollMessagesToBottom: function() {
        var chatMessagesElem = document.querySelector(".chat__messages");
        chatMessagesElem.scrollTop = chatMessagesElem.scrollHeight;
    },
    loadChat: function(ActionMessage) {
        GuGuGaGa.DOM.removeChatMessages();
        GuGuGaGa.DOM.printEmptyTextMessage(3);
        GuGuGaGa.Action.printTextMessage(ActionMessage);
    }

};

GuGuGaGa.ActionEvent = {
    textMessage: function (message) {
        var msg = message.replace(/\r?\n|\r/g, "");
        var target = GuGuGaGa.Utils.getTargetUsername();
        var ActionMessage = {};
        if(" " === message || "." === message) {
            ActionMessage = {
                action: "text_message_poke",
                target: target,
                content: msg
            };            
        } else {
            ActionMessage = {
            action: "text_message",
            target: target,
            content: msg
            };
        }

        GuGuGaGa.SocketAction.sendTextMessage(JSON.stringify(ActionMessage));
    },
    textPartialMessage: function (message) {
        var msg = message.replace(/\r?\n|\r/g, "");
        var target = GuGuGaGa.Utils.getTargetUsername();
        var ActionMessage = {
            action: "text_partial_message",
            target: target,
            content: msg
        };
        GuGuGaGa.SocketAction.sendTextMessage(JSON.stringify(ActionMessage));
    },
    notifyStopPartialMessage: function () {
        var target = GuGuGaGa.Utils.getTargetUsername();
        var ActionMessage = {
            action: "stop_partial_text_message",
            target: target
        };
        GuGuGaGa.SocketAction.sendTextMessage(JSON.stringify(ActionMessage));
    },
    loadChat: function() {
        var target = GuGuGaGa.Utils.getTargetUsername();
        var ActionMessage = {
            action: "load_chat",
            target: target
        };
        console.log("Load chat for tatget " + target);
        GuGuGaGa.SocketAction.sendTextMessage(JSON.stringify(ActionMessage));
    },
    updateUserList: function() {
        var ActionMessage = {
            action: "update_users_list"
        };
        console.log("Update user list");
        GuGuGaGa.SocketAction.sendTextMessage(JSON.stringify(ActionMessage));    
    },
    // Send ping regarding your connection to all other related users 
    pingOut: function(isConnection) {
        var ActionMessage = {
            action: "ping_out",
            content: isConnection
        };
        console.log("Ping out");
        GuGuGaGa.SocketAction.sendTextMessage(JSON.stringify(ActionMessage));         
    },
    // Send me back connection status of all other related users
    pingIn: function() {
        var ActionMessage = {
            action: "ping_in"
        };
        console.log("Ping in");
        GuGuGaGa.SocketAction.sendTextMessage(JSON.stringify(ActionMessage));         
    }
};

GuGuGaGa.SocketAction = {
    sendTextMessage: function (message) {
        console.log("Send txt message: " + message);
        GuGuGaGa.Socket.send(message);
    }
};

GuGuGaGa.DOM = {
    printMineTextMessage: function (textMessage) {
        console.log("printMineTextMessage ");
        
        var thisUserName, messageContent, messageCreatedTime = "";
        var Message = {};
        Message = textMessage;
        messageContent = Message.content;
        thisUserName = Message.source;
        messageCreatedTime = Message.createdTime;

        var chatMessagesElem = document.getElementsByClassName("chat__messages")[0];
        var chatMessageRowElem = document.createElement("div");
        chatMessageRowElem.className = "chat__msgRow";
        
        var chatMessageElem = document.createElement("div");
        chatMessageElem.className = "chat__message mine fade-in";
        
        if(messageCreatedTime) {
            var attrTimeElem = document.createAttribute("data-time");
            attrTimeElem.value = messageCreatedTime;
            chatMessageElem.setAttributeNode(attrTimeElem);
        }
        
        var messageContentElem = document.createTextNode(messageContent);
        
        chatMessageElem.appendChild(messageContentElem);
        chatMessageRowElem.appendChild(chatMessageElem);
        chatMessagesElem.appendChild(chatMessageRowElem);
        
    },
    removeExcessTextMessage: function (excess) {
        var chatMessagesElem = document.getElementsByClassName("chat__messages")[0];
        if(chatMessagesElem.childElementCount >= excess ) {
            chatMessagesElem.removeChild(chatMessagesElem.childNodes[0]);
        }    
    },
    printOtherUserTextMessage: function (ActionMessage) {
        console.log("printOtherUserTextMessage...");
        
        var thisUserName, messageContent, messageCreatedTime = "";
        var Message = {};
        Message = ActionMessage;
        messageContent = Message.content;
        thisUserName = Message.source;
        messageCreatedTime = Message.createdTime;

        var chatMessagesElem = document.getElementsByClassName("chat__messages")[0];
        
        var chatMessageRowElem = document.createElement("div");
        chatMessageRowElem.className = "chat__msgRow";
        
        var chatMessageElem = document.createElement("div");
        chatMessageElem.className = "chat__message notMine fade-in";
        
        console.log("create attr data-time " + messageCreatedTime);
        
        if(messageCreatedTime) {
            console.log("create attr data-time .. carry on...");
            var attrTimeElem = document.createAttribute("data-time");
            attrTimeElem.value = messageCreatedTime;
            chatMessageElem.setAttributeNode(attrTimeElem);
        }
        
        var userColour = GuGuGaGa.Utils.getUserColour(Message.source);
        console.log("add user colour class name");
        if(userColour) {
            console.log("User colour exist. Apply!");
            chatMessageElem.className += " " + userColour;         
        }

        
        var messageContentElem = document.createTextNode(messageContent);
        
        chatMessageElem.appendChild(messageContentElem);
        chatMessageRowElem.appendChild(chatMessageElem);
        chatMessagesElem.appendChild(chatMessageRowElem);
    },
    printEmptyTextMessage: function (count) {
        if(count === undefined) count = 1;
        for (var i=0; i<count; i++)
        var messageContent = " ";

        var chatMessagesElem = document.getElementsByClassName("chat__messages")[0];
        
        var chatMessageRowElem = document.createElement("div");
        chatMessageRowElem.className = "chat__msgRow";
        
        var chatMessageElem = document.createElement("div");
        chatMessageElem.className = "chat__message notMine fade-in";

        var messageContentElem = document.createTextNode(messageContent);
        
        chatMessageElem.appendChild(messageContentElem);
        chatMessageRowElem.appendChild(chatMessageElem);
        chatMessagesElem.appendChild(chatMessageRowElem);
    },
    printOtherUserPokeMessage: function () {
        console.log("printOtherUserTextMessage...");

        var chatMessagesElem = document.getElementsByClassName("chat__messages")[0];
        var chatMessageRowElem = document.createElement("div");
        chatMessageRowElem.className = "chat__msgRow";
        
        var chatMessageElem = document.createElement("div");
        chatMessageElem.className = "chat__message emoticon fade-in";
        
        chatMessageElem.className += "colour-white";  
        
        var pokeImageElem = document.createElement("img");
        pokeImageElem.src = "resources/images/poke.gif";
        
        var messageContentElem = document.createTextNode(pokeImageElem);
        
        chatMessageElem.appendChild(messageContentElem);
        chatMessageRowElem.appendChild(chatMessageElem);
        chatMessagesElem.appendChild(chatMessageRowElem);
    },
    printOtherUserPartialTextMessage: function (ActionMessage) {
        console.log("printOtherUserPartialTextMessage...");
        
        var thisUserName, messageContent = "";
        var Message = {};
        Message = ActionMessage;
        messageContent = Message.content;
        thisUserName = Message.source;

        var chatMessagesElem = document.getElementsByClassName("chat__messages")[0];
        var chatMessageRowElem = document.createElement("div");
        chatMessageRowElem.className = "chat__msgRow";
        
        var chatMessageElem = document.createElement("div");
        chatMessageElem.className = "chat__message notMine typing";
        
        var userColour = GuGuGaGa.Utils.getUserColour(Message.source);
        if(userColour) {
            chatMessageElem.className += " " + userColour;         
        }
        
        if(messageContent) {
            var attrContentElem = document.createAttribute("data-content");
            attrContentElem.value = messageContent;
            chatMessageElem.setAttributeNode(attrContentElem);
        }
        
        // append loader
        var loaderElem = document.createElement("span");
        loaderElem.className = "loader";
        
        chatMessageElem.appendChild(loaderElem);
        
        chatMessageRowElem.appendChild(chatMessageElem);
        chatMessagesElem.appendChild(chatMessageRowElem);
    },
    updateOtherUserPartialTextMessage: function (elem, content) {
        console.log("updateOtherUserPartialTextMessage...");
        elem.setAttribute("data-content", "    " + content);           
    },
    updateUserView: function (user) {

        var username, commonName, imageUrl, time, colour = "";
        var connected = false;
        var User = {};

        User = user;
        username = User.username;
        commonName = User.commonName;
        imageUrl = User.imageUrl;
        time = User.startTime;
        connected = User.connected;
        colour = User.colour;
        var userElem = GuGuGaGa.Utils.getUserElem(username);
        
        if (commonName) {
            var userContactNameElem = document.querySelector(".contact[data-username='" + username + "'] .contact__name");
            userContactNameElem.setAttribute("data-common-name", commonName);
        }
        if (time) {
            userElem.setAttribute("data-time", time);
        }
        if (userElem && colour) {
            console.log("user colour: " + colour);
            userElem.setAttribute("data-colour", colour);
        }
        if (imageUrl) {
            var userImageElem = document.querySelector(".contact[data-username='" + username + "'] img");
            userImageElem.src = "data:image/jpeg;base64," + imageUrl;
        }
        this.updateUserConnectionStatus(username, connected);
    },
    clearUsersList: function() {
        var usersListElem = GuGuGaGa.Utils.getUsersListElem();
        while (usersListElem.firstChild) {
            usersListElem.removeChild(usersListElem.firstChild);
        }
    },
    updateUserConnectionStatus: function(username, isConnected) {
       
        var connectionStatusElem = document.querySelector(".contact[data-username='" + username + "'] span.contact__status");
        if (isConnected) {
            GuGuGaGa.Utils.addClassToElem("online", connectionStatusElem);
        } else {
            connectionStatusElem.classList.remove("online");
        }
        if ($(".chat").hasClass("active")) {
            this.updateChatStatus(username, isConnected);
        }
    },
    updateChatStatus: function (username, isConnected) {
        if ($(".chat__person").attr("data-username") === username) {
            if (isConnected) {
                 console.log("Set chat connected status: " + username + ", " + isConnected);
                $(".chat").addClass("online");
            } else {
                console.log("Set chat disconnected status: " + username + ", " + isConnected);
                $(".chat").removeClass("online");
            }
        }
    },
    printUserView: function (user) {
        var username, commonName, imageUrl, colour = "";
        var User = {};
        User = user;
        username = User.username;
        commonName = User.commonName;
        imageUrl = User.imageUrl;
        colour = User.colour;

        var otherUserElem = document.createElement("div");
        otherUserElem.className = "contact";

        var dataUsernameAttr = document.createAttribute("data-username");
        dataUsernameAttr.value = username;
        otherUserElem.setAttributeNode(dataUsernameAttr);

        var dataColourAttr = document.createAttribute("data-colour");
        if (colour) {
            dataColourAttr.value = colour;
        } else {
            dataColourAttr.value = GuGuGaGa.properties.defaultOtherUserColour;
        }
        otherUserElem.setAttributeNode(dataColourAttr);

        var otherUserImgElem = document.createElement("img");
        if (imageUrl) {
            otherUserImgElem.src = "data:image/jpeg;base64," + imageUrl;
        } else {
            otherUserImgElem.src = "data:image/png;base64,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";
        }
        otherUserImgElem.alt = "user icon" + commonName;
        otherUserImgElem.className = "contact__photo";
        otherUserImgElem.setAttribute("width", "48"); 
        otherUserImgElem.setAttribute("height", "48"); 
        
        otherUserElem.appendChild(otherUserImgElem);

        var userContactNameElem = document.createElement("span");
        userContactNameElem.className = "contact__name";
        var dataCommonNameAttr = document.createAttribute("data-common-name");
        dataCommonNameAttr.value = commonName;
        userContactNameElem.setAttributeNode(dataCommonNameAttr);
        otherUserElem.appendChild(userContactNameElem);

        var userConnectedStatusElem = document.createElement("span");
        userConnectedStatusElem.className = "contact__status";
        otherUserElem.appendChild(userConnectedStatusElem);
        var sidebarContentElem = document.getElementsByClassName("sidebar-content")[0];
        sidebarContentElem.appendChild(otherUserElem);

    },
    removePartialMessage: function() {
        var partialTextMessage = GuGuGaGa.Utils.getOtherUserPartialTextMessage();
        if(partialTextMessage) {
            // remove partialTextMessage
            partialTextMessage.parentNode.removeChild(partialTextMessage);
        }
    },
    stopTyping: function() {
        var typingElem = document.querySelector(".chat__message.typing");
        
//        var loaderElem = document.querySelector(".chat__message.typing .loader");
        
//        typingElem.removeChild(loaderElem);
//        typingElem.classList.remove("typing");
          typingElem.parentNode.removeChild(typingElem);
    },
    removeChatMessages: function() {
        var chatMessagesElem = document.querySelector(".chat__messages");
        while (chatMessagesElem.hasChildNodes()) {
            chatMessagesElem.removeChild(chatMessagesElem.lastChild);
        }
    }
};

GuGuGaGa.Utils = {
    getCurrentUsername: function () {
        return $("#user").data("username");
    },
    isCurrentUsername(username) {
        console.log("iscurrent username: " + (username && this.getCurrentUsername() === username));
        return (username && this.getCurrentUsername() === username);
    },
    setCurrentUsername: function (username) {
        console.log("Set current username " + username);
        document.getElementById("user").setAttribute("data-username", username);
    },
//    setCurrentUserColour: function (colour) {
//        $("#user").data("colour", colour);
//        console.log("Current user colour is now: " + colour);
//    },
    getUserColour: function (username) {
        var userElem = this.getUserElem(username);
        if(userElem) {
            return userElem.getAttribute("data-colour");
        } else {
            return null;
        }
        
    },
    getUsersListElem: function() {
       return document.getElementsByClassName("sidebar-content")[0];
    },
    getChatDOM: function () {
        var s = new XMLSerializer();
        return s.serializeToString($('#chat')[0]);
    },
    getUserElem: function (username) {
        return document.querySelector(".contact[data-username='" + username + "']");
    },
    getOtherUserImageElem: function (username) {
        return document.querySelector(".contact[data-username='" + username + "'] img");
    },
    addClassToElem: function (className, element) {
        var classesString;
        classesString = element.className || "";
        if (classesString.indexOf(className) === -1) {
            element.className += " " + className;
        }
    },
    getTargetUsername: function () {
        var targetElem = document.getElementById("chat-target-user");
        return targetElem.getAttribute("data-username");
    },
    isRelevantChatOpened: function(target,source) {
        var activeChatUser = document.getElementById("chat-target-user").getAttribute("data-username");
        if(!activeChatUser) return false;
        
        if(activeChatUser === target || activeChatUser === source) {
            return true;
        }
        else return false;
        
    },
    getOtherUserLastMessageElem: function() {
        var messagesElements = document.querySelectorAll(".notMine");
        return messagesElements[messagesElements.length-1];
    },
    getOtherUserPartialTextMessage: function() {
        return document.querySelector(".notMine.typing");
    }
};




$(document).ready(function () {
//    pin 'Enter key' action
//    
//    $('#messageInput').on('keyup', function (e) {
//        if (e.keyCode === 13) {
//            var message = $("#messageInput").val();
//            if (message.toString().length > 0) {
//                if (message.trim() === '') {
//                    JavaE.ActionEvent.textMessagePoke();
//                }
//                JavaE.ActionEvent.textMessage();
//                $("#messageInput").val('');
//            }
//        }
//    });

    //    pin 'Space key' action

//    $('#messageInput').on('keyup', function (e) {
//        if (e.keyCode === 32) {
//            var message = $("#messageInput").val();
//            if (message.toString().length > 0) {
//                if (message.trim() === '') {
//                    JavaE.ActionEvent.textMessagePoke();
//                }
//                JavaE.ActionEvent.textMessage();
//                $("#messageInput").val('');
//            }
//        }
//    });
    $("#logout").click(function () {
        GuGuGaGa.Socket.close();
    });

//-------------- Chunked data messaging --------------
    if (JavaESoftware) {
        JavaESoftware.Writer.submitData = function (chunk) {
            GuGuGaGa.ActionEvent.textMessage(chunk);
        };
        JavaESoftware.Writer.submitPartialData = function (chunk) {
            GuGuGaGa.ActionEvent.textPartialMessage(chunk);
        };
        JavaESoftware.Writer.notifyActive = function () {
            GuGuGaGa.ActionEvent.notifyStartPartialMessage();
        };
        JavaESoftware.Writer.notifyPassive = function () {
            GuGuGaGa.ActionEvent.notifyStopPartialMessage();
        };
    }

});

