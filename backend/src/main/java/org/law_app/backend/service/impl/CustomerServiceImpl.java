package org.law_app.backend.service.impl;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.common.Status;
import org.law_app.backend.dto.request.CustomerRequest;
import org.law_app.backend.dto.response.CustomerDetailResponse;
import org.law_app.backend.dto.response.CustomerResponse;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Customer;
import org.law_app.backend.entity.CustomerService;
import org.law_app.backend.entity.Notification;
import org.law_app.backend.event.CaseEvent;
import org.law_app.backend.event.CaseEventPublisher;
import org.law_app.backend.mapper.CustomerMapper;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.CustomerRepository;
import org.law_app.backend.repository.CustomerServiceRepository;
import org.law_app.backend.service.CustomerServices;
import org.law_app.backend.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class CustomerServiceImpl implements CustomerServices {
  CustomerRepository customerRepository;
  CustomerServiceRepository customerServiceRepository;
  ChildrenServiceRepository childrenServiceRepository;
  CustomerMapper customerMapper;
  NotificationService notificationService;
  CaseEventPublisher caseEventPublisher;
  org.law_app.backend.service.AuditService auditService;
  // Email chuyển sang CustomerRegisteredEmailListener (chạy AFTER_COMMIT), nên lớp này không còn
  // giữ EmailService lẫn địa chỉ admin.
  org.springframework.context.ApplicationEventPublisher eventPublisher;

  @Transactional
  @Override
  public Boolean createCustomerService(CustomerRequest customerRequest) {
    try {
      Customer customer;
      if (customerRepository.existsByEmailAndPhone(
          customerRequest.getEmail(), customerRequest.getPhone()))
        customer =
            customerRepository.findByEmailAndPhone(
                customerRequest.getEmail(), customerRequest.getPhone());
      else customer = customerRepository.save(customerMapper.toCustomer(customerRequest));

      ChildrenServices service =
          childrenServiceRepository
              .findById(customerRequest.getServiceId())
              .orElseThrow(
                  () ->
                      new IllegalArgumentException(
                          "Service not found with ID: " + customerRequest.getServiceId()));
      CustomerService customerService = customerMapper.toCustomerService(customerRequest, service);
      customerService.setCustomer(customer);
      customerService.setStatus(Status.NEW); // Set default status to ACTIVE
      customerService = customerServiceRepository.save(customerService);
      Notification notification = Notification.builder().customerService(customerService).build();
      notificationService.createNotification(notification);

      // Sync to CRM read-replica (best-effort).
      caseEventPublisher.publish(
          CaseEventPublisher.RK_CREATED,
          CaseEvent.builder()
              .caseId(customerService.getId())
              .customerId(customer.getId())
              .customerEmail(customer.getEmail())
              .customerPhone(customer.getPhone())
              .serviceId(service.getId())
              .serviceName(service.getTitle())
              .name(customerService.getName())
              .description(customerService.getDescription())
              .status(customerService.getStatus().name())
              .createdAt(customerService.getCreatedAt())
              .updatedAt(customerService.getUpdatedAt())
              .build());

      // Email chỉ gửi SAU KHI transaction commit (xem CustomerRegisteredEmailListener). Gọi trực
      // tiếp ở đây thì insert lỗi vẫn gửi thư cho khách, khách chờ gọi lại mà hệ thống trống rỗng.
      eventPublisher.publishEvent(
          new org.law_app.backend.event.CustomerRegisteredEvent(
              service.getTitle(),
              customerService.getName(),
              customer.getPhone(),
              customer.getEmail(),
              customerService.getDescription()));

      return true; // Return true if creation is successful
    } catch (Exception e) {
      log.error("Error creating customer service: {}", e.getMessage());
      throw e; // Propagate the exception
    }
  }

  @Transactional
  @Override
  public Boolean updateStatusCustomerService(String id, Status status) {
    try {
      CustomerService customerService =
          customerServiceRepository
              .findById(id)
              .orElseThrow(
                  () -> new IllegalArgumentException("Customer service not found with ID: " + id));
      Status oldStatus = customerService.getStatus();
      customerService.setStatus(status);
      switch (status) {
        case COMPLETED:
          customerService.setCompletedAt(new java.util.Date());
          break;
        case CANCELED:
          customerService.setCanceledAt(new java.util.Date());
          break;
        default:
          customerService.setUpdatedAt(new java.util.Date());
      }
      customerServiceRepository.save(customerService);

      caseEventPublisher.publish(
          CaseEventPublisher.RK_STATUS_CHANGED,
          CaseEvent.builder()
              .caseId(customerService.getId())
              .status(customerService.getStatus().name())
              .updatedAt(customerService.getUpdatedAt())
              .completedAt(customerService.getCompletedAt())
              .canceledAt(customerService.getCanceledAt())
              .build());
      auditService.record(
          "CUSTOMER_STATUS_CHANGED",
          "CUSTOMER",
          id,
          String.format("Đổi trạng thái hồ sơ: %s → %s", oldStatus, status),
          org.law_app.backend.service.AuditService.diff("status", oldStatus, status));
      return true; // Return true if update is successful
    } catch (Exception e) {
      log.error("Error updating status of customer service: {}", e.getMessage());
      throw e; // Propagate the exception
    }
  }

  @Override
  public List<CustomerResponse> getCustomerServicesByServiceId(String serviceId) {
    try {
      ChildrenServices service =
          childrenServiceRepository
              .findById(serviceId)
              .orElseThrow(
                  () -> new IllegalArgumentException("Service not found with ID: " + serviceId));
      List<CustomerService> customerServices = customerServiceRepository.findByService(service);
      return customerServices.stream().map(customerMapper::toCustomerResponse).toList();
    } catch (Exception e) {
      log.error("Error retrieving customer services by service ID: {}", e.getMessage());
      throw e; // Propagate the exception
    }
  }

  @Override
  public Page<CustomerResponse> getCustomerServicesByServiceId(
      String serviceId, Pageable pageable) {
    try {
      ChildrenServices service =
          childrenServiceRepository
              .findById(serviceId)
              .orElseThrow(
                  () -> new IllegalArgumentException("Service not found with ID: " + serviceId));
      return customerServiceRepository
          .findByService(service, pageable)
          .map(customerMapper::toCustomerResponse);
    } catch (Exception e) {
      log.error("Error retrieving paged customer services by service ID: {}", e.getMessage());
      throw e;
    }
  }

  @Override
  public List<CustomerResponse> getAllCustomerServices() {
    try {
      List<CustomerService> customerServices = customerServiceRepository.findAll();
      return customerServices.stream().map(customerMapper::toCustomerResponse).toList();
    } catch (Exception e) {
      log.error("Error retrieving all customer services: {}", e.getMessage());
      throw e; // Propagate the exception
    }
  }

  @Override
  public Page<CustomerResponse> getAllCustomerServices(Pageable pageable) {
    try {
      return customerServiceRepository.findAll(pageable).map(customerMapper::toCustomerResponse);
    } catch (Exception e) {
      log.error("Error retrieving paged customer services: {}", e.getMessage());
      throw e;
    }
  }

  @Override
  public Page<CustomerResponse> searchCustomerServices(
      String q,
      Status status,
      String serviceId,
      java.time.LocalDate from,
      java.time.LocalDate to,
      Pageable pageable) {
    try {
      org.springframework.data.jpa.domain.Specification<CustomerService> spec =
          (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> ps = new java.util.ArrayList<>();
            if (status != null) ps.add(cb.equal(root.get("status"), status));
            if (from != null) {
              java.util.Date fromDate =
                  java.util.Date.from(
                      from.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant());
              ps.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
            }
            if (to != null) {
              // Bao trọn ngày "đến": < 00:00 ngày kế tiếp.
              java.util.Date toExclusive =
                  java.util.Date.from(
                      to.plusDays(1).atStartOfDay(java.time.ZoneId.systemDefault()).toInstant());
              ps.add(cb.lessThan(root.get("createdAt"), toExclusive));
            }
            boolean hasQ = q != null && !q.isBlank();
            boolean hasService = serviceId != null && !serviceId.isBlank();
            jakarta.persistence.criteria.Join<Object, Object> service =
                (hasQ || hasService)
                    ? root.join("service", jakarta.persistence.criteria.JoinType.LEFT)
                    : null;
            if (hasService) ps.add(cb.equal(service.get("id"), serviceId));
            if (hasQ) {
              jakarta.persistence.criteria.Join<Object, Object> customer =
                  root.join("customer", jakarta.persistence.criteria.JoinType.LEFT);
              String like = "%" + q.trim().toLowerCase() + "%";
              ps.add(
                  cb.or(
                      cb.like(cb.lower(root.get("name")), like),
                      cb.like(cb.lower(customer.get("email")), like),
                      cb.like(cb.lower(customer.get("phone")), like),
                      cb.like(cb.lower(service.get("title")), like)));
            }
            return cb.and(ps.toArray(new jakarta.persistence.criteria.Predicate[0]));
          };
      return customerServiceRepository
          .findAll(spec, pageable)
          .map(customerMapper::toCustomerResponse);
    } catch (Exception e) {
      log.error("Error searching customer services: {}", e.getMessage());
      throw e;
    }
  }

  @Override
  public CustomerDetailResponse getCustomerServiceById(String id) {
    try {
      CustomerService customerService =
          customerServiceRepository
              .findById(id)
              .orElseThrow(
                  () -> new IllegalArgumentException("Customer service not found with ID: " + id));
      return customerMapper.toCustomerDetailResponse(customerService);
    } catch (Exception e) {
      log.error("Error retrieving customer service by ID: {}", e.getMessage());
      throw e; // Propagate the exception
    }
  }

  @Override
  @Transactional
  public int backfillCrm() {
    List<CustomerService> all = customerServiceRepository.findAll();
    for (CustomerService cs : all) {
      Customer c = cs.getCustomer();
      ChildrenServices s = cs.getService();
      caseEventPublisher.publish(
          CaseEventPublisher.RK_CREATED,
          CaseEvent.builder()
              .caseId(cs.getId())
              .customerId(c != null ? c.getId() : null)
              .customerEmail(c != null ? c.getEmail() : null)
              .customerPhone(c != null ? c.getPhone() : null)
              .serviceId(s != null ? s.getId() : null)
              .serviceName(s != null ? s.getTitle() : null)
              .name(cs.getName())
              .description(cs.getDescription())
              .status(cs.getStatus() != null ? cs.getStatus().name() : null)
              .createdAt(cs.getCreatedAt())
              .updatedAt(cs.getUpdatedAt())
              .completedAt(cs.getCompletedAt())
              .canceledAt(cs.getCanceledAt())
              .build());
    }
    log.info("CRM backfill published {} cases", all.size());
    return all.size();
  }
}
