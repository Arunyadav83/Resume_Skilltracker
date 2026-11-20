import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileUploader } from "@/components/FileUploader";
import { ResumeDetails } from "@/components/ResumeDetails";
import RecentResumes from "@/components/RecentResumes";
import { Resume } from "@/types/resume";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [uploadedResume, setUploadedResume] = useState<Resume | null>(null);
  const { toast } = useToast();

  // Query to fetch all resumes
  const {
    data: resumes = [],
    isLoading: isLoadingResumes,
  } = useQuery<Resume[]>({
    queryKey: ["/resume/all"],
    queryFn: async () => {
      const res = await fetch("/api/resume/all");
      if (!res.ok) throw new Error("Failed to fetch resumes");
      return await res.json();
    },
  });

  // Mutation for uploading resume
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to upload resume");
      }

      return await response.json(); // Assuming { id: number, ... }
    },
    onSuccess: async (data) => {
      setUploadedResume(data); // Set the uploaded resume data
      queryClient.invalidateQueries({ queryKey: ["/resume/all"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  // Mutation for deleting resume
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/resume/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to delete resume");
      }

      return id; // Return the deleted resume id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["/resume/all"] });
      toast({
        variant: "success",
        title: "Resume deleted",
        description: `Resume with ID ${id} has been deleted successfully.`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    const resumeData = await uploadMutation.mutateAsync(file);
    setUploadedResume(resumeData); // Set the uploaded resume data
  };

  const handleDeleteResume = (id: number) => {
    deleteMutation.mutate(id); // Call the delete mutation
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Resume Analyzer</h1>
        <p className="text-gray-500">
          Upload your resume to analyze and parse its contents
        </p>
      </header>

      <main className="flex flex-col lg:flex-row gap-6">
        <section className="lg:w-1/3 w-full">
          <FileUploader
            onFileUpload={handleFileUpload}
            isProcessing={uploadMutation.isPending}
          />
          <RecentResumes
            resumes={resumes}
            onSelect={(id) => {
              const selected = resumes.find((resume) => resume.id === id);
              if (selected) {
                setUploadedResume(selected); // Set the selected resume for details
              }
            }}
            onDelete={handleDeleteResume} // Pass the delete handler
            isLoading={isLoadingResumes}
          />
        </section>

        <section className="lg:w-2/3 w-full">
          {uploadedResume ? (
            <ResumeDetails
              resume={uploadedResume}
              isLoading={false} // No loading state since we have the data
            />
          ) : (
            <p>No resume uploaded yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}
