import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(_: unknown) {
  const projectsPath = path.join(process.cwd(), 'documents');

  try {
    const projectFiles = await fs.readdir(projectsPath);
    const projects = projectFiles.map((project) => ({
      id: project,
    }));

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}