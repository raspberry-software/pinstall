/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package software.raspberry.gugugaga.bean;

import java.io.Serializable;
import java.util.List;
import java.util.Set;
import javax.inject.Named;
import javax.enterprise.context.SessionScoped;
import javax.faces.context.FacesContext;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import software.raspberry.gugugaga.entity.User;
import software.raspberry.gugugaga.rest.UserFacadeREST;

/**
 *
 * @author JavaDev
 */
@Named(value = "usersconn")
@SessionScoped
public class UserConnectionsBean implements Serializable {

    @Inject
    UserFacadeREST userFacade;

    private User targetUser;

    /**
     * Creates a new instance of NewJSFManagedBean
     */
    public UserConnectionsBean() {
        
    }
    
    public Set<User> getConnections() {
        final String myUsername = FacesContext.getCurrentInstance().getExternalContext().getUserPrincipal().getName();
        HttpServletRequest request=(HttpServletRequest)FacesContext.getCurrentInstance().getExternalContext().getRequest();
        
        return userFacade.connections(myUsername);
        
    }
    
    public String goToChat(String targetUsername) {
        setTargetUser(userFacade.find(targetUsername));
        return "chat";
    }

    public User getTargetUser() {
        return targetUser;
    }

    public void setTargetUser(User targetUser) {
        this.targetUser = targetUser;
    }
    
    
    
}
