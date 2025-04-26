import { Injectable } from "@nestjs/common";
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from "cloudinary";

@Injectable()
export class CloudinaryService {
    async uploadImage(file: Express.Multer.File, filenameSlug: string): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const upload = cloudinary.uploader.upload_stream(
                {
                    folder: "products",
                    resource_type: "image",
                    public_id: filenameSlug,  //auto set slug as image name
                    overwrite: true,
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Upload failed'));
                    resolve(result as UploadApiResponse);
                },
            );
            upload.end(file.buffer);
        });
    }

    async deleteImage(publicId: string) {
        return await cloudinary.uploader.destroy(publicId);
    }
}
