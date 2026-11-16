import { NextFunction, Request, RequestHandler, Response } from 'express';

type TParams = Record<string, string>;

// No route uses wildcard params, so every req.params value is a plain string.
const catchAsync = (fn: RequestHandler<TParams>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as unknown as Request<TParams>, res, next)).catch(
      (err) => next(err),
    );
  };
};

export default catchAsync;
