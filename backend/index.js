if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const ImageUpload = require("./models/ImageSchema");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path"); // Require the path module

const cors = require("cors");
app.use(cors());
app.use(
  cors({
    origin: [""],
    methods: ["POST", "GET"],
    credentials: true,
  })
);

const { storage, cloudinary } = require("./cloudConfig");
const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get("*", (req, res) =>
//   res.sendFile(path.join(__dirname, "./web/build/index.html"))
// );

main()
  .then(() => {
    console.log("connection is done");
  })
  .catch((err) => console.log(err));

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("server connection is successful");
  } catch (err) {
    console.log("server connection is failed");
    throw err;
  }
}

app.post("/images", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { filename, path } = req.file; // Use 'path' to get the file path
  const imageUpload = new ImageUpload({
    imageName: filename,
    imagePath: path,
  });

  try {
    // Log the correct file path

    await imageUpload.save();
    res.status(201).json({ url: path });
  } catch (error) {
    res.status(500).json({ error: "Error saving image" });
  }
});
app.get("/images", async (req, res) => {
  try {
    // Fetch all images from the database
    const images = await ImageUpload.find({});

    if (images.length === 0) {
      return res.status(404).json({ message: "No images found" });
    }

    // Map through the images and create a response with the correct URLs
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving images" });
  }
});

app.delete("/images/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const objectId = new mongoose.Types.ObjectId(id);
    const image = await ImageUpload.findById(objectId);
    if (!image) {
      console.error("Image not found in the database for ID:");
      return res.status(404).json({ error: "Image not found" });
    }

    // Deleting the image from Cloudinary
    const publicId = image.imageName.split(".")[0]; // Assuming imageName includes the extension
    await cloudinary.uploader.destroy(publicId);

    // Deleting the image document from the database
    await ImageUpload.findByIdAndDelete(objectId);

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error while deleting image:", error);
    res.status(500).json({ error: "Error deleting image" });
  }
});
// Edit Image Details Route
app.put("/images/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  try {
    const image = await ImageUpload.findById(id);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Logic for updating the image
    image.imageName = req.file.filename;
    image.imagePath = req.file.path;

    await image.save();
    res.status(200).json({
      message: "Image updated successfully",
      updatedImage: image,
    });
  } catch (error) {
    console.error("Error updating image:");
    res.status(500).json({ error: "Failed to update image" });
  }
});

console.log(path.resolve(__dirname, "../frontend/dist"));
app.use(express.static(path.join(__dirname, "../frontend/dist"))); // Adjust path accordingly

// Fallback route for serving index.html
app.get("*", (_, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});