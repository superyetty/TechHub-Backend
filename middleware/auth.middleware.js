import jwt from "jsonwebtoken";
import User from "../models/user/user.model.js";

const protect = async (req, res, next) => {
  //get token from cookie
  const accessToken = req.cookies?.accessToken;
  console.log("accessToken:", accessToken);

  //if no token, reject i.e unathenticated
  if (!accessToken) {
    return res
      .status(401)
      .json({ success: false, message: "User Not Authorized!" });
  }

  try {
    //verify the token, if not expired.
    const decoded = jwt.verify(accessToken, process.env.USER_SECRET_TOKEN);
    console.log("decoded:", decoded);

    //find user in database
    const user = await User.findById(decoded.userId).select("-password");
    console.log("authorized user:", user);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    //attach verified user to the request excluding the password
    req.user = user;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }
};

export default protect;
