import { NextRequest, NextResponse } from "next/server";
import { writeFile, readdir, unlink, access, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function GET() {
  await ensureUploadDir();
  
  try {
    const files = await readdir(UPLOAD_DIR);
    const fileList: FileInfo[] = [];
    
    for (const file of files) {
      const filePath = join(UPLOAD_DIR, file);
      const stats = require("fs").statSync(filePath);
      
      if (stats.isFile()) {
        const id = file.split(".")[0];
        const ext = file.split(".").slice(1).join(".");
        const originalName = decodeURIComponent(ext ? id + "." + ext : id);
        
        fileList.push({
          id: file,
          name: originalName,
          size: stats.size,
          type: "application/octet-stream",
          uploadedAt: stats.birthtime.toISOString(),
        });
      }
    }
    
    return NextResponse.json(fileList);
  } catch (error) {
    console.error("Error reading files:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  await ensureUploadDir();
  
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const uploadedFiles: FileInfo[] = [];
    
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      const safeFileName = encodeURIComponent(file.name);
      const fileName = `${timestamp}-${random}-${safeFileName}`;
      const filePath = join(UPLOAD_DIR, fileName);
      
      await writeFile(filePath, buffer);
      
      uploadedFiles.push({
        id: fileName,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      });
    }
    
    return NextResponse.json(uploadedFiles);
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }
    
    const filePath = join(UPLOAD_DIR, id);
    await access(filePath);
    await unlink(filePath);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
