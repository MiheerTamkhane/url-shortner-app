import { Request, Response } from "express";
import { shortenUrlPostRequestSchema } from "../validations/request.validation";
import { formatZodError } from "../utils/formatZodError";
import { nanoid } from "nanoid";
import { insertUrl, findTargetURLByShortCode, getAllUrlsByUserId, deleteUrlById } from "../services/url.service";

export const shortenUrl = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const vvalidationResult = shortenUrlPostRequestSchema.safeParse(req.body);
  if (vvalidationResult.error) {
    const formatedError = formatZodError(vvalidationResult.error);
    return res.status(400).json({ error: formatedError });
  }
  const { url, code } = vvalidationResult.data;

  const result = await insertUrl({
    userId: userId,
    targetURL: url,
    shortCode: code ?? nanoid(7),
  });

  return res.status(201).json({
    result,
    message: "URL shortened successfully",
  });
};

export const getAllUrlsForUser = async (req: Request, res: Response) => {
    const codes = await getAllUrlsByUserId(req.user!.id);

    return res.status(200).json({ data: codes });
};

export const redirectToTargetURL = async (req: Request, res: Response) => {
  const code = req.params.shortCode;
  const result = await findTargetURLByShortCode(code);

  if (!result || !result.targetURL) {
    return res.status(404).json({ error: "Invalid URL" });
  }

  // Redirect to the stored target URL
  return res.redirect(result.targetURL);
};

export const deleteUrl = async (req: Request, res: Response) => {
    const urlId:string = req.params.id;
    const userId = req.user!.id;
    
    const deletionSuccess = await deleteUrlById(urlId, userId);
    if (!deletionSuccess) {
        return res.status(404).json({ error: "URL not found or could not be deleted" });
    }
    
    return res.status(200).json({ message: "URL deleted successfully" });
};