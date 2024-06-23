import type { Comment } from '@prisma/client';

import type { CommentRepository } from '@/repositories/comment.repo';
import CustomError from '@/utils/customError';

export class Commentservice {
  private CommentRepository: CommentRepository;

  constructor(CommentRepo: CommentRepository) {
    this.CommentRepository = CommentRepo;
  }

  async createComment(CommentData: any): Promise<Comment> {
    return this.CommentRepository.createComment(CommentData);
  }

  async getCommentsByProductId(productId: string): Promise<Comment[]> {
    return this.CommentRepository.findCommentsByProductId(productId);
  }

  async updateComment(id: string, CommentData: any): Promise<Comment> {
    const existingComment = await this.CommentRepository.findCommentById(id);
    if (!existingComment) {
      throw new CustomError('Comment not found', 404);
    }

    return this.CommentRepository.updateComment(id, CommentData);
  }

  async deleteComment(id: string): Promise<void> {
    const existingComment = await this.CommentRepository.findCommentById(id);
    if (!existingComment) {
      throw new CustomError('Comment not found', 404);
    }
    await this.CommentRepository.deleteComment(id);
  }
}
