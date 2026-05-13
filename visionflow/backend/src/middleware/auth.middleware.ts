import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  id: string
  email: string
}

// checks that the user has a valid JWT token and attaches user info to the request object
export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'no token, access denied' })
    return
  }

  // Verify token and extract user info
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
    req.user = { id: decoded.id, email: decoded.email }
    next()
  } catch {
    res.status(401).json({ message: 'token is not valid' })
  }
}