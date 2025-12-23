import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
}

export class JWTUtil {
  private static secret = process.env.JWT_SECRET || 'your_secret_key';
  private static expiresIn = (process.env.JWT_EXPIRE || '7d') as string;

  // Generate JWT token
static generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, this.secret, {
    expiresIn: this.expiresIn as jwt.SignOptions['expiresIn']
  });
}
  // Verify JWT token
  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  // Decode token without verification
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}