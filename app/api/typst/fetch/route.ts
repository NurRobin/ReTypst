import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const { fileName, type } = await req.json();

  if (type === 'pdf') {
    return NextResponse.redirect(`/api/typst/fetch?fileName=${fileName}&type=pdf`);
  } else {
    const filePath = path.resolve(`./documents/${fileName}.typ`);
    try {
      const fileData = await fs.readFile(filePath, 'utf-8');
      return NextResponse.json({ content: fileData });
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: 'Typst file not found' }), { status: 404 });
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('fileName');
  const type = searchParams.get('type');

  if (type === 'pdf') {
    const pdfPath = path.resolve(`./documents/${fileName}.pdf`);
    try {
      const pdfData = await fs.readFile(pdfPath);
      return new NextResponse(pdfData, {
        headers: {
          'Content-Type': 'application/pdf',
        },
      });
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: 'PDF file not found' }), { status: 404 });
    }
  } else {
    return new NextResponse(JSON.stringify({ error: 'Invalid request type' }), { status: 400 });
  }
}
