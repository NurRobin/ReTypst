import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const { projectId, fileName, type } = await req.json();

  try {
    const projectPath = path.join(process.cwd(), 'documents', projectId);

    // Check if the project directory exists, if not create it
    try {
      await fs.access(projectPath);
    } catch {
      await fs.mkdir(projectPath, { recursive: true });
    }

    if (type === 'project') {
      // Create a new directory with the given name -> fileName

      // Check if the directory already exists
      try {
        // Check for main.typ in the project directory
        const newProjectPath = path.join(projectPath, fileName);
        await fs.access(path.join(newProjectPath, 'main.typ'));
        return new NextResponse(JSON.stringify({ error: 'Project already exists' }), { status: 400 });
      } catch {
        await fs.writeFile(path.join(projectPath, 'main.typ'), '= New Project', 'utf-8');
      }

      return new NextResponse(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (type === 'directory') {
      // Create a new directory with the given name -> fileName
      const directoryPath = path.join(projectPath, fileName);

      // Check if the directory already exists
      try {
        await fs.access(directoryPath);
        return new NextResponse(JSON.stringify({ error: 'Directory already exists' }), { status: 400 });
      } catch {
        await fs.mkdir(directoryPath, { recursive: true });
      }

      return new NextResponse(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      // Create a new file with the given name and type -> fileName.type
      const filePath = path.join(projectPath, `${fileName}.${type}`);

      // Check if the file already exists
      try {
        await fs.access(filePath);
        return new NextResponse(JSON.stringify({ error: 'File already exists' }), { status: 400 });
      } catch {
        await fs.writeFile(filePath, '', 'utf-8');
      }

      return new NextResponse(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Creation failed' }), { status: 500 });
  }
}