const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
// GET API1 Returns a list of all the players in the player table
/*app.get("/todos/", async (request, response) => {
  const getAllPlayersList = `SELECT * FROM todo;`;
  const playersArray = await db.all(getAllPlayersList);
  response.send(playersArray);
});*/

/*
app.get("/todos/", async (request, response) => {
  //const { status } = request.query;
  //console.log(status);
  //const getQuery = `SELECT * FROM todo WHERE todo.status LIKE "%${status}%";`;
  //const { priority } = request.query;
  const { priority, status } = request.query;
  const getQuery = `SELECT * FROM todo WHERE todo.priority LIKE "%${priority}%" and todo.status LIKE "%${status}%";`;
  const queryResponse = await db.all(getQuery);
  response.send(queryResponse);
});
*/
/*const ans = (playersArray) => { 
        return { 
            playerId: playersArray.player_id, 
            playerName: playersArray.player_name, 
        }; 
    }; 
    response.send(playersArray.map((eachPlayer) => ans(eachPlayer))); });*/

// GET API 1 Returns a list of all todos

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  const hasPriorityAndStatusProperties = (requestQuery) => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    );
  };
  const hasPriorityProperty = (requestQuery) => {
    return requestQuery.priority !== undefined;
  };
  const hasStatusProperty = (requestQuery) => {
    return requestQuery.status !== undefined;
  };
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      //if this is true then below query is taken in the code
      getTodosQuery = ` SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}' AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = ` SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = ` SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}';`;
      break;
    default:
      getTodosQuery = ` SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getTodosQuery);
  response.send(data);
});

// GET API 2 Returns a specific todo based on the todo ID

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoIdQuery = `SELECT * FROM todo WHERE todo.id = ${todoId};`;
  const queryResponse = await db.get(todoIdQuery);
  response.send(queryResponse);
});

// POST API 3 Create a todo in the todo table

app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addtodoQuery = `INSERT INTO todo (id, todo, priority, status) VALUES (${id}, '${todo}', '${priority}', '${status}');`;
  const dbResponse = await db.run(addtodoQuery);
  response.send("Todo Successfully Added");
});

// PUT API 4 Updates the details of a specific todo based on the todo ID

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updateColumn = "";
  const { todo = "", priority = "", status = "" } = request.body;
  //console.log(status);
  if ((todo === "") & (priority === "") & (status !== "")) {
    const updateDetailsQuery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId}`;
    await db.run(updateDetailsQuery);
    response.send("Status Updated");
  } else if ((todo === "") & (priority !== "") & (status === "")) {
    const updateDetailsQuery = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId}`;
    await db.run(updateDetailsQuery);
    response.send("Priority Updated");
  } else if ((todo !== "") & (priority === "") & (status === "")) {
    const updateDetailsQuery = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId}`;
    await db.run(updateDetailsQuery);
    response.send("Todo Updated");
  }
});

// DELETE API 5 Deletes a todo from the todo table based on the todo ID

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  // console.log(todoId);
  const deleteTodoQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
