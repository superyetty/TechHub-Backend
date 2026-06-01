import Message from "../../models/messages/messages.model.js";
import User from "../../models/user/user.model.js";
import {
  validatedEmail,
  validatedPhoneNumber,
} from "../../utils/validators.js";

export const create = async (req, res) => {
  const { name, email, phoneNumber, message } = req.body;

  if (!name || !email || !phoneNumber || !message) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (!validatedEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email address" });
  }

  const normalizedPhoneNumber = validatedPhoneNumber(phoneNumber);

  

  if (!normalizedPhoneNumber) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid phone number" });
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      console.log("3");
      return res.status(400).json({
        success: false,
        message: "Email not connected to a user, kindly register.",
      });
    }

    const newMessage = {
      user: user._id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: normalizedPhoneNumber,
      message: message.trim(),
    };

    const createdMessage = await Message.create(newMessage);

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      createdMessage,
    });
  } catch (err) {
    console.log("create message error:", err?.message);
    return res
      .status(500)
      .json({ success: false, message: "An internal server error occured" });
  }
};
