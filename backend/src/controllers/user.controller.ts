import { Request, Response } from "express";
import {formatZodError} from "../utils/formatZodError";
// You can now use:
import { createUserSchema, loginUserSchema} from "../validations";
import { hashPassword } from "../utils/hash";
import { getUserByEmail, createUser } from "../services/user.service";
import { generateUserToken } from "../utils/token";

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
      const formatedError = formatZodError(validationResult.error);
      return res.status(400).json({ error: formatedError });
    }
  const { email, password } = validationResult.data;
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: "User with email does not exist!" });
  }
  const { password: hashedPassword } = hashPassword(password, user.salt);
  if (hashedPassword !== user.password) {
    return res.status(400).json({ error: "Invalid email or password" });
  }

  const token = generateUserToken({ id: user.id, email: user.email });
  return res.status(200).json({ message: "Login successfully!", token });
};

export { signupUser, loginUser };
