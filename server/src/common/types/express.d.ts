import { UserInterface } from '../../modules/auth/interfaces/user.interface';

declare global {
  namespace Express {
    interface Request {
      user: UserInterface;
    }
  }
}

export {};
