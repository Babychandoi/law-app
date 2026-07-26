package org.law_app.backend.service;

import java.util.List;
import org.law_app.backend.common.Status;
import org.law_app.backend.dto.request.CustomerRequest;
import org.law_app.backend.dto.response.CustomerDetailResponse;
import org.law_app.backend.dto.response.CustomerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerServices {
  Boolean createCustomerService(CustomerRequest customerRequest);

  Boolean updateStatusCustomerService(String id, Status status);

  List<CustomerResponse> getCustomerServicesByServiceId(String serviceId);

  Page<CustomerResponse> getCustomerServicesByServiceId(String serviceId, Pageable pageable);

  List<CustomerResponse> getAllCustomerServices();

  Page<CustomerResponse> getAllCustomerServices(Pageable pageable);

  /** Tìm kiếm + lọc khách hàng phía server (từ khóa, trạng thái, dịch vụ, khoảng ngày tạo). */
  Page<CustomerResponse> searchCustomerServices(
      String q,
      Status status,
      String serviceId,
      java.time.LocalDate from,
      java.time.LocalDate to,
      Pageable pageable);

  CustomerDetailResponse getCustomerServiceById(String id);

  /** Republish every existing case to RabbitMQ so the CRM read-replica can backfill. */
  int backfillCrm();
}
