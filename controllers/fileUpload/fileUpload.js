import cloudinary from "../../config/cloudinary.js";

const fileUpload = async (req, res) => {
  const  files  = req.files;
  if (!files || files.length === 0) {
    console.log('error 1')
    return res
      .status(400)
      .json({ success: false, message: "No images provided." });
  }
  console.log("files:", files);
   console.log('error 3')

  try {
    const uploadedImage = [];

    for (const file of files) {
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64",
      )}`;

      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "myUploads/myProjects/techHubWear",
      });
      console.log("file uploads:", result);

      uploadedImage.unshift({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }
    console.log('error 2')

    res.status(200).json({
      
      success: true,
      message: "image uploaded successfully",
      image: uploadedImage,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "An internal error has occured" });
  }
};

export default fileUpload;
