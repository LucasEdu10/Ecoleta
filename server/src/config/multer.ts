import multer from 'multer';
import path from 'path';
import crypto from 'crypto'; //gerenaod hash aleatorio

export default {
    storage: multer.diskStorage({
        destination:  path.resolve(__dirname, '..', '..', 'uploads'),
        filename(requeste, file, callback){
            const hash = crypto.randomBytes(6).toString('hex');

            const fileName = `${hash}-${file.originalname}`;

            callback(null, fileName);
            
        }
    }),
};