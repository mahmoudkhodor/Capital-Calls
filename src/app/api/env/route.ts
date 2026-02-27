import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    blobTokenExists: !!process.env.BLOB_READ_WRITE_TOKEN,
    tokenPrefix: process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 10) || 'not set',
  });
}
