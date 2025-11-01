import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json({ success: false, error: 'Only .xlsx files allowed.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);
    console.log('✅ File uploaded:', filePath);

    return NextResponse.json({ success: true, filename: fileName });
  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during upload.' },
      { status: 500 },
    );
  }
}
