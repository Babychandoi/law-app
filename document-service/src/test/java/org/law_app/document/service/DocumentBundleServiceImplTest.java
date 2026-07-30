package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.law_app.document.domain.DocumentBundle;
import org.law_app.document.domain.DocumentBundle.BundleItem;
import org.law_app.document.domain.DocumentTemplateStatus;
import org.law_app.document.repository.DocumentBundleRepository;
import org.law_app.document.repository.DocumentTemplateRepository;
import org.law_app.document.web.Dtos.GenerateBundleItemRequest;
import org.law_app.document.web.Dtos.GenerateBundleRequest;
import org.law_app.document.web.Dtos.GenerateBundleResponse;
import org.law_app.document.web.Dtos.GenerateDocumentRequest;
import org.law_app.document.web.Dtos.GeneratedDocumentResponse;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** P1.5: sinh cả bộ — trộn dữ liệu chung + riêng, đúng thứ tự, lỗi 1 mẫu không chặn cả bộ. */
@ExtendWith(MockitoExtension.class)
class DocumentBundleServiceImplTest {

  @Mock private DocumentBundleRepository bundleRepository;
  @Mock private DocumentTemplateRepository templateRepository;
  @Mock private GeneratedDocumentService generatedDocumentService;
  @Mock private DocumentAuditService auditService;

  @InjectMocks private DocumentBundleServiceImpl service;

  @Test
  void generatesEachTemplateMergingSharedAndPerItemValuesAndContinuesOnError() {
    DocumentBundle bundle =
        DocumentBundle.builder()
            .id("bundle-1")
            .status(DocumentTemplateStatus.ACTIVE)
            .items(
                List.of(
                    BundleItem.builder().templateId("tA").sortOrder(0).required(true).build(),
                    BundleItem.builder().templateId("tB").sortOrder(1).required(false).build()))
            .build();
    when(bundleRepository.findById("bundle-1")).thenReturn(Optional.of(bundle));

    GeneratedDocumentResponse docA =
        new GeneratedDocumentResponse(
            "gen-A", "tA", null, null, 0, null, null, "a.docx", null, null, null, null, null, null,
            null, null, null, null, null, null, null, null);
    when(generatedDocumentService.generate(eq("tA"), any(), any())).thenReturn(docA);
    when(generatedDocumentService.generate(eq("tB"), any(), any()))
        .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu giá trị"));

    GenerateBundleRequest request =
        new GenerateBundleRequest(
            Map.of("common", "X"),
            List.of(new GenerateBundleItemRequest("tA", Map.of("a", "1"), null)),
            null);

    GenerateBundleResponse response = service.generate("bundle-1", request, null);

    assertThat(response.total()).isEqualTo(2);
    assertThat(response.succeeded()).isEqualTo(1);
    assertThat(response.failed()).isEqualTo(1);
    assertThat(response.results().get(0).templateId()).isEqualTo("tA");
    assertThat(response.results().get(0).document()).isSameAs(docA);
    assertThat(response.results().get(1).templateId()).isEqualTo("tB");
    assertThat(response.results().get(1).error()).isEqualTo("Thiếu giá trị");

    ArgumentCaptor<GenerateDocumentRequest> captor =
        ArgumentCaptor.forClass(GenerateDocumentRequest.class);
    org.mockito.Mockito.verify(generatedDocumentService)
        .generate(eq("tA"), captor.capture(), any());
    assertThat(captor.getValue().values()).containsEntry("common", "X").containsEntry("a", "1");
  }
}
