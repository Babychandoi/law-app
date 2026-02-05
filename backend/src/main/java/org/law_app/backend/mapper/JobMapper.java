package org.law_app.backend.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.law_app.backend.dto.request.JobRequest;
import org.law_app.backend.dto.response.JobResponse;
import org.law_app.backend.entity.Job;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface JobMapper {
    final ObjectMapper objectMapper = new ObjectMapper();
    private String convertListToJson(List<String> list) throws Exception {
        return objectMapper.writeValueAsString(list);
    }
    private List<String> convertJsonToList(String json) throws Exception {
        return objectMapper.readValue(json, new TypeReference<List<String>>(){});
    }

    default JobResponse toJobResponse(Job job) {
        try {
            return JobResponse.builder()
                    .id(job.getId())
                    .title(job.getTitle())
                    .company(job.getCompany())
                    .jobType(job.getJobType())
                    .location(job.getLocation())
                    .postedDate(job.getPostedDate())
                    .description(convertJsonToList(job.getDescription()))
                    .requirements(convertJsonToList(job.getRequirements()))
                    .benefits(convertJsonToList(job.getBenefits()))
                    .category(job.getCategory())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error converting Job to JobResponse", e);
        }
    }
    default Job toJob(JobRequest jobRequest) {
        try {
            return Job.builder()
                    .title(jobRequest.getTitle())
                    .company(jobRequest.getCompany())
                    .jobType(jobRequest.getJobType())
                    .location(jobRequest.getLocation())
                    .description(convertListToJson(jobRequest.getDescription()))
                    .requirements(convertListToJson(jobRequest.getRequirements()))
                    .benefits(convertListToJson(jobRequest.getBenefits()))
                    .category(jobRequest.getCategory())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error converting JobRequest to Job", e);
        }
    }
}
