import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const { projectId } = await req.json();

  try {
    const projectPath = path.join(process.cwd(), 'documents', projectId);

    // Check if the project directory already exists
    try {
      await fs.access(projectPath);
      return new NextResponse(JSON.stringify({ error: 'Project already exists' }), { status: 400 });
    } catch {
      // Directory does not exist, proceed to create it
      await fs.mkdir(projectPath, { recursive: true });
    }

    // Create the main.typ file in the new project directory
    await fs.writeFile(path.join(projectPath, 'main.typ'), '= New Project', 'utf-8');

    return new NextResponse(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Creation failed' }), { status: 500 });
  }
}