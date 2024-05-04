import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import multer from 'multer';

import { firebaseConfig } from '@/config/firebaseConfig';
import { UserController } from '@/controller/auth.controller';
import { ProtectMiddleware } from '@/middleware/protect';
import { UserRepository } from '@/repositories/auth.repo';
import { UserService } from '@/services/auth.services';
import Mailer from '@/utils/mailer';
import TokenService from '@/utils/SignToken';

const router = Router();
const prisma = new PrismaClient();
const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
const userRepository = new UserRepository(prisma, firebaseApp);
const mailer = new Mailer();
const tokenService = new TokenService();
const userService = new UserService(userRepository, mailer, tokenService);
const userController = new UserController(userService);

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

// GET Routes
router.get('/users', ProtectMiddleware.protect, userController.getAllUsers);
router.get('/verifyEmail/:emailVerificationToken', userController.verifyEmail);
router.get('/user/:id', ProtectMiddleware.protect, userController.getUserById);

// POST Routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', ProtectMiddleware.protect, userController.logout);
router.post(
  '/user/profileUpload/:id',
  ProtectMiddleware.protect,
  upload,
  userController.uploadProfile,
);

// PATCH Routes
router.patch(
  '/user/:id/changePassword',
  ProtectMiddleware.protect,
  userController.changePassword,
);
router.patch(
  '/user/:id/settings',
  ProtectMiddleware.protect,
  userController.updateUserSettings,
);
router.patch(
  '/user/:id/profile',
  ProtectMiddleware.protect,
  upload,
  userController.updateUserProfileById,
);

// DELETE Routes
router.delete(
  '/user/:id',
  ProtectMiddleware.protect,
  userController.deleteUserById,
);

export default router;
