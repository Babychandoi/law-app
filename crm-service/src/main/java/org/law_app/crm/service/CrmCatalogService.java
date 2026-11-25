package org.law_app.crm.service;

import java.math.BigDecimal;
import java.util.List;
import org.law_app.crm.web.EnterpriseCrmDtos.ServiceCatalogItem;
import org.springframework.stereotype.Service;

/** Canonical service catalog for Luật Poip Legal (IP, corporate, licensing & legal advisory). */
@Service
public class CrmCatalogService {

  private static final List<ServiceCatalogItem> CATALOG =
      List.of(
          item("SHTT-NH", "Đăng ký nhãn hiệu", "Sở hữu trí tuệ", "Nhãn/nhóm", "2400000", "5%"),
          item("SHTT-BQ", "Bản quyền tác giả", "Sở hữu trí tuệ", "Tác phẩm", "2400000", "5%"),
          item("PL-PNN", "Phụ lục_Phí NN", "Sở hữu trí tuệ", "Hồ sơ", "100000", "KCT"),
          item("SHTT-KD", "Kiểu dáng công nghiệp", "Sở hữu trí tuệ", "Đơn", "3500000", "5%"),
          item("SHTT-SC", "Đăng ký sáng chế", "Sở hữu trí tuệ", "Đơn", "6500000", "5%"),
          item("DN-TL", "Thành lập doanh nghiệp", "Doanh nghiệp", "Hồ sơ", "2500000", "8%"),
          item("DN-DKKD", "Thay đổi ĐKKD", "Doanh nghiệp", "Hồ sơ", "1500000", "8%"),
          item("DN-TNDN", "Tạm ngừng DN", "Doanh nghiệp", "Hồ sơ", "1200000", "8%"),
          item("GP-WEB", "Thông báo website", "Website", "Website", "2000000", "8%"),
          item(
              "GP-ATTP", "Giấy phép ATTP / Công bố TPCN", "Giấy phép", "Sản phẩm", "4500000", "8%"),
          item("GP-CBMP", "Công bố mỹ phẩm nhập khẩu", "Giấy phép", "Sản phẩm", "3000000", "8%"),
          item(
              "PL-TVTX",
              "Tư vấn pháp lý thường xuyên",
              "Tư vấn pháp lý",
              "Tháng",
              "5000000",
              "8%"));

  public List<ServiceCatalogItem> listServices() {
    return CATALOG;
  }

  private static ServiceCatalogItem item(
      String code,
      String name,
      String serviceGroup,
      String unit,
      String unitPrice,
      String vatRate) {
    return new ServiceCatalogItem(
        code, name, serviceGroup, unit, new BigDecimal(unitPrice), vatRate);
  }
}
