import { cloudinary } from "../config/cloudinary.js";

export function uploadImage(buffer: Buffer, folder = "missing-piece/products"): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Image upload failed"));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
}