import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: 'dkrts2wv9',
  api_key: '346566731948151',
  api_secret: 't8XdHOHzH0hd63k9w503NPHlClk',
});

// Helper function to upload a single image using upload_stream
export const uploadImage = (imageBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        overwrite: true,
        invalidate: true,
        resource_type: 'auto',
      },
      (error, result) => {
        if (result && result.secure_url) {
          return resolve(result.secure_url);
        }
        return reject({ message: error?.message });
      },
    );

    // Create a stream from the buffer and pipe it to Cloudinary
    Readable.from(imageBuffer).pipe(uploadStream);
  });
};

// Function to upload multiple images
export const uploadMultipleImages = (imageBuffers) => {
  const uploads = imageBuffers.map((imageBuffer) => uploadImage(imageBuffer));
  return Promise.all(uploads);
};

// export const uploadImage = (image: any) => {
//   //imgage = > base64
//   return new Promise((resolve, reject) => {
//     v2.uploader.upload(
//       image,
//       {
//         overwrite: true,
//         invalidate: true,
//         resource_type: 'auto',
//       },
//       (error, result) => {
//         if (result && result.secure_url) {
//           console.log(result.secure_url);
//           return resolve(result.secure_url);
//         }
//         console.log(error.message);
//         return reject({ message: error.message });
//       },
//     );
//   });
// };

// export const uploadMultipleImages = (images: any[]) => {
//   return new Promise((resolve, reject) => {
//     const uploads = images.map((base: any) => uploadImage(base));
//     Promise.all(uploads)
//       .then((values) => resolve(values))
//       .catch((err) => reject(err));
//   });
// };
