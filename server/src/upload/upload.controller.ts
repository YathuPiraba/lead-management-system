import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is missing');
    }

    try {
      const result = await this.cloudinaryService.uploadImage(file);
      return {
        message: 'File uploaded successfully',
        url: result.secure_url,
      };
    } catch (error) {
      throw new BadRequestException('File upload failed: ' + error.message);
    }
  }
}
