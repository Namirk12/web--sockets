import { Router } from "express";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// ------------------------ LOGIN ENDPOINT -----------------------------
router.post("/login", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  // Create userId
  const userId = uuid();

  // Make JWT
  const token = jwt.sign(
    { sub: userId, name },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({
    userId,
    name,
    token
  });
});

export default router;
