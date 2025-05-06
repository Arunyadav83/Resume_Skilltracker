import { ReactNode } from "react";

interface ResumeSectionProps {
  title: string;
  icon: ReactNode;
  content: string;
}

export function ResumeSection({ title, icon, content }: ResumeSectionProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <span className="mr-2">{icon}</span>
        {title}
      </h3>
      <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}
