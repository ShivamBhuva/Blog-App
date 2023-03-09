const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.name, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send("success");
  } catch (error) {
    console.log(error);
    res.status(404).send("User logged out");
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(404).send("logout all not working");
  }
});
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// router.get("/users/:id", (req, res) => {
//   const _id = req.params.id;
//   User.findById(_id)
//     .then((user) => {
//       if (!user) {
//         res.status(404).send(user);
//       }

//       res.send(user);
//     })
//     .catch((error) => res.status(500).send(error));
// });

router.patch("/users/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const updates = Object.keys(req.body);

    updates.forEach((ele) => {
      user[ele] = req.body[ele];
    });

    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id);

    // res.send(user);

    await req.user.remove();
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error("Please upload jpg/jpeg/png file"));
    }

    cb(undefined, true);
  },
});

router.post(
  "/users/me/avtar",
  auth,
  upload.single("avtar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avtar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send(error.message);
  }
);

router.delete("/users/me/avtar", auth, async (req, res) => {
  req.user.avtar = undefined;
  await req.user.save();
  res.send();
});

router.get("/users/:id/avtar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avtar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avtar);
  } catch (error) {
    res.status(404).send("User or Profile Picture not found");
  }
});
module.exports = router;
