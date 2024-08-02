import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  const { projectId, relativeFilePath } = await req.json();

  if (!projectId || !relativeFilePath) {
    return new NextResponse(JSON.stringify({ error: 'Missing projectId or relativeFilePath' }), { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'documents', projectId, relativeFilePath);

  try {
    await execFileAsync('typst', ['compile', filePath]);
    return new NextResponse(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return new NextResponse(JSON.stringify({ success: false, error: errorMessage }), {
      headers: {
        'Content-Type': 'application/json',
        'status': '500', // Convert status to string
      },
    });
  }
}