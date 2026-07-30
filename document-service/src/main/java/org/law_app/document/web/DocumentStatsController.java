package org.law_app.document.web;

import lombok.RequiredArgsConstructor;
import org.law_app.document.service.DocumentStatsService;
import org.law_app.document.web.Dtos.DocumentStatsResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/documents/stats")
@RequiredArgsConstructor
public class DocumentStatsController {

  private final DocumentStatsService service;

  @GetMapping
  public ApiResponse<DocumentStatsResponse> stats() {
    return ApiResponse.ok(service.stats());
  }
}
