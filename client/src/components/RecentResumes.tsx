import React from "react";
import { ChevronRight, FileText, Trash } from "lucide-react"; // Add Trash icon for the delete button
import { Resume } from "@/types/resume";

interface RecentResumesProps {
  resumes: Resume[];
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;  // Add onDelete prop to handle delete
  isLoading: boolean;
}

const RecentResumes: React.FC<RecentResumesProps> = ({
  resumes,
  onSelect,
  onDelete,  // Receive onDelete function
  isLoading,
}) => {
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
      {resumes.map((resume) => (
        <div
          key={resume.id}
          className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors relative"
          onClick={() => onSelect(resume.id)}
        >
          <FileText className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm">Resume #{resume.id}</span>
          <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();  // Prevent triggering onSelect on click
              onDelete(resume.id);  // Call the delete function
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
          >
            <Trash className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default RecentResumes;
