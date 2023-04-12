const express = require("express");
const app = express();
const { User } = require("./db");
const bcrypt = require("bcrypt");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res, next) => {
  try {
    res.send(
      "<h1>Welcome to Loginopolis!</h1><p>Log in via POST /login or register via POST /register</p>"
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// POST /register
// TODO - takes req.body of {username, password} and creates a new user with the hashed password
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({
      username,
      password: hashedPassword,
    });
    res.status(200).send(`successfully created user ${username}`);
  } catch (err) {
    res.status(500).send("Could not create user");
  }
});

// POST /login
// takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });

  if (!user) {
    return res.status(401).send("incorrect username or password");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (isPasswordMatch) {
    return res.status(200).send(`successfully logged in user ${username}`);
  } else {
    return res.status(401).send("incorrect username or password");
  }
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
