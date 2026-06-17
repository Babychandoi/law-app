package org.law_app.crm.repository;

import org.law_app.crm.domain.CrmCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CrmCaseRepository
    extends JpaRepository<CrmCase, String>, JpaSpecificationExecutor<CrmCase> {}
