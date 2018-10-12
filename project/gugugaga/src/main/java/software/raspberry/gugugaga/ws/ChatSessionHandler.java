package software.raspberry.gugugaga.ws;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import javax.ejb.EJB;
import javax.enterprise.context.ApplicationScoped;
import javax.websocket.Session;
import software.raspberry.gugugaga.entity.ChatMessage;
import software.raspberry.gugugaga.pojo.ActionMessage;
import software.raspberry.gugugaga.rest.ChatMessageFacadeREST;
import software.raspberry.gugugaga.rest.UserConnectionFacadeREST;
import software.raspberry.gugugaga.rest.UserFacadeREST;

/**
 * @author JavaDev
 *
 */
@ApplicationScoped
public class ChatSessionHandler {

    @EJB
    private UserFacadeREST userFacade;
    
    @EJB
    private UserConnectionFacadeREST userConnectionFacade;

    @EJB
    private ChatMessageFacadeREST chatMessageFacade;

    
    /*
    @param 
     */
    public void handleMessage(Session session, String message) {

        // append username
        final String source = session.getUserPrincipal().getName();
        final ActionMessage actionMessage = ActionMessage.fromJson(message);        
        actionMessage.setSource(source);

        switch (actionMessage.getAction()) {
            case "start_partial_text_message": {
                forwardMessageToTarget(session, actionMessage);
            }
            break;
            case "stop_partial_text_message": {
                forwardMessageToTarget(session, actionMessage);
            }
            break;
            case "text_partial_message": {
                forwardMessageToTarget(session, actionMessage);
            }
            break;
            case "text_message": {
                final ChatMessage chatMessage = createChatMessage(session, actionMessage);
                
                forwardMessageToSourceAndTarget(session, actionMessage);
                saveChatMessage(chatMessage);
            }
            break;
            case "text_message_poke": {
                forwardMessageToTarget(session, actionMessage);
            }
            break;
            case "load_chat": {
                appendChatLastTextMessage(session, actionMessage);
                forwardMessageToSource(session, actionMessage);
            }
            break;
            case "update_users_list" : {
                actionMessage.setContent(userFacade.connections(source));
                forwardMessageToSource(session, actionMessage);
            }
            break;
            /*
            Send to all other sessions that have connectin with this user info that is connected
            */
            case "ping_out" : {
                System.out.println("Ping out... " + source);
                final List<String> targetUsernames = userConnectionFacade.findTargetUsernames(source);
                final String connStatusMessage = new ActionMessage.Builder(source)
                                .action(ActionMessage.Name.connection_status)
                                .content(actionMessage.getContent())
                                .build()
                        .toJson();
                
                session.getOpenSessions().stream()
                        .filter( s -> targetUsernames.contains(s.getUserPrincipal().getName()))
                        .forEach(s -> {
                            System.out.println("Sending ping out message...");
                            sendToOneSession(s, connStatusMessage);
                        });
            }
            // Send to this session 1) list of connected relevant users 2) list of disconnected relevant users
            case "ping_in" : {
                
                final List<String> targetUsernames = userConnectionFacade.findTargetUsernames(source);
                List<String> activeTargetUsernames = session.getOpenSessions().stream()
                        .filter( s -> targetUsernames.contains(s.getUserPrincipal().getName()))
                        .map( s -> s.getUserPrincipal().getName())
                        .distinct()
                        .collect(Collectors.toList());
                
                List<String> nonActiveTargetUsernames = targetUsernames;
                nonActiveTargetUsernames.removeIf(u -> activeTargetUsernames.contains(u));
                

                if ( !activeTargetUsernames.isEmpty()) {
                    final String updateConnectedUsersMessage = new ActionMessage.Builder(source)
                            .action(ActionMessage.Name.update_connected_users)
                            .content(activeTargetUsernames)
                            .build()
                            .toJson();
                    sendToOneSession(session, updateConnectedUsersMessage);
                }
                if ( !nonActiveTargetUsernames.isEmpty()) {
                    final String updateDisonnectedUsersMessage = new ActionMessage.Builder(source)
                            .action(ActionMessage.Name.update_disconnected_users)
                            .content(nonActiveTargetUsernames)
                            .build()
                            .toJson();
                    sendToOneSession(session, updateDisonnectedUsersMessage);
                }
            }
            break;
            default:
                System.out.println("No action found");
                break;
        }
    }

    private void sendToOneSession(Session session, String message) {
        try {
            session.getBasicRemote().sendText(message);
        } catch (IOException ex) {
            Logger.getLogger(ChatSessionHandler.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    private void sendToAllOpenedSessions(Session session, String message) {
        session.getOpenSessions().forEach((s) -> {
            System.out.println("Send to session:" + s.getId());
            sendToOneSession(s, message);
        });
    }

    void handleSecuredOnOpen(final Session session) {
        // message for connected user
        // send info about all connected users
        sendBackConnectedMessage(session);
 
    }

    void handleOnClose(Session session) {
        handleDisconnectedStatus(session);
    }

    /*
    * If not other session of this user exist, then
    * send ping_out -> false message
     */
    private void handleDisconnectedStatus(final Session session) {
        System.out.println("handleDisconnectedStatus");
        System.out.println("Name: " + session.getUserPrincipal().getName());
        System.out.println("Other opened sessions: " + session.getOpenSessions().size());
        
        
        final String disconnectedSessionUsername = session.getUserPrincipal().getName();
        // Find any session other than this of the same user
        Optional<Session> otherOpenedSession = session.getOpenSessions().stream()
                .filter(s -> s != session && s.getUserPrincipal().getName().equals(disconnectedSessionUsername))
                .findAny();
        
        if (!otherOpenedSession.isPresent()) {

            String pingOutMessage = new ActionMessage.Builder(disconnectedSessionUsername)
                    .action(ActionMessage.Name.ping_out)
                    .content(false)
                    .build()
                    .toJson();
            handleMessage(session, pingOutMessage);
        }
    }



    /*
    * Send message back to the session its username.
     */
    private void sendBackConnectedMessage(Session session) {
        ActionMessage actionMessage = new ActionMessage.Builder(session.getUserPrincipal().getName())
                .action(ActionMessage.Name.connect_successfull)
                .build();

        sendToOneSession(session, actionMessage.toJson());
    }

    private ChatMessage createChatMessage(final Session session, ActionMessage actionMessage) {
        final ChatMessage textMessage = new ChatMessage();
        textMessage.setContent((String) actionMessage.getContent());
        textMessage.setSource(SessionManager.getUserPrincipalName(session));
        textMessage.setTarget(actionMessage.getTarget());
        textMessage.setCreated(System.currentTimeMillis()+"");
        return textMessage;
    }
    
    private void appendChatLastTextMessage(final Session session, ActionMessage actionMessage) {
        final String sourceUser = SessionManager.getUserPrincipalName(session);
        final String targetUser = getTargetUsername(actionMessage);
////        final String todaysDate = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE);
//        
        ChatMessage chatMessage = chatMessageFacade.findLastMessage(sourceUser, targetUser);
        actionMessage.setContent(chatMessage);
        
    }

    private void forwardMessageToSource(final Session session, ActionMessage actionMessage) {
        // send message to all
        // if target exist forward to source and target 
        sentToSourceSessions(session, actionMessage.toJson());
    }
    private void forwardMessageToTarget(final Session session, ActionMessage actionMessage) {
        // send message to all
        // if target exist forward to source and target 
        final String targetUser = actionMessage.getTarget();

        sentToTargetSessions(session, targetUser, actionMessage.toJson());
    }
    
    private void forwardMessageToSourceAndTarget(final Session session, ActionMessage actionMessage) {
        // send message to all
        // if target exist forward to source and target 
        final String targetUser = getTargetUsername(actionMessage);

        sentToSourceAndTargetSessions(session, targetUser, actionMessage.toJson());
    }

    private void saveChatMessage(ChatMessage entity) {
        // persist chat message
        System.out.println("Create chat message");
        if(entity != null) chatMessageFacade.create(entity);

    }




    private void sentToSourceAndTargetSessions(Session session, String targetUsername, final String message) {
        final String sourceUsername = session.getUserPrincipal().getName();
        final Set<Session> openedSessions = session.getOpenSessions();
        openedSessions.forEach((s) -> {
            final String sessionUsername = s.getUserPrincipal().getName();
            if (targetUsername.equals(sessionUsername) || sourceUsername.equals(sessionUsername)) {
                sendToOneSession(s, message);
            }

        });
    }
    private void sentToTargetSessions(Session session, String targetUsername, final String message) {
        final Set<Session> openedSessions = session.getOpenSessions();
        openedSessions.forEach((s) -> {
            final String sessionUsername = s.getUserPrincipal().getName();
            if (targetUsername.equals(sessionUsername)) {
                sendToOneSession(s, message);
            }

        });
    }
    private void sentToSourceSessions(Session session, final String message) {
        final String sourceUsername = session.getUserPrincipal().getName();
        final Set<Session> openedSessions = session.getOpenSessions();
        
        openedSessions.forEach((s) -> {
            final String sessionUsername = s.getUserPrincipal().getName();
            if (sourceUsername.equals(sessionUsername)) {
                sendToOneSession(s, message);
            }

        });
    }

    
//    private String getSourceUsername(final Session session) {
//        return session.getUserPrincipal().getName();
//    }

    private String getTargetUsername(final ActionMessage actionMessage) {
        String username = "";
        if(actionMessage != null) username = actionMessage.getTarget();
        
        return username;
    }

    

}
