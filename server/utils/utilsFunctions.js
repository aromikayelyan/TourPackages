import path from 'path'
import fs from 'fs'


export async function deleteImages(name) {
    const uploadsPath = path.resolve('uploads/')
    const fullPath = path.join(uploadsPath, name)
    if (fs.existsSync(fullPath)) {
        fs.unlink(fullPath, err => {
            if (err) console.error('Error deleting file:', err);
        });
    }
}
