import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { getImages, addImages, deletImages, editImages } from "./Api";

const App = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState(null);
  const [edit, setEdit] = useState(false);

  // Fetch all images when the component mounts
  useEffect(() => {
    fetchImages();
  }, [uploadedImage]); // Refetch images when a new image is uploaded

  const fetchImages = async () => {
    try {
      // const response = await axios.get(`${API_URL}/images`);

      const response = await getImages();
      let data = response.map((item) => {
        return item;
      });
      setImages(data); // Set the images in state
    } catch (error) {
      console.error("Error fetching images:");
      throw error;
    }
  };

  // Handle image upload
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
      const imageAdd = await addImages(formData);
      setUploadedImage(imageAdd);
    } catch (error) {
      console.error("Error uploading image:");
      throw error;
    }
  };

  const deleteHandler = async (id) => {
    if (!id) {
      console.error("No ID passed to deleteHandler"); // Check for missing ID
      return;
    }

    try {
      await deletImages(id);

      setImages(images.filter((item) => item._id !== id)); // Update state
    } catch (error) {
      console.error("Error while deleting image:"); // Log errors
      throw error;
    }
  };

  const editHandler = (id) => {
    setEdit(true);

    // Find the image by id in the images array
    const imageToEdit = images.find((image) => image._id === id);

    if (!imageToEdit) {
      console.error("Image not found for editing.");
      return;
    }

    setNewImage(imageToEdit); // Set the image to be edited in state
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setEdit(false);

    const formData = new FormData(event.target);
    const imageFile = formData.get("image");

    if (!imageFile) {
      console.error("No image file selected");
      return;
    }

    try {
      const updatedImage = await editImages(newImage._id, formData); // Pass formData containing the new image

      // Update the state to reflect the new image in the UI
      setImages(
        images.map((image) =>
          image._id === newImage._id ? updatedImage : image
        )
      );
      setNewImage(updatedImage); // Update the current image state
      console.log("Image replaced successfully:");
    } catch (error) {
      console.error("Error replacing image:");
      throw error;
    }
  };

  return (
    <div className="container">
      <h3>Upload an Image</h3>
      {edit === true ? (
        <form onSubmit={handleSave} encType="multipart/form-data">
          <input type="file" name="image" />
          <button type="submit">save</button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input type="file" name="image" />
          <button type="submit">Upload</button>
        </form>
      )}

      <div className="image-gallery">
        {images.length === 0 ? (
          <p>No images uploaded yet.</p>
        ) : (
          images.map((image, index) => {
            return (
              <div key={index} className="image-item">
                <img src={image.imagePath} alt={image.filename} />
                <button onClick={() => deleteHandler(image._id)}>Delete</button>
                <button onClick={() => editHandler(image._id, setEdit(true))}>
                  edit
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default App;
