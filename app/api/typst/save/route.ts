import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const { projectId, fileName, content } = await req.json();
  const filePath = path.join(process.cwd(), 'documents', projectId, `${fileName}.typ`);

  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return new NextResponse(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Save failed' }), { status: 500 });
  }
}