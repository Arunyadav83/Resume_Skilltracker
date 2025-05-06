import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FileUploader } from "@/components/FileUploader";
import { ResumeDetails } from "@/components/ResumeDetails";
import { RecentResumes } from "@/components/RecentResumes";
import { Resume } from "@/types/resume";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const { toast } = useToast();

  // Query to fetch all resumes
  const { 
    data: resumes = [], 
    isLoading: isLoadingResumes,
    refetch: refetchResumes
  } = useQuery<Resume[]>({ 
    queryKey: ['/api/resume/all'],
  });

  // Query to fetch a specific resume by ID if selected
  const { 
    data: selectedResume, 
    isLoading: isLoadingSelectedResume 
  } = useQuery<Resume>({ 
    queryKey: ['/api/resume', selectedResumeId],
    enabled: !!selectedResumeId,
  });

  // Mutation for uploading resume
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to upload resume');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/resume/all'] });
      refetchResumes();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  });

  const handleFileUpload = async (file: File) => {
    await uploadMutation.mutateAsync(file);
  };

  const handleResumeSelect = (id: number) => {
    setSelectedResumeId(id);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Resume Analyzer</h1>
        <p className="text-gray-500">Upload your resume to analyze and parse its contents</p>
      </header>

      <main className="flex flex-col lg:flex-row gap-6">
        <section className="lg:w-1/3 w-full">
          <FileUploader 
            onFileUpload={handleFileUpload} 
            isProcessing={uploadMutation.isPending}
          />
          <RecentResumes 
            resumes={resumes} 
            onSelect={handleResumeSelect}
            isLoading={isLoadingResumes}
          />
        </section>

        <section className="lg:w-2/3 w-full">
          <ResumeDetails 
            resume={selectedResume || null} 
            isLoading={isLoadingSelectedResume || uploadMutation.isPending}
          />
        </section>
      </main>
    </div>
  );
}
