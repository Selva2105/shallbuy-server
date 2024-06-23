import type { Request, Response } from 'express';

import type { Commentservice } from '@/services/comment.service';
import asyncHandler from '@/utils/asyncErrorHandler';

export class CommentController {
  private Commentservice: Commentservice;

  constructor(Commentservice: Commentservice) {
    this.Commentservice = Commentservice;
  }

  public createComment = asyncHandler(async (req: Request, res: Response) => {
    const Comment = await this.Commentservice.createComment(req.body);
    res.status(201).json(Comment);
  });

  public getCommentsByProductId = asyncHandler(
    async (req: Request, res: Response) => {
      const comments = await this.Commentservice.getCommentsByProductId(
        req.params.productId || '',
      );
      res.status(200).json(comments);
    },
  );

  public updateComment = asyncHandler(async (req: Request, res: Response) => {
    const updatedComment = await this.Commentservice.updateComment(
      req.params.id || '',
      req.body,
    );
    res.status(200).json(updatedComment);
  });

  public deleteComment = asyncHandler(async (req: Request, res: Response) => {
    await this.Commentservice.deleteComment(req.params.id || '');
    res.status(204).send();
  });
}
