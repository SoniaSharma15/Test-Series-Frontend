import axios from "./axiosInstance";

export const getEnrollments = (params) =>
  axios.get("/admin/enrollments", { params });

export const manualEnroll = (data) =>
  axios.post("/admin/enrollments", data);

export const updateStatus = (id, status) =>
  axios.put(`/admin/enrollments/${id}`, { status });

export const renewEnrollment = (id, days) => {
  return axios.patch(`/enrollments/${id}/renew`, days ? { days } : {});
};


