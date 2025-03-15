export interface JwtPayload {
  /**
   * Subject of the JWT. In our case, it's the user ID.
   * Standard claim name is 'sub'.
   */
  sub: number;

  /**
   * Username of the user.
   * This is included as additional information in the payload.
   */
  username: string;

  /**
   * You can add other relevant user information or claims here if needed.
   * For example, user roles, email, etc.
   *
   * Example:
   * roles?: string[];
   * email?: string;
   */

  // ... add other claims as needed
}
