import { Request, Response } from "express";
import { z } from "zod";
// You can now use:
import { createUserSchema, loginUserSchema} from "../validations";
import { hashPassword } from "../utils/hash";
import { getUserByEmail, createUser } from "../services/user.service";

const signupUser = async (req: Request, res: Response) => {
  try {
    const validationResult = createUserSchema.safeParse(req.body);
    if (validationResult.error) {
      const formatedError = z.treeifyError(validationResult.error);
      return res.status(400).json({ error: formatedError });
    }
    const { firstName, lastName, email, password } = validationResult.data;

    // check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    // hash the password
    const { salt, password: hashedPassword } = hashPassword(password);

    // create the user
    const newUser = await createUser({
      firstName,
      lastName,
      email,
      hashedPassword,
      salt,
    });
    return res
      .status(201)
      .json({ message: "User created successfully", data: { id: newUser.id } });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const loginUser = async (req: Request, res: Response) => {
    const validationResult = loginUserSchema.safeParse(req.body);
    if (validationResult.error) {
      const formatedError = z.treeifyError(validationResult.error);
      return res.status(400).json({ error: formatedError });
    }
  const { email, password } = validationResult.data;
  

};

export { signupUser, loginUser };
