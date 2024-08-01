import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const { projectId, relativePath, content } = await req.json();
  const filePath = path.join(process.cwd(), 'documents', projectId, relativePath);

  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return new NextResponse(JSON.stringify({ message: 'File created successfully' }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Error creating file' }), { status: 500 });
  }
}