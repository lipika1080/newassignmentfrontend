// src/api.ts
import axios from "axios";

const BASE = import.meta.env.VITE_API_URL;

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  submissions: Submission[];
}

export interface Submission {
  student_name: string;
  submission_link: string;
  submitted_at: string;
}

export const createAssignment = (data: Omit<Assignment, "_id" | "submissions">) =>
  axios.post(`${BASE}/assignments`, data);

export const fetchAssignments = () =>
  axios.get<Assignment[]>(`${BASE}/assignments`);

export const submitAssignment = (id: string, sub: Submission) =>
  axios.put(`${BASE}/assignments/${id}/submit`, sub);

export const sendReminder = (payload: {
  to_email: string;
  subject: string;
  content: string;
}) => axios.post(`${BASE}/send-reminder`, payload);
