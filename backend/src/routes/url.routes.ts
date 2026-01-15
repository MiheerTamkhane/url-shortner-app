import { Router } from "express";
import { shortenUrl, redirectToTargetURL, getAllUrlsForUser, deleteUrl } from "../controllers/url.controller";
import { ensureAuthenticated } from "../middlewares/auth.middleware";

const router = Router();

router.post("/shorten", ensureAuthenticated, shortenUrl);

router.get("/codes", ensureAuthenticated, getAllUrlsForUser);

router.delete("/:id", ensureAuthenticated, deleteUrl);

router.get("/:shortCode", redirectToTargetURL);


export default router;