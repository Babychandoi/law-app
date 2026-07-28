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
@Table(
    indexes = {
      @Index(name = "idx_children_services_parent", columnList = "parent_service_id"),
      @Index(name = "idx_children_services_title", columnList = "title")
    })
@EntityListeners(AuditingEntityListener.class)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChildrenServices {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  String title;
  String href;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_service_id")
  Services parentService;

  String description;
  String icon;
  String image;
  String descriptionHome;
}
