package ecse424.mcgill.ca.ambient_academic_campass;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class Deadline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDateTime dueAt;
    private boolean completed;
    private boolean pinned;
    private Integer iconIndex;
    private Integer colorIndex;
    private boolean notificationEnabled;
    private Integer notificationMinutesBefore;
    private boolean widget;

    public Deadline() {}

    public Deadline(String title, String description, LocalDateTime dueAt, boolean completed, boolean pinned) {
        this.title = title;
        this.description = description;
        this.dueAt = dueAt;
        this.completed = completed;
        this.pinned = pinned;
        this.iconIndex = 0;
        this.colorIndex = 0;
        this.notificationEnabled = false;
        this.notificationMinutesBefore = null;
        this.widget = false;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public void setDueAt(LocalDateTime dueAt) {
        this.dueAt = dueAt;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public boolean isPinned() {
        return pinned;
    }

    public void setPinned(boolean pinned) {
        this.pinned = pinned;
    }

    public Integer getIconIndex() {
        return iconIndex;
    }

    public void setIconIndex(Integer iconIndex) {
        this.iconIndex = iconIndex;
    }

    public Integer getColorIndex() {
        return colorIndex;
    }

    public void setColorIndex(Integer colorIndex) {
        this.colorIndex = colorIndex;
    }

    public boolean isNotificationEnabled() {
        return notificationEnabled;
    }

    public void setNotificationEnabled(boolean notificationEnabled) {
        this.notificationEnabled = notificationEnabled;
    }

    public Integer getNotificationMinutesBefore() {
        return notificationMinutesBefore;
    }

    public void setNotificationMinutesBefore(Integer notificationMinutesBefore) {
        this.notificationMinutesBefore = notificationMinutesBefore;
    }

    public boolean isWidget() {
        return widget;
    }

    public void setWidget(boolean widgetEnabled) {
        this.widget = widgetEnabled;
    }
}
