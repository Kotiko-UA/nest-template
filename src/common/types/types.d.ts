declare global {
  namespace Express {
    interface Request {
      recaptcha?: { score: number; action?: string };
    }
  }
}
export {};
