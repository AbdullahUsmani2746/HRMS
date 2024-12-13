import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";
import { console } from "inspector";

export const POST = async (req) => {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

  
   
   
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "At least one file is required." },
        { status: 400 }
      );
    }

    const validMimeTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const uploadDir = path.join(process.cwd(), "public/uploads/documents");
    await fs.mkdir(uploadDir, { recursive: true });

    // Process each file
    const uploadedFiles = [];

    for (const file of files) {
      // Check MIME type for each file
      if (!validMimeTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only PDF, DOC, and DOCX are allowed.` },
          { status: 400 }
        );
      }

      // Generate unique file name and save
      const fileName = `${uuidv4()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      await fs.writeFile(filePath, fileBuffer);

      // Collect uploaded file details
      uploadedFiles.push({
        url: `/uploads/documents/${fileName}`,
        name: file.name,
        description:file.description
      });
    }

    // Return response with all uploaded files
    return NextResponse.json({
      message: "Files uploaded successfully.",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload the files. Please try again." },
      { status: 500 }
    );
  }
};
