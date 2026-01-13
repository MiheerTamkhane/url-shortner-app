import { createHmac, randomBytes } from "node:crypto";

export const hashPassword = (str: string, userSalt?:string) => {
  const salt = userSalt ?? randomBytes(256).toString("hex");
  const hasehdPassword = createHmac("sha256", salt).update(str).digest("hex");
  return {
    salt,
    password: hasehdPassword,
  };
};
