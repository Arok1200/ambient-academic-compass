package ecse424.mcgill.ca.ambient_academic_campass;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "notes")
public class Note {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private String author;
    
    private Integer colorIndex;

    // Constructors
    public Note() {
        this.author = "Anonymous";
        this.colorIndex = 0;
    }

    public Note(String content, String author, Integer colorIndex) {
        this.content = content;
        this.author = author != null ? author : "Anonymous";
        this.colorIndex = colorIndex != null ? colorIndex : 0;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public Integer getColorIndex() {
        return colorIndex;
    }

    public void setColorIndex(Integer colorIndex) {
        this.colorIndex = colorIndex;
    }
}
