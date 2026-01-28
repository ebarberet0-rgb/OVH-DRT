import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@yamaha-drt/types';
import { uploadMotorcycleImage } from '../middleware/upload';

const router = Router();

// POST /api/upload/motorcycle - Upload une image de moto
router.post(
  '/motorcycle',
  authenticate,
  authorize(UserRole.ADMIN),
  uploadMotorcycleImage.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni',
        });
      }

      // URL publique de l'image
      const imageUrl = `/uploads/motorcycles/${req.file.filename}`;

      res.json({
        success: true,
        message: 'Image uploadée avec succès',
        imageUrl: imageUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
