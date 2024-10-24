import { Injectable, Inject } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(@Inject('Cloudinary') private cloudinary) {}

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'users' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(imageUrl: string) {
    try {
      const urlParts = imageUrl.split('/');
      const publicIdWithExt = urlParts.slice(-2).join('/'); // Gets "users/zlbqwnznbkmojjcddtow.jpg"
      const publicId = publicIdWithExt.split('.')[0]; // Removes the extension: "users/zlbqwnznbkmojjcddtow"

      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  }
}
