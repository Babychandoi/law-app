package org.law_app.crm.web;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.law_app.crm.service.CrmCatalogService;
import org.law_app.crm.web.EnterpriseCrmDtos.ServiceCatalogItem;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/crm/catalog")
@RequiredArgsConstructor
public class CrmCatalogController {

  private final CrmCatalogService catalogService;

  @GetMapping("/services")
  public ApiResponse<List<ServiceCatalogItem>> services() {
    return ApiResponse.ok(catalogService.listServices());
  }
}
