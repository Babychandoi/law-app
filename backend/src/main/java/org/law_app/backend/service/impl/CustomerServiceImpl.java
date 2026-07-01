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
import org.law_app.backend.service.EmailService;
import org.law_app.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Value;
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
  EmailService emailService;

  @Value("${app.notification-email}")
  @lombok.experimental.NonFinal
  String adminEmail;

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
              .serviceName(service.getTitle())
              .name(customerService.getName())
              .description(customerService.getDescription())
              .status(customerService.getStatus().name())
              .createdAt(customerService.getCreatedAt())
              .updatedAt(customerService.getUpdatedAt())
              .build());

      // Gửi email (best-effort, @Async — lỗi mail không làm hỏng đăng ký).
      sendRegistrationEmails(customer, service, customerService);

      return true; // Return true if creation is successful
    } catch (Exception e) {
      log.error("Error creating customer service: {}", e.getMessage());
      throw e; // Propagate the exception
    }
  }

  /** Báo admin có khách đăng ký + gửi xác nhận cho khách (nếu khách có email). */
  private void sendRegistrationEmails(
      Customer customer, ChildrenServices service, CustomerService cs) {
    String serviceName = service.getTitle();
    String name = cs.getName() == null || cs.getName().isBlank() ? "Khách hàng" : cs.getName();
    String phone = customer.getPhone() == null ? "(không có)" : customer.getPhone();
    String email = customer.getEmail();
    String note = cs.getDescription() == null ? "" : cs.getDescription();

    // 1) Thông báo nội bộ cho admin/công ty.
    if (adminEmail != null && !adminEmail.isBlank()) {
      String adminSubject = "[Đăng ký dịch vụ] " + serviceName + " — " + name;
      String adminBody =
          "<h2>Khách hàng mới đăng ký dịch vụ</h2>"
              + "<p><b>Dịch vụ:</b> "
              + serviceName
              + "</p>"
              + "<p><b>Họ tên:</b> "
              + name
              + "</p>"
              + "<p><b>Điện thoại:</b> "
              + phone
              + "</p>"
              + "<p><b>Email:</b> "
              + (email == null ? "(không có)" : email)
              + "</p>"
              + "<p><b>Ghi chú:</b> "
              + note
              + "</p>";
      emailService.sendEmail(adminEmail, adminSubject, adminBody);
    }

    // 2) Email xác nhận cho khách (chỉ khi có email hợp lệ).
    if (email != null && !email.isBlank()) {
      String custSubject = "Xác nhận đăng ký dịch vụ — Luật Poip Legal";
      String custBody =
          "<p>Xin chào <b>"
              + name
              + "</b>,</p>"
              + "<p>Cảm ơn bạn đã đăng ký dịch vụ <b>"
              + serviceName
              + "</b> tại Luật Poip Legal. "
              + "Chúng tôi đã nhận được yêu cầu và sẽ liên hệ với bạn trong thời gian sớm nhất.</p>"
              + "<p>Trân trọng,<br/>Đội ngũ Luật Poip Legal</p>";
      emailService.sendEmail(email, custSubject, custBody);
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
  @Transactional(readOnly = true)
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
