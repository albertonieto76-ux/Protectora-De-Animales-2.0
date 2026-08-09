declare namespace Express {
  interface Request {
    authUser?: {
      id: number;
      role: string;
      email?: string;
    };
  }
}

export {};
