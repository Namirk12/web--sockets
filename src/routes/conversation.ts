import { Router } from "express";
import { v4 as uuid } from "uuid";

const router = Router();

// (Later we will store/retrieve from DB)
// For now we store in-memory map to simulate DB
const conversationMap = new Map<string, string>(); 
// key: "userA|userB" , value: conversationId

router.post("/create", (req, res) => {
  const { userA, userB } = req.body;

  if (!userA || !userB) {
    return res.status(400).json({ error: "userA and userB are required" });
  }

  // Order-insensitive key (user1|user2 == user2|user1)
  const key = [userA, userB].sort().join("|");

  // If conversation already exists, return same ID
  if (conversationMap.has(key)) {
    return res.json({ conversationId: conversationMap.get(key) });
  }

  // Otherwise create new conversationId
  const conversationId = "conv_" + uuid().slice(0, 8);

  conversationMap.set(key, conversationId);

  res.json({ conversationId });
});

export default router;
