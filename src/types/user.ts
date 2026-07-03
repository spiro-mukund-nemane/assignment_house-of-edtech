import type { Role } from '@/constants/roles';

// The shape of a user that's safe to send to the client — never includes passwordHash.
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
