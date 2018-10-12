/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package software.raspberry.gugugaga.pojo;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

/**
 *
 * @author JavaDev
 */
public class ActionMessage implements Serializable {

    /*
    * text_message - send message to users
    * update_user - send user info 
    * update_user_list - send info of all connected users 
    * connect_successfull - only on open authorised connection, send back its username
    * ping_out: update other users of my connection status 
    * ping_me: update me about other users connection status 
    * info - send info to one user
     */
    public enum Name {
        text_message, update_user, update_users_list, update_connected_users, update_disconnected_users, ping_out, ping_in, connect_successfull, save_chat, info, connection_status
    }

    private String action;
    private String source;
    private String target;
    private Object content;
    private String created;
    private String sessionCount;

    private ActionMessage() {
    }

    public static ActionMessage fromJson(String json) {
        return new com.google.gson.Gson().fromJson(json, ActionMessage.class);
    }

    public String toJson() {
        return new com.google.gson.Gson().toJson(this);
    }

    public static class Builder {

        private String action;
        private final String source;
        private String target;
        private Object content;
        private String createdTime;

        public Builder(String source) {
            this.source = source;
        }

        public Builder action(Name action) {
            this.action = action.name();
            return this;
        }

        public Builder target(String target) {
            this.target = target;
            return this;
        }

        public Builder content(Object content) {
            this.content = content;
            return this;
        }

        public ActionMessage build() {
            ActionMessage am = new ActionMessage();
            am.source = this.source;
            am.action = this.action;
            am.target = this.target;
            am.content = this.content;
            am.created = getCurrentTime();

            return am;
        }

        private String getCurrentTime() {
            Date currentDate = Calendar.getInstance().getTime();
            SimpleDateFormat format = new SimpleDateFormat("h:mm a");
            return format.format(currentDate);
        }
    }

    public String getAction() {
        return action;
    }

    public String getSource() {
        return source;
    }

    public String getTarget() {
        return target;
    }

    public Object getContent() {
        return content;
    }

    public String getCreated() {
        if (created == null) {
            Date currentDate = Calendar.getInstance().getTime();
            SimpleDateFormat format = new SimpleDateFormat("h:mm a");
            created = format.format(currentDate);
        }
        return created;
    }

    public String getSessionCount() {
        return sessionCount;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public void setContent(Object content) {
        this.content = content;
    }
    
    

}
