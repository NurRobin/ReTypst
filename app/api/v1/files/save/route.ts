import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function PUT(req: NextRequest) {
  const { projectId, relativeFilePath, content } = await req.json();
  const filePath = path.join(process.cwd(), 'documents', projectId, relativeFilePath);

  try {
    // Check if the file exists
    await fs.access(filePath);

    // If the file exists, write the new content to it
    await fs.writeFile(filePath, content, 'utf-8');
    return new NextResponse(JSON.stringify({ message: 'File saved successfully' }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // If the file does not exist or there is an error
    return new NextResponse(JSON.stringify({ error: 'Error saving file' }), { status: 500 });
  }
}