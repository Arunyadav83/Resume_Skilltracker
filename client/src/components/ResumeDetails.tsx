import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, FileText, User, BriefcaseIcon, GraduationCap, Loader2 } from "lucide-react";
import { Resume } from "@/types/resume";
import { ResumeSection } from "./ResumeSection";

interface ResumeDetailsProps {
  resume: Resume | null;
  isLoading: boolean;
}

export function ResumeDetails({ resume, isLoading }: ResumeDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const handleExport = () => {
    if (!resume) return;
    
    // Create text content from resume data
    const content = `
Resume Analysis Results

Personal Information:
${resume.personalInformation || "N/A"}

Professional Summary:
${resume.summary || "N/A"}

Work Experience:
${resume.experience || "N/A"}

Education:
${resume.education || "N/A"}
    `;
    
    // Create a blob and download it
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume-analysis.txt";
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Empty state
  if (!resume && !isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Resume Selected</h3>
            <p className="text-gray-500">Upload a resume to see the analysis results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin mb-4"></div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">Analyzing Resume</h3>
            <p className="text-gray-500">Please wait while we process your document</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Results state
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Resume Analysis Results</h2>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <ResumeSection 
              title="Personal Information"
              icon={<User className="h-5 w-5 text-gray-500" />}
              content={resume?.personalInformation || "Not available"}
            />
            
            <ResumeSection 
              title="Professional Summary"
              icon={<FileText className="h-5 w-5 text-gray-500" />}
              content={resume?.summary || "Not available"}
            />
            
            <ResumeSection 
              title="Work Experience"
              icon={<BriefcaseIcon className="h-5 w-5 text-gray-500" />}
              content={resume?.experience || "Not available"}
            />
            
            <ResumeSection 
              title="Education"
              icon={<GraduationCap className="h-5 w-5 text-gray-500" />}
              content={resume?.education || "Not available"}
            />
          </TabsContent>
          
          <TabsContent value="raw">
            <pre className="bg-gray-50 p-4 rounded-lg text-xs text-gray-600 overflow-auto max-h-96 whitespace-pre-wrap">
              {JSON.stringify(resume, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
