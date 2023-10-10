const eroor = require("../middlewares/eroor");
const User = require("../models/userModel");
const sendToken = require("../utils/sendToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//REGISTER A USER

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "publicid",
        url: "url1",
      },
    });

    if (!name || !email || !password) {
      return res.status(404).json({
        message: "Please provide the required information",
      });
    }
    return sendToken(user, 201, res);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({
        message: `Duplicate ${Object.keys(e.keyValue)} Entered`,
      });
    }
    console.log(e);
    return res.status(400).send(e);
  }
};

//LOGIN USER

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //checking if user has given passwor and email
    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email & password",
      });
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email and password",
      });
    }

    const isPasswordMatched = await user.comparePassword(password);
    return sendToken(user, 200, res);
  } catch (e) {
    if (e.name === "jsonwebtokenerror") {
      return res.status(400).json({
        message: "Json web token in invalid, try again",
      });
    }

    console.log(e);
    return res.status(500).send(e);
  }
};

//LOGOUT USER

exports.logOut = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

//forget //reset password

exports.forgetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // console.log("user", user);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    //get resetpassword token
    const resetToken = await user.getResetPasswordToken();

    // console.log(resetToken)
    await user.save({ validateBeforeSave: false });

    const resetPasswordLink = `${req.protocol}:/${req.get(
      "host"
    )}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n ${resetPasswordLink} \nIf you have not requested this email then please ignore it  `;

    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce Password Recovery`,
        message,
      });

      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email} successfully.`,
      });
    } catch (e) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      console.log(e);
      return res.status(500).send(e);
    }

    // await user.save();
    console.log("controllerFrom", user.resetPasswordToken);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};


//CHANGING PASSWORD USING TOKEN
exports.resetPassword = async (req, res, next) => {
  try {
    console.log('fldsjafjalsj')
    //creating hashed token
    const resetPasswordTokenByUser = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // console.log(resetPasswordTokenByUser)
    const user = await User.findOne({
      resetPasswordToken: resetPasswordTokenByUser,
      // resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(404).json({
        message: "Token is expired",
      });
    }
    //if password and repeat password not matched
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(404).json({
        message: "Password does not matched",
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    //when everything goes right, user log in
    await user.save();
    sendToken(user, 200, res);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

//GET USER DETAILS

exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return;
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

//CHANGE PASSWORD - logged in

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "Old password is incorrect",
      });
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
      return res.status(400).json({
        message: "Password does not matched",
      });
    }

    user.password = req.body.newPassword;

    await user.save();
    sendToken(user, 200, res);
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

//UPDATE USER PROFILE

exports.updateProfile = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

//GET ALL USERS --ADMIN
exports.getAllUser = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      users,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

//GET USER DETAILS -- ADMIN

exports.getSingleUserDetail = async (req, res, next) => {
  try {
    const user = await user.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User does not exist",
      });
    }

    res.status.json({
      success: true,
      user,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

//UPDATE ROLE -- ADMIN
exports.updateUserRole = async (req, res, next) => {
  try {
    const newUserData = {
      role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

//DELETE ROLE -- ADMIN
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User does not exist",
      });
    }

    await user.remove();
    res.status(200).json({
      success: true,
      message: 'User successfully deleted'
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send(e);
  }
};

