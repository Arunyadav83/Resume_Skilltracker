import { ChevronRight, FileText } from "lucide-react";
import { Resume } from "@/types/resume";

interface RecentResumesProps {
  resumes: Resume[];
  onSelect: (id: number) => void;
  isLoading: boolean;
}

export function RecentResumes({ resumes, onSelect, isLoading }: RecentResumesProps) {
  if (isLoading) {
    return (
      <div className="mt-6">
        <h3 className="text-md font-medium mb-3">Recent Uploads</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center p-2 rounded bg-gray-50 animate-pulse h-8"></div>
          ))}
        </div>
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-md font-medium mb-3">Recent Uploads</h3>
        <p className="text-sm text-gray-500">No resumes uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-md font-medium mb-3">Recent Uploads</h3>
      <div className="space-y-2">
        {resumes.map((resume) => (
          <div 
            key={resume.id}
            className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onSelect(resume.id)}
          >
            <FileText className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm">Resume #{resume.id}</span>
            <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
