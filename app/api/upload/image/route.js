import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

export const POST = async (req) => {
  const formData = await req.formData();
  console.log(formData)
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public/uploads/profileImage");
  await fs.mkdir(uploadDir, { recursive: true });

  const fileName = `${uuidv4()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(filePath, fileBuffer);

  return NextResponse.json({ url: `/uploads/profileImage/${fileName}` });
};
