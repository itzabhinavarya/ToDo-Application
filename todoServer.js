const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();

const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

// 1.GET /todos - Retrieve all todo items

app.get("/todos", (req, res) => {
  fs.readFile("todos.json", "utf8", (err, data) => {
    if (err) res.status(404).send("No Record Available...");
    res.status(200).json(JSON.parse(data));
  });
});

// 2.GET /todos/:id - Retrieve a specific todo item by ID

app.get("/todos/:id", (req, res) => {
  var todoID = parseInt(req.params.id);
  fs.readFile("todos.json", "utf8", (err, data) => {
    if (err) throw err;
    const todos = JSON.parse(data);
    var fileData = todos.find((x) => x.id == todoID);
    if (fileData) {
      res.status(200).json(fileData);
    } else {
      res.status(404).send("Record Not Found!");
    }
  });
});

// 3. POST /todos - Create a new todo item

app.post("/todos", (req, res) => {
  fs.readFile("todos.json", "utf8", (err, data) => {
    const todos = JSON.parse(data);
    var lastObj = todos[todos.length - 1];
    const newTodo = {
      id: lastObj.id + 1,
      title: req.body.title,
      completed: req.body.completed,
      description: req.body.description,
    };
    if (err) throw err;

    todos.push(newTodo);
    fs.writeFile("todos.json", JSON.stringify(todos), (err) => {
      if (err) throw err;
      res.status(201).json(todos);
    });
  });
});

// 4. PUT /todos/:id - Update an existing todo item by ID

app.put("/todos/:id", (req, res) => {
  fs.readFile("todos.json", "utf8", (err, data) => {
    const todos = JSON.parse(data);
    const todoIndex = todos.findIndex((data) => data.id == req.params.id);
    if (todoIndex !== -1) {
      const updatedTodo = {
        id: req.params.id,
        title: req.body.title,
        completed: req.body.completed,
        description: req.body.description,
      };
      todos[todoIndex] = updatedTodo;
      fs.writeFile("todos.json", JSON.stringify(todos), (err) => {
        if (err) throw err;
        res.status(200).json(updatedTodo);
      });
    } else {
      res.status(404).send("Record not found...");
    }
  });
});

// 5. DELETE /todos/:id - Delete a todo item by ID

app.delete("/todos/:id", (req, res) => {
  var id = req.params.id;
  fs.readFile("todos.json", "utf8", (err, data) => {
    const todos = JSON.parse(data);
    var index = todos.findIndex((x) => x.id == id);
    if (index !== -1) {
      todos.splice(index, 1);
      fs.writeFile("todos.json", JSON.stringify(todos), (err) => {
        res.status(200).json(todos);
      });
    } else {
      res.status(404).send("Record Not Found");
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// app.use((req, res, next) => {
//   res.status(404).send();
// });

app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}`);
});

module.exports = app;
