
declare namespace Express {
// Extend the Express Request interface to include user information
  interface Request {
    user?: {
      id: string
      email: string
    }
  }
}