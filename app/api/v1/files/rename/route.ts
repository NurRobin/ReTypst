import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function PATCH(req: NextRequest) {
  const { projectId, oldPath, newPath } = await req.json();
  const oldFilePath = path.join(process.cwd(), 'documents', projectId, oldPath);
  const newFilePath = path.join(process.cwd(), 'documents', projectId, newPath);

  try {
    // Check if the old file exists
    await fs.access(oldFilePath);

    // Rename the file
    await fs.rename(oldFilePath, newFilePath);
    return new NextResponse(JSON.stringify({ message: 'File renamed successfully' }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // If there is an error
    return new NextResponse(JSON.stringify({ error: 'Error renaming file' }), { status: 500 });
  }
}