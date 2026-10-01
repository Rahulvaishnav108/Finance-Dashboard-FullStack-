import type { AppRole } from '../constants/roles';
import type { Panel } from '../constants/roles';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: {
        _id: string;
        id: string;
        email?: string;
        role: AppRole | string;
        restaurantId?: string;
        panel?: Panel;
        internal_role?: string;
        mustChangePassword?: boolean;
      };
      tableSession?: {
        _id: string;
        restaurantId: string;
        tableId: string;
        customerName: string;
        mobile: string;
      };
    }
  }
}

export {};