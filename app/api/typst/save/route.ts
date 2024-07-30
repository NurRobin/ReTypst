import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
  const { fileName, content } = await req.json();
  const filePath = `./documents/${fileName}.typ`;

  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Save failed' }), { status: 500 });
  }
}
