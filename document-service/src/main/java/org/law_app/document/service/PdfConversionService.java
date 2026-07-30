package org.law_app.document.service;

import java.nio.charset.StandardCharsets;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

/**
 * Chuyển DOCX -> PDF qua dịch vụ Gotenberg (LibreOffice headless sau HTTP), giữ fidelity cho hợp
 * đồng pháp lý mà không phải nhúng LibreOffice vào image. Tắt mặc định (flag) để deploy không đổi
 * hành vi cho tới khi operator bật + chạy Gotenberg.
 */
@Slf4j
@Service
public class PdfConversionService {

  private final boolean enabled;
  private final String gotenbergUrl;
  private final RestClient restClient;

  public PdfConversionService(
      @Value("${document.pdf.enabled:false}") boolean enabled,
      @Value("${document.pdf.gotenberg-url:http://gotenberg:3000}") String gotenbergUrl) {
    this.enabled = enabled;
    this.gotenbergUrl = gotenbergUrl;
    this.restClient = RestClient.builder().baseUrl(gotenbergUrl).build();
  }

  public boolean isEnabled() {
    return enabled;
  }

  /** Chuyển nội dung DOCX sang PDF. Ném lỗi rõ ràng khi tính năng chưa bật hoặc dịch vụ lỗi. */
  public byte[] toPdf(byte[] docx, String fileName) {
    if (!enabled) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "Xuất PDF chưa được bật trên hệ thống");
    }
    String docxName = fileName == null || fileName.isBlank() ? "document.docx" : fileName;
    MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
    body.add(
        "files",
        new ByteArrayResource(docx) {
          @Override
          public String getFilename() {
            return docxName;
          }
        });
    try {
      ResponseEntity<byte[]> response =
          restClient
              .post()
              .uri("/forms/libreoffice/convert")
              .contentType(MediaType.MULTIPART_FORM_DATA)
              .body(body)
              .retrieve()
              .toEntity(byte[].class);
      byte[] pdf = response.getBody();
      if (pdf == null || pdf.length == 0) {
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Dịch vụ PDF trả về rỗng");
      }
      return pdf;
    } catch (ResponseStatusException e) {
      throw e;
    } catch (Exception e) {
      log.error(
          "PDF conversion via Gotenberg {} failed: {}", gotenbergUrl, e.getClass().getSimpleName());
      throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Không chuyển đổi được sang PDF");
    }
  }

  /** Đổi đuôi .docx -> .pdf cho tên file tải xuống. */
  public static String pdfFileName(String docxFileName) {
    if (docxFileName == null || docxFileName.isBlank()) return "document.pdf";
    String base = docxFileName.replaceAll("(?i)\\.docx$", "");
    return new String(base.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8) + ".pdf";
  }
}
