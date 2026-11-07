package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** P2.1: xuất PDF — tắt mặc định, đổi đuôi tên file đúng. */
class PdfConversionServiceTest {

  @Test
  void throwsWhenDisabled() {
    PdfConversionService service = new PdfConversionService(false, "http://gotenberg:3000");
    assertThat(service.isEnabled()).isFalse();
    assertThatThrownBy(() -> service.toPdf(new byte[] {1, 2, 3}, "hop-dong.docx"))
        .isInstanceOf(ResponseStatusException.class)
        .satisfies(
            e ->
                assertThat(((ResponseStatusException) e).getStatusCode())
                    .isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
  }

  @Test
  void derivesPdfFileName() {
    assertThat(PdfConversionService.pdfFileName("Hợp đồng.docx")).isEqualTo("Hợp đồng.pdf");
    assertThat(PdfConversionService.pdfFileName("a.DOCX")).isEqualTo("a.pdf");
    assertThat(PdfConversionService.pdfFileName(null)).isEqualTo("document.pdf");
  }
}
