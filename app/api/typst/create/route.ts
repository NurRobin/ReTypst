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
      await fs.writeFile(path.join(projectPath, 'main.typ'), '', 'utf-8');
    }

    if (type === 'project') {
      // Create a new directory with the given name -> fileName
      const newProjectPath = path.join(process.cwd(), 'documents', fileName);
      await fs.mkdir(newProjectPath, { recursive: true });

      return new NextResponse(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (type === 'directory') {
      // Create a new directory with the given name -> fileName
      const directoryPath = path.join(projectPath, fileName);
      await fs.mkdir(directoryPath, { recursive: true });

      return new NextResponse(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      // Create a new file with the given name and type -> fileName.type
      const filePath = path.join(projectPath, `${fileName}.${type}`);
      await fs.writeFile(filePath, '', 'utf-8');

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