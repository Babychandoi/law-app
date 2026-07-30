package org.law_app.document.domain;

/**
 * Lightweight information-classification marker used by retention, export and audit policies.
 * Values are intentionally stable because they are persisted in template versions.
 */
public enum DataClassification {
  PUBLIC,
  INTERNAL,
  CONFIDENTIAL,
  RESTRICTED
}
