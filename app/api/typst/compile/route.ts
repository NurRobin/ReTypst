import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const { fileName } = await req.json();
  const filePath = `./documents/${fileName}.typ`;

  try {
    await execAsync(`typst compile ${filePath}`);
    const pdfPath = `./documents/${fileName}.pdf`;
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
