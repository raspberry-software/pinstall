/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package software.raspberry.gugugaga.ws;

import javax.inject.Inject;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 *
 * @author JavaDev
 */
@ServerEndpoint(value = "/ws", configurator = GetHttpSessionConfigurator.class)
public class ChatServerEndpoint {

    @Inject
    ChatSessionHandler sessionHandler;
    

    @OnOpen
    public void onOpen(Session session) {
//        System.out.println("Open session " + session.getId());
        if (assertPrincipal(session)) sessionHandler.handleSecuredOnOpen(session);
    }

    @OnClose
    public void onClose(Session session) {
        System.out.println("Closing session... " + session.getId());
        System.out.println("This session should still be opened. Is is opened? " + session.getOpenSessions().contains(session));
        sessionHandler.handleOnClose(session);
    }

    @OnError
    public void onError(Throwable session) {
        System.out.println("onError " + session.getMessage() + "not implemented yet.");
    }

    @OnMessage
    public void onMessage(String message, Session session) {
        if (assertPrincipal(session)) {
            sessionHandler.handleMessage(session, message);
        } else {
            System.out.println("Not authorised access");
        }
    }

    /*
    * Mandatory method!!! 1) security 2) prevent null pointer exception in session handler
     */
    private boolean assertPrincipal(Session session) {
        return session.getUserPrincipal() != null && session.getUserPrincipal().getName() != null;
    }
    
    
}
