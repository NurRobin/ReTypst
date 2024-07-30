import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Missing projectId query parameter' }, { status: 400 });
  }

  const projectPath = path.join(process.cwd(), 'documents', projectId);

  try {
    const files = readFilesRecursively(projectPath);
    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to list files' }, { status: 500 });
  }
}

function readFilesRecursively(dirPath: string): any {
  const result: any = {};

  const readDir = (currentPath: string, obj: any) => {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        obj[item] = {};
        readDir(itemPath, obj[item]); // Recursively read subdirectories
      } else {
        obj[item] = item; // Add file to the current directory object
      }
    }
  };

  readDir(dirPath, result);

  return result;
}