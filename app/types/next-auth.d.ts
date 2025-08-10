
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      firstName?: string;
      lastName?: string;
      isAdmin: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isAdmin: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin: boolean;
    firstName?: string;
    lastName?: string;
  }
}
