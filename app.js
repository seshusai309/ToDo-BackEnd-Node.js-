const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null
const initializeDbAndServer = async () => {
  try {
    9
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running on http://localhost:3000/')
    })
  } catch (e) {
    console.log(`error in DB : ${e.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

//API 1
app.get('/todos/', async (request, response) => {
  const {search_q = '', todo, priority, status} = request.query
  let sqlQuery = 'SELECT * FROM todo;'
  const hasPriorityAndStatusProperties = () => {
    return priority !== undefined && status !== undefined
  }

  const haspriorityProperties = () => {
    return priority !== undefined
  }

  const hasStatusProperties = () => {
    return status !== undefined
  }

  switch (true) {
    case hasPriorityAndStatusProperties():
      sqlQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status='${status}' AND priority='${priority}'; `
      break

    case hasStatusProperties():
      sqlQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND  status='${status}'; `
      break
    case haspriorityProperties():
      sqlQuery =
        sqlQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND  priority='${priority}'; `
      break
    default:
      sqlQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'; `
  }
  const dbresponse = await db.all(sqlQuery)
  response.send(dbresponse)
})

//API2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const sqlquery = `SELECT * FROM todo WHERE id = ${todoId};`
  const dbresponse = await db.get(sqlquery)
  response.send(dbresponse)
})

//API 3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const sqlQuery = `INSERT INTO todo (id, todo, priority, status) VALUES (${id}, '${todo}', '${priority}', '${status}');`
  const dbresponse = await db.run(sqlQuery)
  response.send('Todo Successfully Added')
})

//API4
app.put('/todos/:todoId/', async (request, response) => {
  const {status, priority, todo} = request.body
  const {todoId} = request.params
  let sqlquery = ''
  let success = ''
  switch (true) {
    case status !== undefined:
      sqlquery = `UPDATE todo SET status = '${status}' WHERE id = ${todoId}`
      success = 'Status Updated'
      break
    case priority !== undefined:
      sqlquery = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId}`
      success = 'Priority Updated'
      break
    case todo !== undefined:
      sqlquery = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId}`
      success = 'Todo Updated'
      break
  }

  const dbresponse = await db.run(sqlquery)
  response.send(success)
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const sqlquery = `DELETE FROM todo WHERE id = ${todoId}`
  await db.run(sqlquery)
  response.send('Todo Deleted')
})

module.exports = app
