import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const fileName = searchParams.get('fileName');
  const type = searchParams.get('type');

  if (!projectId || !fileName || !type) {
    return new NextResponse(JSON.stringify({ error: 'Missing query parameters' }), { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'documents', projectId, `${fileName}.${type}`);

  try {
    const fileData = await fs.readFile(filePath);
    return new NextResponse(fileData, {
      headers: {
        'Content-Type': `application/${type}`, // Adjust the content type based on the file type
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'File not found' }), { status: 404 });
  }
}