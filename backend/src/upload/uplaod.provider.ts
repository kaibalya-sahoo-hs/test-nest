import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    return cloudinary.config({
      cloud_name: 'dtwulja9k',
      api_key: '149478564338913',
      api_secret: 'FhyhWx8RnOJ5osPCDQrg2jcv688',
    });
  },
};