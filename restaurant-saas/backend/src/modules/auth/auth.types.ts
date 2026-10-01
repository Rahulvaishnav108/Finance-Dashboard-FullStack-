import type { AppRole } from '../../constants/roles';

export type AuthenticatedUserDto = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: AppRole;
  restaurantId?: string;
  restaurantName?: string;
};
