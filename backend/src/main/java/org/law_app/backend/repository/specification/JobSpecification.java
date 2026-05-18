package org.law_app.backend.repository.specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.law_app.backend.entity.Job;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class JobSpecification {

    public static Specification<Job> searchJobs(String keywords, String category, String jobType, String location) {
        return (Root<Job> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tìm kiếm theo keywords (trong title hoặc company)
            if (keywords != null && !keywords.isEmpty()) {
                Predicate titlePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        "%" + keywords.toLowerCase() + "%"
                );
                predicates.add(criteriaBuilder.or(titlePredicate));
            }

            // Tìm kiếm theo category
            if (category != null && !category.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            // Tìm kiếm theo jobType
            if (jobType != null && !jobType.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("jobType"), jobType));
            }

            // Tìm kiếm theo location
            if (location != null && !location.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("location"), location));
            }

            // Kết hợp tất cả các điều kiện bằng AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
