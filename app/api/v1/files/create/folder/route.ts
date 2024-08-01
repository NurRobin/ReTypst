import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const { projectId, relativePath } = await req.json();
  const folderPath = path.join(process.cwd(), 'documents', projectId, relativePath);

  try {
    await fs.mkdir(folderPath, { recursive: true });
    return new NextResponse(JSON.stringify({ message: 'Folder created successfully' }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Error creating folder' }), { status: 500 });
  }
}