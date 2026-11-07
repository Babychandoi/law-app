package org.law_app.document.domain;

/** Controlled lifecycle for a generated legal document. */
public enum DocumentWorkflowStatus {
  DRAFT,
  IN_REVIEW,
  APPROVED,
  REJECTED,
  FINAL,
  VOID
}
