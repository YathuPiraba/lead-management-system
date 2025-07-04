import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folderName: string = 'general',
  ): Promise<{ url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderName,
          resource_type: 'image',
        },
        (error, result: UploadApiResponse) => {
          if (error) {
            this.logger.error('Cloudinary upload failed', error);
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    const publicId = this.extractPublicId(imageUrl);
    if (!publicId) {
      this.logger.warn('No public ID found in image URL');
      return false;
    }

    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });
      return true;
    } catch (error) {
      this.logger.error('Failed to delete image', error);
      return false;
    }
  }

  private extractPublicId(imageUrl: string): string | null {
    try {
      const url = new URL(imageUrl);
      const path = url.pathname.split('/');
      const fileName = path[path.length - 1];
      const [publicId] = fileName.split('.');
      const folderPath = path.slice(2, path.length - 1).join('/'); // removes /vXXX/
      return `${folderPath}/${publicId}`;
    } catch (e) {
      this.logger.warn('Invalid image URL format');
      return null;
    }
  }
}
