import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { db } from "@db";
import { resumes } from "@shared/schema";
import { eq } from "drizzle-orm";
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

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
  const apiPrefix = '/api';

  app.post(`${apiPrefix}/resume/upload`, upload.single('file'), async (req: Request, res: Response) => {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      let fileText = "";
      
      if (file.mimetype === 'application/pdf') {
        const pdfData = await pdf(file.buffer);
        fileText = pdfData.text;
      } else if (
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const docxData = await mammoth.extractRawText({ buffer: file.buffer });
        fileText = docxData.value;
      } else {
        fileText = file.buffer.toString();
      }

      const sections = extractResumeData(fileText);
      console.log('Extracted Text Preview:', fileText.substring(0, 500)); // Log first 500 chars for debugging
      console.log('Parsed Sections:', sections);
      
      // Save to database
      await db.insert(resumes).values({
        summary: sections.Summary || '',
        education: sections.Education || '',
        experience: sections.Experience || '',
        personalInformation: sections['Personal Information'] || ''
      });
      
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

  // Route to delete a resume by ID
  app.delete(`${apiPrefix}/resume/:id`, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID parameter' });
      }
      
      const result = await db.delete(resumes).where(eq(resumes.id, id));
      
      return res.status(200).json({ message: 'Resume deleted successfully', id });
    } catch (error) {
      console.error('Error deleting resume:', error);
      return res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Error deleting resume' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function extractResumeData(text: string): Record<string, string> {
  const data: Record<string, string> = {
    'Summary': 'Not found',
    'Education': 'Not found',
    'Experience': 'Not found',
    'Personal Information': 'Not found'
  };

  const sectionKeywords: Record<string, string[]> = {
    'Summary': ['summary', 'profile', 'objective', 'about me'],
    'Education': ['education', 'academic', 'qualification', 'schooling', 'university'],
    'Experience': ['experience', 'work', 'employment', 'career', 'history', 'projects'],
    'Personal Information': ['personal', 'contact', 'details', 'address', 'phone', 'email']
  };

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  let currentSection: string | null = null;
  const sections: Record<string, string[]> = {};

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    let foundNewSection = false;

    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      // Check if line contains keyword and is short (likely a header)
      if (keywords.some(k => lowerLine.includes(k) && lowerLine.length < k.length + 10)) {
        currentSection = section;
        foundNewSection = true;
        if (!sections[currentSection]) sections[currentSection] = [];
        break;
      }
    }

    if (currentSection && !foundNewSection) {
      sections[currentSection].push(line);
    }
  }

  for (const [section, content] of Object.entries(sections)) {
    if (content.length > 0) {
      data[section] = content.join('\n');
    }
  }

  return data;
}
