import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "./cloudinary.service";

@Controller('upload')
export class UploadController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Post('images')
    @UseInterceptors(FilesInterceptor('images'))
    async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
        const uploadedImages = await Promise.all(
            files.map(file => this.cloudinaryService.uploadImage(file, "products"))
        )

        return uploadedImages.map((image) => ({
            url: image.secure_url,
            publicId: image.public_id,
        }))
    }
}
