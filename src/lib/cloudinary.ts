import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary exactly once using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Uploads a file buffer to Cloudinary via stream.
 * Automatically applies f_auto and q_auto optimizations.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = 'orinko/products'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        fetch_format: 'auto', // f_auto
        quality: 'auto',      // q_auto
        resource_type: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          console.error('[Cloudinary] Upload Error:', error);
          reject(error || new Error("Upload failed"));
          return;
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Deletes an image from Cloudinary using its public_id.
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok' || result.result === 'not found';
  } catch (error) {
    console.error('[Cloudinary] Delete Error:', error);
    return false;
  }
}
