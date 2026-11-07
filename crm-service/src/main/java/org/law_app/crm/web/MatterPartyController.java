package org.law_app.crm.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.service.MatterPartyService;
import org.law_app.crm.web.MatterPartyDtos.CreatePartyRequest;
import org.law_app.crm.web.MatterPartyDtos.PageMeta;
import org.law_app.crm.web.MatterPartyDtos.PartyView;
import org.law_app.crm.web.MatterPartyDtos.UpdatePartyRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/crm/cases/{caseId}/parties")
@RequiredArgsConstructor
public class MatterPartyController {

  private static final CacheControl PII_CACHE_CONTROL = CacheControl.noStore();

  private final MatterPartyService partyService;

  @PostMapping
  public ResponseEntity<ApiResponse<PartyView>> create(
      @PathVariable @NotBlank @Size(max = 36) String caseId,
      @Valid @RequestBody CreatePartyRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .cacheControl(PII_CACHE_CONTROL)
        .body(
            ApiResponse.<PartyView>builder()
                .code(HttpStatus.CREATED.value())
                .data(partyService.create(caseId, request))
                .build());
  }

  @GetMapping
  public ResponseEntity<ApiResponse<java.util.List<PartyView>>> list(
      @PathVariable @NotBlank @Size(max = 36) String caseId,
      @RequestParam(defaultValue = "false") boolean includeArchived,
      @RequestParam(defaultValue = "0") @Min(0) int page,
      @RequestParam(defaultValue = "30") @Min(1) @Max(100) int size) {
    PageRequest pageable =
        PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
    Page<PartyView> result = partyService.list(caseId, includeArchived, pageable);
    ApiResponse<java.util.List<PartyView>> body =
        ApiResponse.<java.util.List<PartyView>>builder()
            .code(HttpStatus.OK.value())
            .data(result.getContent())
            .meta(
                new PageMeta(
                    result.getNumber(),
                    result.getSize(),
                    result.getTotalElements(),
                    result.getTotalPages()))
            .build();
    return ResponseEntity.ok().cacheControl(PII_CACHE_CONTROL).body(body);
  }

  @GetMapping("/{partyId}")
  public ResponseEntity<ApiResponse<PartyView>> get(
      @PathVariable @NotBlank @Size(max = 36) String caseId,
      @PathVariable @NotBlank @Size(max = 36) String partyId) {
    return protectedOk(partyService.get(caseId, partyId));
  }

  @PutMapping("/{partyId}")
  public ResponseEntity<ApiResponse<PartyView>> update(
      @PathVariable @NotBlank @Size(max = 36) String caseId,
      @PathVariable @NotBlank @Size(max = 36) String partyId,
      @Valid @RequestBody UpdatePartyRequest request) {
    return protectedOk(partyService.update(caseId, partyId, request));
  }

  /**
   * REST delete semantics with recoverable storage: this marks the row archived and never performs
   * a physical delete. The expected revision makes concurrent requests safe.
   */
  @DeleteMapping("/{partyId}")
  public ResponseEntity<ApiResponse<PartyView>> archive(
      @PathVariable @NotBlank @Size(max = 36) String caseId,
      @PathVariable @NotBlank @Size(max = 36) String partyId,
      @RequestParam @Min(0) long revision) {
    return protectedOk(partyService.archive(caseId, partyId, revision));
  }

  private ResponseEntity<ApiResponse<PartyView>> protectedOk(PartyView data) {
    return ResponseEntity.ok().cacheControl(PII_CACHE_CONTROL).body(ApiResponse.ok(data));
  }
}
