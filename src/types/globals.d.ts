import { User } from "./types";

export {};

declare global {
  type CustomJwtSessionClaims = User;
}
