import express from 'express';
import { getAddresses, addAddress, deleteAddress } from '../controllers/addressController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getAddresses)
  .post(protect, addAddress);

router.delete('/:id', protect, deleteAddress);

export default router;
