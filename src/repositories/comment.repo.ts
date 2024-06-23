import type { Comment, Prisma, PrismaClient } from '@prisma/client';

export class CommentRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async createComment(
    CommentData: Prisma.CommentCreateInput,
  ): Promise<Comment> {
    return this.prisma.comment.create({
      data: CommentData,
    });
  }

  async findCommentsByProductId(productId: string): Promise<Comment[]> {
    return this.prisma.comment.findMany({
      where: { productId },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async findCommentById(commentId: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
      where: { id: commentId },
    });
  }

  async updateComment(
    id: string,
    CommentData: Prisma.CommentUpdateInput,
  ): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id },
      data: CommentData,
    });
  }

  async deleteComment(id: string): Promise<Comment> {
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
