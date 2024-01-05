function showAllTodo() {
  $(document).ready(function () {
    var outputContainer = document.querySelector(".outputData");

    function parsedData(data) {
      var todoData = data;

      outputContainer.innerHTML = "";

      todoData.forEach((element) => {
        // Create a new output element for each object
        var newOutput = document.createElement("div");
        newOutput.className = "output";

        // Create paragraphs for title and description
        var titleParagraph = document.createElement("p");
        titleParagraph.id = "title";
        titleParagraph.innerHTML = element.title;

        var descParagraph = document.createElement("p");
        descParagraph.id = "desc";
        descParagraph.innerHTML = element.description;

        var actionBtn = document.createElement("button");
        actionBtn.id = "deleteBtn";
        actionBtn.innerHTML = "Delete";

        actionBtn.setAttribute("onclick", `deleteTodo(${element.id})`);

        newOutput.appendChild(titleParagraph);
        newOutput.appendChild(descParagraph);
        newOutput.appendChild(actionBtn);

        outputContainer.appendChild(newOutput);
      });
    }

    function callback(resp) {
      resp.json().then(parsedData);
    }

    fetch("http://localhost:3000/todos", {
      method: "GET",
    }).then(callback);
  });
}

// // --------------------------------------------------------------------------

// fetch("http://localhost:3000/todos/id",{
//   method:"DELETE"
// })

function deleteDoneCallback() {
  window.alert("Record Deleted Successfully....");
  location.reload(true);
}

function deleteTodo(id) {
  console.log(id);
  fetch(`http://localhost:3000/todos/${id}`, {
    method: "DELETE",
  }).then(deleteDoneCallback);
}

// // --------------------------------------------------------------------------

function addToDo() {
  $(document).ready(function () {
    var title = document.getElementById("title-field").value;
    var desc = document.getElementById("desc-field").value;
    var titleInput = document.getElementById("title-field");
    var descInput = document.getElementById("desc-field");

    if (title === "" || desc === "") {
      window.alert("Record can't be empty");
    } else {
      function parsedData(data) {
        window.alert("Record Inserted Successfully....");
        titleInput.value = "";
        descInput.value = "";
        location.reload(true);
      }

      function callback(resp) {
        resp.json().then(parsedData);
      }

      fetch("http://localhost:3000/todos", {
        method: "POST",
        body: JSON.stringify({
          title: title,
          completed: false,
          description: desc,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then(callback);
    }
  });
}
