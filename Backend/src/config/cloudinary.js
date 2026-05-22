import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dxvn8ag5p',
  api_key: process.env.API_KEY_CLOUDINARY || '936783533515291',
  api_secret: process.env.API_SECRET_CLOUDINARY || '39lwEP_dNEyQE644YnKSHCM5NTc',
});

export { cloudinary };