
// utils/storage.ts
"use server"

import { createClient } from "../supabase/server";

const supabase = createClient();

export const uploadToStorage = async (
  file: File,
  folder: "images/drivers" | "files/driver"
): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await (await supabase).storage
      .from("files") // <-- bucket name is "files"
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Upload error:", error.message);
      return null;
    }

    // Return public URL
    const { data } = (await supabase).storage.from("files").getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error("Unexpected error during upload:", err);
    return null;
  }
};
