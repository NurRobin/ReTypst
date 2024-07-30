import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const { projectId, fileName } = await req.json();
  const filePath = path.join(process.cwd(), 'documents', projectId, `${fileName}.typ`);

  try {
    await execAsync(`typst compile ${filePath}`);
    const pdfPath = path.join(process.cwd(), 'documents', projectId, `${fileName}.pdf`);
    const pdfData = await fs.readFile(pdfPath);
    return new NextResponse(pdfData, {
      headers: {
        'Content-Type': 'application/pdf',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Compilation failed' }), { status: 500 });
  }
}