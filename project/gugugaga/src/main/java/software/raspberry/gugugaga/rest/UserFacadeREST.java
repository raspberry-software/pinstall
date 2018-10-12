/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package software.raspberry.gugugaga.rest;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashSet;

import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.SecurityContext;
import software.raspberry.gugugaga.entity.User;

/**
 *
 * @author JavaDev
 */
@Stateless
@Path("users")
public class UserFacadeREST extends AbstractFacade<User> {

    @PersistenceContext(unitName = "software.raspberry_GuguGaga_war_1.0PU")
    private EntityManager em;

    @Inject
    UserConnectionFacadeREST connections;
    
    public UserFacadeREST() {
        super(User.class);
    }

    @POST
    @Override
    @Consumes({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public void create(User entity) {
        super.create(entity);
    }
    
    @POST
    @Path("edit")
    @Consumes({MediaType.APPLICATION_FORM_URLENCODED})
    public void createFromForm(
            @FormParam("password") String password,
            @FormParam("colour") String colour,
            @FormParam("imageUrl") String imgUrl,
            @Context SecurityContext sc) {

        if (sc.getUserPrincipal() != null && sc.getUserPrincipal().getName() != null) {
            final String username = sc.getUserPrincipal().getName();
            User entity = find(username);
            if (entity != null) {
                
                if(password != null) entity.setPassword(new PasswordHandler().encodeSHA256Password(password));
                if(colour != null) entity.setColour(colour);
                if(imgUrl != null) entity.setImageUrl(imgUrl);
            }
            super.edit(entity);
        }
    }

    @PUT
    @Path("{id}")
    @Consumes({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public void edit(@PathParam("id") String id, User entity) {
        super.edit(entity);
    }

    @DELETE
    @Path("{id}")
    public void remove(@PathParam("id") String id) {
        super.remove(super.find(id));
    }

    @GET
    @Path("{id}")
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public User find(@PathParam("id") String id) {
        return super.find(id);
    }
    
//    @GET
//    @Path("{username}")
//    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public Set<User> connections(@PathParam("username") String sourceUsername) {
        if (sourceUsername == null) return new HashSet<>();
        else return findConnectionByUser(sourceUsername);
    }

    @GET
    @Override
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public List<User> findAll() {
        return super.findAll();
    }

    @GET
    @Path("{from}/{to}")
    @Produces({MediaType.APPLICATION_XML, MediaType.APPLICATION_JSON})
    public List<User> findRange(@PathParam("from") Integer from, @PathParam("to") Integer to) {
        return super.findRange(new int[]{from, to});
    }

    @GET
    @Path("count")
    @Produces(MediaType.TEXT_PLAIN)
    public String countREST() {
        return String.valueOf(super.count());
    }

    @Override
    protected EntityManager getEntityManager() {
        return em;
    }

    private Set<User> findConnectionByUser(String sourceUsername) {
        final Set<User> targetUsers = new HashSet<>();
        final List<String> connectionList = this.connections.findTargetUsernames(sourceUsername);
        connectionList.stream().forEach(u -> {
            targetUsers.add(this.find(u));
        });
        
        return targetUsers;
    }
    
    
    class PasswordHandler {

        private String encodeSHA256Password(final String originalString) {
            StringBuilder sb = new StringBuilder();
            try {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                digest.reset();
                byte[] encodedhash = digest.digest(originalString.getBytes(StandardCharsets.UTF_8));

                // encode string
                for (int i = 0; i < encodedhash.length; i++) {
                    sb.append(Integer.toString((encodedhash[i] & 0xff) + 0x100, 16).substring(1));
                }

            } catch (NoSuchAlgorithmException ex) {
                Logger.getLogger(UserFacadeREST.class.getName()).log(Level.SEVERE, null, ex);
            }
            return sb.toString();
        }
    }
    
}
