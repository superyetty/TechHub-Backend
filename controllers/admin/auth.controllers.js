import Admin from "../../models/admin/auth.model.js";
import bcrypt from "bcrypt";

export const create = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, address, password } =
    req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phoneNumber ||
    !address ||
    !password
  ) {
    console.log("error here");
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  if (password.length < 8) {
    console.log("password.length");
    return res.status(400).json({
      success: false,
      message: "Password must be atleast 8 charaters",
    });
  }
  try {
    const exisitingAdmin = await Admin.findOne({ email });

    if (exisitingAdmin) {
      console.log("existing error");
      return res
        .status(400)
        .json({ success: false, message: "Email already exist, try login" });
    }

    const newUser = {
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      password,
    };

    const admin = await Admin.create(newUser);

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "An unexpected error occured, while creating profile",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin User profile created successfully.",
      admin,
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
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Admin profile not found" });
    }

    const ispasswordMatch = await bcrypt.compare(password, admin.password);
    if (!ispasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Password do not match, please check the password.",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "login successful.", admin });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An internal server error, please try again later",
    });
  }
};

export const updateProdileById = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phoneNumber, address } = req.body;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    let updatedProfile = {};

    if (firstName !== undefined) {
      updatedProfile.firstName = firstName;
    }
    if (lastName !== undefined) {
      updatedProfile.lastName = lastName;
    }
    if (phoneNumber !== undefined) {
      updatedProfile.phoneNumber = phoneNumber;
    }
    if (address !== undefined) {
      updatedProfile.address = address;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { $set: updatedProfile },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedAdmin) {
      return res.status(400).json({
        success: false,
        message: "error updating profile, please try again later",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Admin profile update successfully." });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An internal error has occured, please try again later",
    });
  }
};

export const getProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const adminProfile = await Admin.findById(id).select("-password");
    if (!adminProfile) {
      return res.status(400).json({
        success: false,
        message: "An error occured while fetchinf profile",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Admin profile fetched successfully.",
      adminProfile,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An internal error has occured, please try again later",
    });
  }
};

export const deleteprofileById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Admin profile deleted successfully." });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An internal error has occured, please try again later",
    });
  }
};
