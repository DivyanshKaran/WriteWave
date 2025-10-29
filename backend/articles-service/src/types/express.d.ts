import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        username: string;
      };
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    name: string;
    username: string;
  };
}
