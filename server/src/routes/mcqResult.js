import express from "express";
import McqResult from "../models/McqResult.js";

const router = express.Router();

/**
 * Save MCQ Test Result
 */
router.post("/", async (req, res) => {
  try {
    const result = await McqResult.create(req.body);
    res.status(201).json({
      success: true,
      message: "MCQ result saved",
      result
    });
  } catch (error) {
    console.error("MCQ Result Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save MCQ result"
    });
  }
});

/**
 * Get results (Admin / Student dashboard)
 */
router.get("/", async (req, res) => {
  try {
    const results = await McqResult.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

export default router;
