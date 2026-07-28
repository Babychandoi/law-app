package org.law_app.crm.web;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.domain.CareAction;
import org.law_app.crm.domain.CareResult;
import org.law_app.crm.domain.CareStatus;
import org.law_app.crm.domain.Tag;
import org.law_app.crm.repository.CareActionRepository;
import org.law_app.crm.repository.CareResultRepository;
import org.law_app.crm.repository.CareStatusRepository;
import org.law_app.crm.repository.TagRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** CRUD for the care workflow config (admin only for writes). */
@RestController
@RequestMapping("/crm/config")
@RequiredArgsConstructor
public class CrmConfigController {

  private final CareStatusRepository careStatusRepo;
  private final CareActionRepository careActionRepo;
  private final CareResultRepository careResultRepo;
  private final TagRepository tagRepo;

  // ---- Care statuses ----
  @GetMapping("/care-statuses")
  public ApiResponse<List<CareStatus>> statuses() {
    return ApiResponse.ok(careStatusRepo.findAllByOrderBySortOrderAsc());
  }

  @PostMapping("/care-statuses")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<CareStatus> createStatus(@RequestBody CareStatus body) {
    body.setId(null);
    return ApiResponse.ok(careStatusRepo.save(body));
  }

  @PutMapping("/care-statuses/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<CareStatus> updateStatus(@PathVariable Long id, @RequestBody CareStatus body) {
    body.setId(id);
    return ApiResponse.ok(careStatusRepo.save(body));
  }

  // ---- Care actions ----
  @GetMapping("/care-actions")
  public ApiResponse<List<CareAction>> actions() {
    return ApiResponse.ok(careActionRepo.findAllByOrderBySortOrderAsc());
  }

  @PostMapping("/care-actions")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<CareAction> createAction(@RequestBody CareAction body) {
    body.setId(null);
    return ApiResponse.ok(careActionRepo.save(body));
  }

  @PutMapping("/care-actions/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<CareAction> updateAction(@PathVariable Long id, @RequestBody CareAction body) {
    body.setId(id);
    return ApiResponse.ok(careActionRepo.save(body));
  }

  // ---- Care results ----
  @GetMapping("/care-results")
  public ApiResponse<List<CareResult>> results() {
    return ApiResponse.ok(careResultRepo.findAllByOrderBySortOrderAsc());
  }

  @PostMapping("/care-results")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<CareResult> createResult(@RequestBody CareResult body) {
    body.setId(null);
    return ApiResponse.ok(careResultRepo.save(body));
  }

  @PutMapping("/care-results/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<CareResult> updateResult(@PathVariable Long id, @RequestBody CareResult body) {
    body.setId(id);
    return ApiResponse.ok(careResultRepo.save(body));
  }

  // ---- Tags ----
  @GetMapping("/tags")
  public ApiResponse<List<Tag>> tags() {
    return ApiResponse.ok(tagRepo.findAll());
  }

  @PostMapping("/tags")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<Tag> createTag(@RequestBody Tag body) {
    body.setId(null);
    return ApiResponse.ok(tagRepo.save(body));
  }

  @PutMapping("/tags/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<Tag> updateTag(@PathVariable Long id, @RequestBody Tag body) {
    body.setId(id);
    return ApiResponse.ok(tagRepo.save(body));
  }
}
