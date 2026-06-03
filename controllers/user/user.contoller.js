import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../../models/user/user.model.js";
import {
  validatedEmail,
  validatedPassword,
  validatedPhoneNumber,
} from "../../utils/validators.js";

dotenv.config();

const generateToken = async (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.USER_SECRET_TOKEN, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.USER_REFRESH_TOKEN, {
    expiresIn: "30m",
  });

  return { accessToken, refreshToken };
};

const isProduction = process.env.NODE_ENV === "production";

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "Lax",
};

export const register = async (req, res) => {
  const { firstName, lastName, email, age, phoneNumber, address, password } =
    req.body;
  if (
    !firstName ||
    !lastName ||
    !email ||
    !age ||
    !phoneNumber ||
    !address ||
    !password
  ) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  const normalizePhoneNumber = validatedPhoneNumber(phoneNumber);

  if (!normalizePhoneNumber) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid phone number" });
  }

  if (age < 18) {
    return res.status(400).json({
      success: false,
      message: "Only user with age 18 and above are eligible to register",
    });
  }

  if (!validatedPassword(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be 8+ characters and include uppercase, lowercase, number and special character",
    });
  }

  if (!validatedEmail(email)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid email address" });
  }

  try {
    const newUser = {
      firstName,
      lastName,
      email,
      age,
      phoneNumber: normalizePhoneNumber,
      address,
      password,
    };
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "User with this email already exists, try login or use another email",
      });
    }
    const user = await User.create(newUser);
    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "An unexpected error occured while creating profile, please again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile created successfully.",
      user,
    });
  } catch (err) {
    console.log("catch err", err?.message);
    return res.status(500).json({
      success: false,
      message: "An internal server error, please try again later",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found." });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await generateToken(
      user._id ?? user.id,
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      ...baseCookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...baseCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (err) {
    console.log("catch err", err?.message);
    return res.status(500).json({
      success: false,
      message: "An internal server error, please try again later",
    });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are rrequired" });
  }

  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully.",
      user,
    });
  } catch (err) {
    console.log("catch err", err?.message);
    return res.status(500).json({
      success: false,
      message: "An internal server error, please try again later",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res
        .status(400)
        .json({ success: false, message: "Users not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Users Data Fetched", users });
  } catch (err) {
    console.log("catch err", err?.message);
    return res.status(500).json({
      success: false,
      message: "An internal server error, please try again later",
    });
  }
};

export const updateUserById = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phoneNumber, age, address } = req.body;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are rrequired" });
  }
  try {
    const editableProfile = {};
    if (firstName !== null) editableProfile.firstName = firstName;
    if (lastName !== null) editableProfile.lastName = lastName;
    if (phoneNumber !== null) editableProfile.phoneNumber = phoneNumber;
    if (age !== null) editableProfile.age = age;
    if (address !== null) editableProfile.address = address;

    const updatedUserProfile = await User.findByIdAndUpdate(
      id,
      editableProfile,
      {
        $set: editableProfile,
      },
      { new: true, runValidator: true },
    );

    if (!updatedUserProfile) {
      return res.status(400).json({
        success: false,
        message: "User profile not updated successfully",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully.",
      updatedUserProfile,
    });
  } catch (err) {
    console.log("catch err", err?.message);
    return res.status(500).json({
      success: false,
      message: "An internal server error, please try again later",
    });
  }
};

export const deleteUserById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "User profile deleted successfully." });
  } catch (err) {
    console.log("catch err", err?.message);
    return res.status(500).json({
      success: false,
      message: "An internal server error, please try again later",
    });
  }
};

export const refreshRoute = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "No Refresh Token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.USER_REFRESH_TOKEN);

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid Refresh Token" });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("accessToken", newAccessToken, {
      ...baseCookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...baseCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "new access token and refresh token generated respectively",
    });
  } catch (err) {
    console.log("catch err", err?.message);
    return res.status(500).json({
      success: false,
      message: "An internal server error, please try again later",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    } else if (refreshToken) {
      const user = await User.findOne({ refreshToken });

      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    const cookieOptions = {
      ...baseCookieOptions,
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.log("catch err", err?.message);
    return res.status(500).json({
      success: false,
      message: "An internal server error, please try again later",
    });
  }
};
