import { jwtDecode } from "jwt-decode";

export function getTokenExpiry(token) {
  const decodedToken = jwtDecode(token);
  if (!decodedToken || !decodedToken.exp) {
    throw new Error("Invalid token");
  }
  return decodedToken.exp;
}
