package org.law_app.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.common.Status;
import org.law_app.backend.dto.request.CustomerRequest;
import org.law_app.backend.dto.response.CustomerResponse;
import org.law_app.backend.dto.response.CustomerDetailResponse;
import org.law_app.backend.entity.ChildrenServices;
import org.law_app.backend.entity.Customer;
import org.law_app.backend.entity.CustomerService;
import org.law_app.backend.entity.Notification;
import org.law_app.backend.mapper.CustomerMapper;
import org.law_app.backend.repository.ChildrenServiceRepository;
import org.law_app.backend.repository.CustomerRepository;
import org.law_app.backend.repository.CustomerServiceRepository;
import org.law_app.backend.service.CustomerServices;
import org.law_app.backend.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
    @Transactional
    @Override
    public Boolean createCustomerService(CustomerRequest customerRequest) {
        try {
            Customer customer;
            if(customerRepository.existsByEmailAndPhone(customerRequest.getEmail(), customerRequest.getPhone()))
                customer = customerRepository.findByEmailAndPhone(customerRequest.getEmail(), customerRequest.getPhone());
            else
                customer = customerRepository.save(customerMapper.toCustomer(customerRequest));

            ChildrenServices service = childrenServiceRepository.findById(customerRequest.getServiceId())
                    .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + customerRequest.getServiceId()));
            CustomerService customerService = customerMapper.toCustomerService(customerRequest, service);
            customerService.setCustomer(customer);
            customerService.setStatus(Status.NEW);// Set default status to ACTIVE
            customerService = customerServiceRepository.save(customerService);
            Notification notification = Notification.builder()
                    .customerService(customerService)
                    .build();
            notificationService.createNotification(notification);
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
            CustomerService customerService = customerServiceRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Customer service not found with ID: " + id));
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
            return true; // Return true if update is successful
        } catch (Exception e) {
            log.error("Error updating status of customer service: {}", e.getMessage());
            throw e; // Propagate the exception
        }
    }

    @Override
    public List<CustomerResponse> getCustomerServicesByServiceId(String serviceId) {
        try {
            ChildrenServices service = childrenServiceRepository.findById(serviceId)
                    .orElseThrow(() -> new IllegalArgumentException("Service not found with ID: " + serviceId));
            List<CustomerService> customerServices = customerServiceRepository.findByService(service);
            return customerServices.stream()
                    .map(customerMapper::toCustomerResponse)
                    .toList();
        } catch (Exception e) {
            log.error("Error retrieving customer services by service ID: {}", e.getMessage());
            throw e; // Propagate the exception
        }
    }

    @Override
    public List<CustomerResponse> getAllCustomerServices() {
        try {
            List<CustomerService> customerServices = customerServiceRepository.findAll();
            return customerServices.stream()
                    .map(customerMapper::toCustomerResponse)
                    .toList();
        }catch (Exception e) {
            log.error("Error retrieving all customer services: {}", e.getMessage());
            throw e; // Propagate the exception
        }
    }

    @Override
    public CustomerDetailResponse getCustomerServiceById(String id) {
        try {
            CustomerService customerService = customerServiceRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Customer service not found with ID: " + id));
            return customerMapper.toCustomerDetailResponse(customerService);
        } catch (Exception e) {
            log.error("Error retrieving customer service by ID: {}", e.getMessage());
            throw e; // Propagate the exception
        }
    }
}
