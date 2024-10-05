import axios from "axios";

const API_URL = "https://image-upload-rwwm.vercel.app/images";

export const getImages = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};
export const addImages = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading image:");
    throw error; // rethrow the error to handle it in the calling function
  }
};

export const deletImages = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error; // rethrow to handle it in the calling function
  }
};

export const editImages = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.updatedImage; // Return the updated image data
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};
