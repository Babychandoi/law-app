import axiosClient from './axiosClient';

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
export const getApplicationsByJobId = async (
  jobId: string
): Promise<ApiResponse<JobApplication[]>> => {
  const response = await axiosClient.get<ApiResponse<JobApplication[]>>(
    `/jobs/${jobId}/applications`
  );
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

/** Fetch a private CV through the authenticated API; MinIO credentials/URLs never reach the UI. */
export const getJobApplicationCv = async (
  id: string
): Promise<{ blob: Blob; fileName?: string }> => {
  const response = await axiosClient.get(`/jobs/applications/${id}/cv`, {
    responseType: 'blob',
    timeout: 60000,
  });
  const disposition = response.headers['content-disposition'] as string | undefined;
  const encoded = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const ascii = disposition?.match(/filename="?([^";]+)"?/i)?.[1];
  return {
    blob: response.data,
    fileName: encoded ? decodeURIComponent(encoded) : ascii,
  };
};

/**
 * Submit job application (Public - no auth required)
 */
export const submitJobApplication = async (
  formData: FormData
): Promise<ApiResponse<JobApplication>> => {
  const response = await axiosClient.post<ApiResponse<JobApplication>>('/jobs/apply', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
