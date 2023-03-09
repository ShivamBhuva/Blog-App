const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const jwt = require("jsonwebtoken");
const Task = require("../src/models/task");

const uid = new mongoose.Types.ObjectId();
const initialUser = {
  _id: uid,
  name: "Jester",
  email: "jeast@gmail.com",
  password: "12345678",
  tokens: [
    {
      token: jwt.sign({ _id: uid }, process.env.JWT_SECRET),
    },
  ],
};
beforeEach(async () => {
  await User.deleteMany();
  await new User(initialUser).save();
});

test("Signup a new user", async () => {
  await request(app)
    .post("/users")
    .send({
      name: "Testes",
      email: "din@gmail.com",
      password: "Mypass1234",
    })
    .expect(200);
});

test("Login check correct values", async () => {
  const userL = await request(app).post("/users/login").send({
    name: initialUser.email,
    password: initialUser.password,
  });
  const user = await User.findById(uid);
  // console.log(user);
  // console.log("----------------------------------------");
  // console.log(userL.body);
  expect(userL.body.token).toBe(user.tokens[1].token);
});

test("Login check false values", async () => {
  await request(app)
    .post("/users/login")
    .send({
      name: initialUser.email,
      password: "123",
    })
    .expect(400);
});

test("Read user correct values", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${initialUser.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Read user false values", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Delete user false values", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer key`)
    .send()
    .expect(401);
});

test("Delete user correct values", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${initialUser.tokens[0].token}`)
    .send()
    .expect(200);
});

test("File upload checking avtar", async () => {
  await request(app)
    .post("/users/me/avtar")
    .set("Authorization", `Bearer ${initialUser.tokens[0].token}`)
    .attach("avtar", "tests/fixtures/profile.jpg")
    .expect(200);
});

// test("File uploaded or not", async () => {
//   const user = await User.findById(uid);
//   console.log(user);
//   expect(user.avtar).toEqual(expect.any(Buffer));
// });
