package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class VietnameseDateTest {

  @Test
  void formatsIsoDateToVietnamese() {
    assertThat(VietnameseDate.format("2026-07-05")).isEqualTo("ngày 05 tháng 07 năm 2026");
    assertThat(VietnameseDate.format("2026-12-31")).isEqualTo("ngày 31 tháng 12 năm 2026");
  }

  @Test
  void blankOrInvalidReturnsEmpty() {
    assertThat(VietnameseDate.format("")).isEmpty();
    assertThat(VietnameseDate.format(null)).isEmpty();
    assertThat(VietnameseDate.format("05/07/2026")).isEmpty();
    assertThat(VietnameseDate.format("abc")).isEmpty();
  }

  @Test
  void derivedKeyAppendsSuffix() {
    assertThat(VietnameseDate.derivedKey("signDate")).isEqualTo("signDate_vi");
  }
}
