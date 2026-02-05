package org.law_app.backend.mapper;

import org.law_app.backend.dto.request.PreviousPartnerRequest;
import org.law_app.backend.dto.request.ProcessDetailRequest;
import org.law_app.backend.dto.request.ProcessRequest;
import org.law_app.backend.dto.request.ProcessTimeLineRequest;
import org.law_app.backend.dto.response.PreviousPartnerResponse;
import org.law_app.backend.dto.response.ProcessDetailResponse;
import org.law_app.backend.dto.response.ProcessResponse;
import org.law_app.backend.dto.response.ProcessTimeLineResponse;
import org.law_app.backend.entity.*;
import org.law_app.backend.entity.Process;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChildrenMapper {
    default ProcessResponse toProcessResponse(Process process, List<ProcessDetail> processDetail) {
        return ProcessResponse.builder()
                .id(process.getId())
                .step(process.getStep())
                .title(process.getTitle())
                .description(process.getDescription())
                .details(processDetail.stream()
                        .map(detail -> ProcessDetailResponse.builder()
                                .type(detail.getType())
                                .desc(detail.getDesc())
                                .time(detail.getTime() != null ? detail.getTime() : null)
                                .accuracy(detail.getAccuracy() != null ? detail.getAccuracy() : null)
                                .build())
                        .toList())
                .build();
    }
    default Process toProcess(ProcessRequest processRequest, ChildrenServices service) {
        return Process.builder()
                .id(processRequest.getId())
                .step(processRequest.getStep())
                .title(processRequest.getTitle())
                .service(service)
                .description(processRequest.getDescription())
                .build();
    }
    default List<ProcessDetail> toProcessDetail(ProcessRequest processRequest,Process process) {
        return processRequest.getDetails().stream()
                .map(detailRequest -> ProcessDetail.builder()
                        .type(detailRequest.getType())
                        .desc(detailRequest.getDesc())
                        .time(detailRequest.getTime() != null ? detailRequest.getTime() : null)
                        .accuracy(detailRequest.getAccuracy() != null ? detailRequest.getAccuracy() : null)
                        .process(process)
                        .build())
                .toList();
    }
    default PreviousPartner toPreviousPartner(PreviousPartnerRequest previousPartnerRequest) {
        return PreviousPartner.builder()
                .title(previousPartnerRequest.getTitle())
                .image(previousPartnerRequest.getImage())
                .shortName(previousPartnerRequest.getShortName())
                .build();
    }
    default PreviousPartnerResponse toPreviousPartnerResponse(PreviousPartner previousPartner) {
        return PreviousPartnerResponse.builder()
                .id(previousPartner.getId())
                .title(previousPartner.getTitle())
                .image(previousPartner.getImage())
                .shortName(previousPartner.getShortName())
                .build();
    }
    default ProcessTimeLineResponse toProcessTimeLineResponse(ProcessTimeLine processTimeLine) {
        return ProcessTimeLineResponse.builder()
                .title(processTimeLine.getTitle())
                .description(processTimeLine.getDescription())
                .color(processTimeLine.getColor())
                .icon(processTimeLine.getIcon())
                .duration(processTimeLine.getDuration())
                .build();
    }
    default ProcessTimeLine toProcessTimeLine(ProcessTimeLineRequest processTimeLineRequest, ChildrenServices services){
        return ProcessTimeLine.builder()
                .service(services)
                .color(processTimeLineRequest.getColor())
                .icon(processTimeLineRequest.getIcon())
                .duration(processTimeLineRequest.getDuration())
                .description(processTimeLineRequest.getDescription())
                .title(processTimeLineRequest.getTitle())
                .build();
    }
}
