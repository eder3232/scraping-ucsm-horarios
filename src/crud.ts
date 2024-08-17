const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// const dbPath = path.join(__dirname, 'src', 'mock.db')
const dbPath = './mock.db'

console.log(dbPath)

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message)
  }
  console.log('Connected to the mock database.')
})

// db.run(
//   `CREATE TABLE horarios(
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     escuelaProfesional TEXT NOT NULL,
//     semestre TEXT NOT NULL,
//     curso TEXT NOT NULL,
//     seccion TEXT NOT NULL,
//     docente TEXT NOT NULL,
//     diaHora TEXT NOT NULL,
//     numeroMatriculados TEXT NOT NULL
//   )`,
//   (err) => {
//     if (err) {
//       console.error(err.message)
//     } else {
//       console.log('Table horarios created.')
//     }
//   }
// )

db.close((err) => {
  if (err) {
    console.error(err.message)
  }
  console.log('Close the database connection.')
})
