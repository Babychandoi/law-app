package org.law_app.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.law_app.backend.dto.request.HeroRequest;
import org.law_app.backend.dto.request.PreviousPartnerRequest;
import org.law_app.backend.dto.request.ProcessRequest;
import org.law_app.backend.dto.request.ProcessTimeLineRequest;
import org.law_app.backend.dto.response.HeroResponse;
import org.law_app.backend.dto.response.PreviousPartnerResponse;
import org.law_app.backend.dto.response.ProcessResponse;
import org.law_app.backend.dto.response.ProcessTimeLineResponse;
import org.law_app.backend.entity.*;
import org.law_app.backend.entity.Process;
import org.law_app.backend.mapper.ChildrenMapper;
import org.law_app.backend.repository.*;
import org.law_app.backend.service.ChildrenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class ChildrenServiceImpl implements ChildrenService {
    ChildrenServiceRepository childrenServiceRepository;
    ProcessRepository processRepository;
    ProcessDetailRepository processDetailRepository;
    PreviousPartnerRepository previousPartnerRepository;
    ChildrenMapper childrenMapper;
    HeroRepository heroRepository;
    ProcessTimeLineRepository processTimeLineRepository;
    @Override
    @Transactional
    public Boolean createHero(HeroRequest heroRequest, String serviceId) {
        try {
            ChildrenServices childrenService = childrenServiceRepository.findById(serviceId)
                    .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + serviceId));
            Hero hero = Hero.builder()
                    .title(heroRequest.getTitle())
                    .description(heroRequest.getDescription())
                    .subtitle(heroRequest.getSubtitle())
                    .service(childrenService)
                    .build();
            heroRepository.save(hero);
            return true;
        }catch (Exception e) {
            log.error("Error creating hero: {}", e.getMessage());
            throw  e;
        }
    }

    @Override
    public HeroResponse getHeroByServiceId(String serviceId) {
        try {
            ChildrenServices childrenService = childrenServiceRepository.findById(serviceId).orElseThrow(
                    () -> new IllegalArgumentException("Service not found with id: " + serviceId));
            Hero hero = heroRepository.findByService(childrenService);
            if (hero == null) {
                throw new IllegalArgumentException("Hero not found for service id: " + serviceId);
            }
            return HeroResponse.builder()
                    .subtitle(hero.getSubtitle())
                    .title(hero.getTitle())
                    .description(hero.getDescription())
                    .build();
        }catch (Exception e) {
            log.error("Error fetching hero by service id: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<ProcessResponse> getProcessByServiceId(String serviceId) {
        try{
            ChildrenServices childrenService = childrenServiceRepository.findById(serviceId)
                    .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + serviceId));
            List<Process> process = processRepository.findByService(childrenService);
            return process.stream()
                    .map(proc -> {
                        List<ProcessDetail> processDetails = processDetailRepository.findByProcess(proc);
                        return childrenMapper.toProcessResponse(proc, processDetails);
                    })
                    .toList();
        }catch (Exception e) {
            log.error("Error fetching process by service id: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public Boolean createProcess(String serviceId, List<ProcessRequest> processRequest) {
        try {
            ChildrenServices childrenService = childrenServiceRepository.findById(serviceId)
                    .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + serviceId));
            for (ProcessRequest request : processRequest) {
                Process process = childrenMapper.toProcess(request, childrenService);
                processRepository.save(process);
                if(request.getDetails() != null && !request.getDetails().isEmpty()) {
                    List<ProcessDetail> processDetails = childrenMapper.toProcessDetail(request, process);
                    processDetailRepository.saveAll(processDetails);
                }
            }
            return true;
        } catch (Exception e) {
            log.error("Error creating process: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<PreviousPartnerResponse> getPreviousPartners() {
        try {
            List<PreviousPartner> previousPartners = previousPartnerRepository.findAll();
            return previousPartners.stream()
                    .map(childrenMapper :: toPreviousPartnerResponse)
                    .toList();
        } catch (Exception e) {
            log.error("Error fetching previous partners: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public Boolean createPreviousPartner(List<PreviousPartnerRequest> previousPartner) {
        try {
            List<PreviousPartner> partners = previousPartner.stream()
                    .map(childrenMapper::toPreviousPartner)
                    .toList();
            previousPartnerRepository.saveAll(partners);
            return true;
        } catch (Exception e) {
            log.error("Error creating previous partners: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public List<ProcessTimeLineResponse> getProcessTimeLineByServiceId(String serviceId) {
        try {
            ChildrenServices childrenService = childrenServiceRepository.findById(serviceId)
                    .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + serviceId));
            List<ProcessTimeLine> processTimeLines = processTimeLineRepository.findByService(childrenService);
            return processTimeLines.stream()
                    .map(childrenMapper::toProcessTimeLineResponse)
                    .toList();

        }catch (Exception e) {
            log.error("Error fetching process timeline by service id: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public Boolean createProcessTimeLine(String serviceId, List<ProcessTimeLineRequest> processTimeLineRequests) {
        try {
            ChildrenServices childrenServices = childrenServiceRepository.findById(serviceId)
                    .orElseThrow(() -> new IllegalArgumentException("Service not found with id: " + serviceId));
            for(ProcessTimeLineRequest processTimeLineRequest : processTimeLineRequests){
                processTimeLineRepository.save(childrenMapper.toProcessTimeLine(processTimeLineRequest,childrenServices));
            }

            return true;
        }catch (Exception e) {
            log.error("");
            throw e;
        }
    }

}
