export interface AccessTokenClaims {
  sub: number;
  email: string;
  jti: string;
  type: 'access';
}

export interface RefreshTokenClaims {
  sub: number;
  type: 'refresh';
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
  refreshExpiresAt: Date;
  jti: string;
}

export interface ITokenIssuer {
  issuePair(userId: number, email: string): Promise<IssuedTokens>;
  verifyRefresh(token: string): Promise<RefreshTokenClaims>;
  decodeAccess(token: string): { jti?: string; exp?: number } | null;
}
