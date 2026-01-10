import db from "../db";
import { usersTable } from "../models";
import {eq} from "drizzle-orm";


const createUser = async (req, res) => {
  // Logic to create a new user
  res.status(201).json({ message: "User created" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
};

export { createUser, loginUser };