import { and, eq } from "drizzle-orm";
import db from "../db";
import { urlsTable } from "../models";

const insertUrl = async ({
  userId,
  targetURL,
  shortCode,
}: {
  userId: string;
  targetURL: string;
  shortCode: string;
}) => {
  const [newUrl] = await db
    .insert(urlsTable)
    .values({
      userId,
      targetURL,
      shortCode,
    })
    .returning({
      id: urlsTable.id,
      targetURL: urlsTable.targetURL,
      shortCode: urlsTable.shortCode,
    });
  return newUrl;
};

const findTargetURLByShortCode = async (shortCode: string) => {
  const [urlRecord] = await db
    .select({
      targetURL: urlsTable.targetURL,
    })
    .from(urlsTable)
    .where(eq(urlsTable.shortCode, shortCode));
  return urlRecord;
};

const getAllUrlsByUserId = async (userId: string) => {
  const urlRecords = await db
    .select()
    .from(urlsTable)
    .where(eq(urlsTable.userId, userId));
  return urlRecords;
};

const deleteUrlById = async (id: string, userId: string) => {
  try {
    await db
      .delete(urlsTable)
      .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, userId)));
  } catch (err) {
    return false;
  }
  return true;
};

export {
  insertUrl,
  findTargetURLByShortCode,
  getAllUrlsByUserId,
  deleteUrlById,
};
