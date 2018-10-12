/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package software.raspberry.gugugaga.entity;

import java.io.Serializable;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author JavaDev
 */
@Entity
@Table(name = "CHAT_MESSAGE")
@NamedQueries({
    @NamedQuery(name = "ChatMessage.findByUsers",
            query = "SELECT m FROM ChatMessage m WHERE m.target = :target1 OR m.target = :target2 AND m.created = :date"),
    @NamedQuery(name = "ChatMessage.findLastMessages",
            query = "SELECT m FROM ChatMessage m WHERE m.source = :source AND m.target = :target ORDER BY m.created DESC")
}
)

@XmlRootElement
public class ChatMessage implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @SequenceGenerator(name = "chatSeqGen", sequenceName = "CHAT_SEQUENCE", initialValue = 10, allocationSize = 10)
    @GeneratedValue(generator = "chatSeqGen", strategy = GenerationType.SEQUENCE)
    @Column(name="id")
    private Integer id;
    
    @Column(name = "content")
    private String content;
    
    @Column(name = "source_username")
    private String source;
    
    @Column(name = "target_username")
    private String target;
    
    
    @Column(name = "created")
    private String created;
    
            
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCreated() {
        return created;
    }

    public void setCreated(String created) {
        this.created = created;
    }
    
    
    
    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof ChatMessage)) {
            return false;
        }
        ChatMessage other = (ChatMessage) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "software.javae.entity.ChatMessage[ id=" + id + " ]";
    }

}
