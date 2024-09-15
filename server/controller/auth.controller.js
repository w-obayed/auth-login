import { createOTP } from "../helper/helper.js";
import { User } from "../model/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenSetCookie } from "../utils/generateTokenSetCookie.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendWelcomeEmail,
  verificationEmail,
} from "../mailtrap/email.js";
import crypto from "crypto";

/**
 * @description user signup
 * @method post
 * @route /api/v1/auth/signup
 * @access public
 */
export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    if (!email || !password || !name) {
      throw new Error("All fields are required!");
    }

    const userAlreadyExist = await User.findOne({ email });

    if (userAlreadyExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists!" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const verificationToken = createOTP();

    const user = new User({
      email,
      password: hashPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();

    // jwt
    generateTokenSetCookie(res, user._id);

    await verificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      user: {
        ...user._doc,
        password: null,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @description verify user emial
 * @method post
 * @route /api/v1/auth/verify-email
 * @access public
 */
export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code!",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: "User verify successfully!",
      user: {
        ...user._doc,
        password: null,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @description user login
 * @method post
 * @route /api/v1/auth/login
 * @access public
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    generateTokenSetCookie(res, user._id);

    user.lastLogin = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "User login successfully!",
      user: {
        ...user._doc,
        password: null,
      },
    });
  } catch (error) {
    console.log("error in login: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @description user logout
 * @method post
 * @route /api/v1/auth/logout
 * @access public
 */
export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully!" });
};

/**
 * @description password forgot
 * @method post
 * @route /api/v1/auth/forgot-password
 * @access public
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "user Invalid!" });
    }

    // generate reset token
    const resetToken = await crypto.randomBytes(20).toString("hex");
    const resetTokenExpireAt = Date.now() + 1 * 60 * 60 * 1000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpireAt;

    await user.save();

    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );
    res
      .status(200)
      .json({ success: true, message: "Reset url send successfull!" });
  } catch (error) {
    console.log("error in password reset: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @description reset password
 * @method post
 * @route /api/v1/auth/reset-password/:token
 * @access public
 */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset code!" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    await sendResetSuccessEmail(user.email);
    res
      .status(200)
      .json({ success: true, message: "Password reset successfull!" });
  } catch (error) {
    console.log("error in password reset successfull: ", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
/**
 * @description check authentication
 * @method get
 * @route /api/v1/auth/check-auth
 * @access public
 */
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
