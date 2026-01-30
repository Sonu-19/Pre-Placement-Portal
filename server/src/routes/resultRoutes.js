const express = require("express");
const Result = require("../models/Result");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.status(201).json({ message: "Result saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save result" });
  }
});

module.exports = router;

