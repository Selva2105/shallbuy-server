import { PrismaClient } from '@prisma/client';
import express from 'express';

import { CommentController } from '@/controller/comment.controller';
import { ProtectMiddleware } from '@/middleware/protect';
import { CommentRepository } from '@/repositories/comment.repo';
import { Commentservice } from '@/services/comment.service';

const router = express.Router();
const prisma = new PrismaClient();
const CommentRepo = new CommentRepository(prisma);
const Commentservices = new Commentservice(CommentRepo);
const CommentControllers = new CommentController(Commentservices);

router.post('/', ProtectMiddleware.protect, CommentControllers.createComment);
router.get('/product/:productId', CommentControllers.getCommentsByProductId);
router.put('/:id', ProtectMiddleware.protect, CommentControllers.updateComment);
router.delete(
  '/:id',
  ProtectMiddleware.protect,
  CommentControllers.deleteComment,
);

export default router;
