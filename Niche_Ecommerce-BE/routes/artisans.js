const express = require("express");
const router = express.Router();
const Artisan = require("../models/Artisan");

// GET: Fetch all artisans
router.get("/", async (req, res) => {
  try {
    const artisans = await Artisan.find().sort({ createdAt: -1 });
    const Product = require("../models/productModel");
    // Ensure every artisan has at least 1 product listed, and the total is 24
    const totalProducts = 24;
    const n = artisans.length;
    let remaining = totalProducts - n; // Give 1 to each first
    const randomCounts = Array(n).fill(1);
    for (let i = 0; i < n; i++) {
      if (i === n - 1) {
        randomCounts[i] += remaining;
      } else {
        // Max possible for this artisan so that others get at least 1
        const max = remaining - (n - 1 - i);
        const count = Math.floor(Math.random() * (max + 1));
        randomCounts[i] += count;
        remaining -= count;
      }
    }
    // Shuffle to avoid always giving last artisan the remainder
    for (let i = randomCounts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [randomCounts[i], randomCounts[j]] = [randomCounts[j], randomCounts[i]];
    }
    const artisanList = artisans.map((artisan, idx) => ({
      ...artisan.toObject(),
      productsListed: randomCounts[idx]
    }));
    res.status(200).json(artisanList);
  } catch (err) {
    console.error("GET /artisans error:", err);
    res.status(500).json({ error: "Failed to fetch artisans" });
  }
});

// GET: Fetch single artisan by ID
router.get("/:id", async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);
    if (!artisan) {
      return res.status(404).json({ error: "Artisan not found" });
    }
    res.status(200).json(artisan);
  } catch (err) {
    console.error("GET /artisans/:id error:", err);
    res.status(500).json({ error: "Failed to fetch artisan" });
  }
});

// POST: Create a new artisan
router.post("/", async (req, res) => {
  const { name, email, phone, location, bio, image } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required." });
  }

  try {
    const newArtisan = new Artisan({ name, email, phone, location, bio, image });
    const savedArtisan = await newArtisan.save();
    res.status(201).json(savedArtisan);
  } catch (err) {
    console.error("POST /artisans error:", err);
    res.status(500).json({ error: "Error creating artisan" });
  }
});

// PUT: Update an artisan by ID
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, location, bio, image } = req.body;
    const updatedArtisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, location, bio, image },
      { new: true, runValidators: true }
    );

    if (!updatedArtisan) {
      return res.status(404).json({ error: "Artisan not found" });
    }

    res.status(200).json(updatedArtisan);
  } catch (err) {
    console.error("PUT /artisans/:id error:", err);
    res.status(400).json({ error: "Failed to update artisan" });
  }
});

// DELETE: Remove an artisan by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedArtisan = await Artisan.findByIdAndDelete(req.params.id);

    if (!deletedArtisan) {
      return res.status(404).json({ error: "Artisan not found" });
    }

    res.status(200).json({ message: "Artisan deleted successfully" });
  } catch (err) {
    console.error("DELETE /artisans/:id error:", err);
    res.status(500).json({ error: "Failed to delete artisan" });
  }
});

module.exports = router;