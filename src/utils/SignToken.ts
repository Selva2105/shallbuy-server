import jwt from 'jsonwebtoken';

/**
 * Class to handle JWT token operations.
 */
class TokenService {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.SECRET_STR!;
  }

  /**
   * Signs a JWT token with the provided user ID.
   *
   * @param id - User ID to be included in the token payload.
   * @returns Generated JWT token.
   */
  public signToken(id: string): string {
    const token = jwt.sign({ id }, this.secretKey);

    return token;
  }
}

export default TokenService;
