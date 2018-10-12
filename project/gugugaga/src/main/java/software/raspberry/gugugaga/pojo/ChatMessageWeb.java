/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package software.raspberry.gugugaga.pojo;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import software.raspberry.gugugaga.entity.ChatMessage;

/**
 *
 * @author JavaDev
 */
public class ChatMessageWeb extends ChatMessage {

    private String createdDate;
    private String createdTime;

    public void setCreatedTimeAndDate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdDate = now.format(DateTimeFormatter.ISO_LOCAL_DATE);
        this.createdTime = now.format(DateTimeFormatter.ofPattern("HH:mm a"));
    }

    public String getCreatedDate() {
        return createdDate;
    }

    public String getCreatedTime() {
        return createdTime;
    }
    
    
}
