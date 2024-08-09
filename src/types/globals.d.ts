import { User } from "./types";

export {};

declare global {
  interface CustomJwtSessionClaims extends User {}
}
