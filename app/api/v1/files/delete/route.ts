import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(req: NextRequest) {
  const { projectId, relativePath } = await req.json();
  const filePath = path.join(process.cwd(), 'documents', projectId, relativePath);

  try {
    await fs.unlink(filePath);
    return new NextResponse(JSON.stringify({ message: 'File deleted successfully' }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Error deleting file' }), { status: 500 });
  }
}