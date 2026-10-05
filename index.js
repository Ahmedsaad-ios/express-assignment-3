const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

app.use(express.json());

app.post("/user", (req, res) => {
  fs.readFile("users.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({
        error: "Error reading users.json",
      });
    }
    const users = JSON.parse(data);
    const emailExists = users.find((user) => user.email === req.body.email);
    if (emailExists) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const newId = users.length > 0 ? Math.max(...users.map((user) => user.id)) + 1 : 1;
    const newUser = {
      id: newId,
      name: req.body.name,
      age: req.body.age,
      email: req.body.email,
    };
    users.push(newUser);
    fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({
          error: "Error writing to users.json",
        });
      }
      res.status(201).json({
        message: "User added successfully",
        user: newUser,
      });
    });
  });
});

app.patch("/user/:id", (req, res) => {
  const userId = Number(req.params.id);
  fs.readFile("users.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({
        message: "Error reading users file",
      });
    }
    const users = JSON.parse(data);
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return res.status(404).json({
        error: "User not found",
      });
    }
    if (req.body.name !== undefined) {
      users[userIndex].name = req.body.name;
    }
    if (req.body.age !== undefined) {
      users[userIndex].age = req.body.age;
    }
    if (req.body.email !== undefined) {
      const emailExists = users.find(
        (user) => user.email === req.body.email && user.id !== userId,
      );
      if (emailExists) {
        return res.status(400).json({
          error: "Email already exists",
        });
      }

      users[userIndex].email = req.body.email;
    }

    fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({
          error: "Error updating user",
        });
      }
      res.status(200).json({
        message: "User updated successfully",
        user: users[userIndex],
      });
    });
  });
});

app.delete("/user/:id", (req, res) => {
    const userId = Number(req.params.id || req.body.id);
    fs.readFile("users.json", "utf8", (err, data) => {
      if (err) {
        return res.status(500).json({
            message: "Error reading users file"
        });
      }

        const users = JSON.parse(data);
        const userIndex = users.findIndex(
            user => user.id === userId
        );
        if (userIndex === -1) {
            return res.status(404).json({
                message: "User ID not found"
            });
        }
        users.splice(userIndex, 1);
        fs.writeFile(
            "users.json",
            JSON.stringify(users, null, 2),
            (err) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error deleting user"
                    });
                }
                res.status(200).json({
                    message: "User deleted successfully"
                });
            }
        );
    });
});

app.get("/user/getByName", (req, res) => {
  const userName = req.query.name;
  fs.readFile("users.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({
        message: "Error reading users file"
      });
    }
    const users = JSON.parse(data);
    const user = users.find(
        user => user.name === userName
    );

    if (!user) {
      return res.status(404).json({
        message: "User name not found"
      });
    }
    res.status(200).json({
      user: user
    });
  });
});

app.get("/user/filter", (req, res) => {

  const minAge = Number(req.query.minAge);

  fs.readFile("users.json", "utf8", (err, data) => {

    if (err) {
      return res.status(500).json({
        message: "Error reading users file"
      });
    }

    const users = JSON.parse(data);

    const filteredUsers = users.filter(
      user => user.age >= minAge
    );
    res.status(200).json({
      message: `Users filtered by age >= ${minAge}`,
      users: filteredUsers
    });
  });
});

app.get("/user", (req, res) => {

  fs.readFile("users.json", "utf8", (err, data) => {

    if (err) {
      return res.status(500).json({
        message: "Error reading users file"
      });
    }

    const users = JSON.parse(data);
    res.status(200).json({
      message: "All users retrieved successfully",
      users: users
    });
  });
});

app.get("/user/:id", (req, res) => {
    const userId = Number(req.params.id);
    fs.readFile("users.json", "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({
                message: "Error reading users file"
            });
        }
        const users = JSON.parse(data);
        const user = users.find(
            user => user.id === userId
        );
        if (!user) {
            return res.status(404).json({
                message: "User ID not found"
            });
        }
        res.status(200).json({
            user: user
        });
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
