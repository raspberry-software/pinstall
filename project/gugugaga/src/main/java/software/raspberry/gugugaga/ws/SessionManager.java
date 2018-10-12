
package software.raspberry.gugugaga.ws;

import java.util.HashSet;
import java.util.Set;
import javax.websocket.Session;

/**
 *
 * @author JavaDev
 */
public class SessionManager {
    
    /*
    * @Return set of all unique connected usernames only, disconnected users are not contained.
     */
    public static java.util.Set<String> getConnectedUsernames(Session session) {
        final java.util.Set<String> connectedUsers = new java.util.HashSet<>();
        session.getOpenSessions().forEach((s) -> {
            connectedUsers.add(s.getUserPrincipal().getName());
        });

        return connectedUsers;
    }
    
    public static String getUserPrincipalName(Session session) {
        return session.getUserPrincipal().getName();
    }
    
    public static Set<String> connectedUsernames(Session session) {
        final Set<String> connectedUsernames = new HashSet<>();
        session.getOpenSessions().forEach(s -> {
            connectedUsernames.add(s.getUserPrincipal().getName());
        });
        return connectedUsernames;
    }
}
