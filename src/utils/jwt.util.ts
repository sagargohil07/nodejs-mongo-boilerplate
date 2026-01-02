import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
}

export class JWTUtil {
  private static secret = process.env.JWT_SECRET || 'JWT_SECRET';
  private static expiresIn = (process.env.JWT_EXPIRE || '7d') as string;
  private static refreshSecret = process.env.JWT_SECRET || 'JWT_SECRET';
  private static refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRE || '30d') as string;

  // Generate access token
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn']
    });
  }

  // Generate refresh token
  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn as jwt.SignOptions['expiresIn']
    });
  }

  // Verify access token
  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.secret) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.refreshSecret) as TokenPayload;
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