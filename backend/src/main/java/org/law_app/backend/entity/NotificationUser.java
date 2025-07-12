    package org.law_app.backend.entity;

    import jakarta.persistence.*;
    import lombok.*;
    import lombok.experimental.FieldDefaults;
    import org.hibernate.annotations.CreationTimestamp;
    import org.springframework.data.jpa.domain.support.AuditingEntityListener;

    import java.util.Date;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Entity
    @EntityListeners(AuditingEntityListener.class)
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public class NotificationUser {
        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        String id; // Unique identifier for the notification user
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id", referencedColumnName = "id")
        User user; // Reference to the user associated with this notification
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "notification_id", referencedColumnName = "id")
        Notification notification; // Reference to the notification associated with this user
        boolean read; // Indicates whether the notification has been read by the user
        @CreationTimestamp
        Date createdAt; // Timestamp when the notification user was created
        Date readAt; // Timestamp when the notification was read by the user, if applicable
    }
