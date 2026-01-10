import db from "../db";
import { usersTable } from "../models";
import { eq } from "drizzle-orm";

const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email));
  return user;
};

const createUser = async ({
  firstName,
  lastName,
  email,
  hashedPassword,
  salt,
}: {
  firstName: string;
  lastName?: string;
  email: string;
  hashedPassword: string;
  salt: string;
}) => {
  const [newUser] = await db
    .insert(usersTable)
    .values({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      salt,
    })
    .returning({
      id: usersTable.id,
    });
  return newUser;
};

export { getUserByEmail, createUser };
