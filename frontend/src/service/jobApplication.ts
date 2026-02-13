import axiosClient from "./axiosClient";

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  cvFileUrl: string;
  cvFileName: string;
  status: string;
  appliedDate: string;
  notes: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * Get all job applications (Admin only)
 */
export const getAllJobApplications = async (): Promise<ApiResponse<JobApplication[]>> => {
  const response = await axiosClient.get<ApiResponse<JobApplication[]>>('/jobs/applications');
  return response.data;
};

/**
 * Get applications by job ID
 */
export const getApplicationsByJobId = async (jobId: string): Promise<ApiResponse<JobApplication[]>> => {
  const response = await axiosClient.get<ApiResponse<JobApplication[]>>(`/jobs/${jobId}/applications`);
  return response.data;
};

/**
 * Get single application by ID
 */
export const getApplicationById = async (id: string): Promise<ApiResponse<JobApplication>> => {
  const response = await axiosClient.get<ApiResponse<JobApplication>>(`/jobs/applications/${id}`);
  return response.data;
};

/**
 * Update application status (Admin only)
 */
export const updateApplicationStatus = async (
  id: string,
  status: string,
  notes?: string
): Promise<ApiResponse<JobApplication>> => {
  const params = new URLSearchParams({ status });
  if (notes) {
    params.append('notes', notes);
  }
  
  const response = await axiosClient.put<ApiResponse<JobApplication>>(
    `/jobs/applications/${id}/status?${params.toString()}`
  );
  return response.data;
};

/**
 * Delete application (Admin only)
 */
export const deleteApplication = async (id: string): Promise<void> => {
  await axiosClient.delete(`/jobs/applications/${id}`);
};

/**
 * Submit job application (Public - no auth required)
 */
export const submitJobApplication = async (formData: FormData): Promise<ApiResponse<JobApplication>> => {
  const response = await axiosClient.post<ApiResponse<JobApplication>>(
    '/jobs/apply',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
