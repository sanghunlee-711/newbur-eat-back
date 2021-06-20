import { NextFunction, Request, Response } from 'express';

export const jwtMiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(req.headers);
};
