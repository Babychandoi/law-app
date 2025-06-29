package org.law_app.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProcessDetail {
    @Id
    @GeneratedValue(strategy =  GenerationType.UUID)
    String id;
    String type;
    String desc;
    String time;
    String accuracy;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id")
    Process process;
}
