"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryProvider = void 0;
const cloudinary_1 = require("cloudinary");
exports.CloudinaryProvider = {
    provide: 'CLOUDINARY',
    useFactory: () => {
        return cloudinary_1.v2.config({
            cloud_name: 'dtwulja9k',
            api_key: '149478564338913',
            api_secret: 'FhyhWx8RnOJ5osPCDQrg2jcv688',
        });
    },
};
//# sourceMappingURL=uplaod.provider.js.map