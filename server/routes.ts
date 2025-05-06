import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { db } from "@db";
import { resumes } from "@shared/schema";
import { eq } from "drizzle-orm";

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF and Word documents
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with /api prefix
  const apiPrefix = '/api';

  // Route to upload and process a resume
  app.post(`${apiPrefix}/resume/upload`, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // For this implementation, we'll mock the resume parsing since we don't have Apache Tika
      // This simulates what the Java service would do
      const fileContent = req.file.buffer.toString();
      const sections = extractResumeData(fileContent);
      
      // Save to database
      const [newResume] = await db.insert(resumes).values({
        summary: sections.Summary || '',
        education: sections.Education || '',
        experience: sections.Experience || '',
        personalInformation: sections['Personal Information'] || ''
      }).returning();
      
      return res.status(200).json(sections);
    } catch (error) {
      console.error('Error processing file:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Error processing the file' 
      });
    }
  });

  // Route to get all resumes
  app.get(`${apiPrefix}/resume/all`, async (req: Request, res: Response) => {
    try {
      const allResumes = await db.select().from(resumes);
      return res.status(200).json(allResumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Error fetching resumes' 
      });
    }
  });

  // Route to get a specific resume by ID
  app.get(`${apiPrefix}/resume/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID parameter' });
      }
      
      const resume = await db.select().from(resumes).where(eq(resumes.id, id)).limit(1);
      
      if (resume.length === 0) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      
      return res.status(200).json(resume[0]);
    } catch (error) {
      console.error('Error fetching resume:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Error fetching resume' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to extract resume data (simulates the Java service's functionality)
function extractResumeData(text: string): Record<string, string> {
  const data: Record<string, string> = {};
  const lines = text.split(/\r?\n/);
  
  let currentSection: string | null = null;
  let sectionContent: string[] = [];
  const sections: Record<string, string[]> = {};
  
  // Define section keywords similar to the Java backend
  const sectionKeywords: Record<string, string[]> = {
    'Summary': ['summary', 'profile', 'objective'],
    'Education': ['education', 'academic', 'qualifications'],
    'Experience': ['experience', 'work', 'employment', 'career'],
    'Personal Information': ['contact', 'personal', 'details']
  };
  
  // Parse the content into sections
  for (const line of lines) {
    const lowerLine = line.trim().toLowerCase();
    
    let matched = false;
    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      for (const keyword of keywords) {
        if (lowerLine.startsWith(keyword)) {
          if (currentSection && sectionContent.length > 0) {
            sections[currentSection] = [...sectionContent];
          }
          currentSection = section;
          sectionContent = [];
          matched = true;
          break;
        }
      }
      if (matched) break;
    }
    
    if (currentSection && !matched) {
      sectionContent.push(line);
    }
  }
  
  // Add the last section
  if (currentSection && sectionContent.length > 0) {
    sections[currentSection] = [...sectionContent];
  }
  
  // Convert to final format
  for (const section of Object.keys(sectionKeywords)) {
    data[section] = (sections[section] || ['Not found']).join('\n').trim();
  }
  
  return data;
}
