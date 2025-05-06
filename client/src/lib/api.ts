import { Resume } from "@/types/resume";

// Function to upload resume file
export async function uploadResume(file: File): Promise<Record<string, string>> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/resume/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Function to get all resumes
export async function getAllResumes(): Promise<Resume[]> {
  const response = await fetch('/api/resume/all', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Function to get a specific resume by ID
export async function getResumeById(id: number): Promise<Resume> {
  const response = await fetch(`/api/resume/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}
