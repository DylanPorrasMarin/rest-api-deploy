const express = require('express')
// Recuperar las movies en formato JSON
const movies = require('./movies.json')

const app = express()

const cors = require('cors')

app.disable('x-powered-by')

app.use(express.json())

// Definir dominios pra usar apis
// Definir los origenes para consumir las apis
// metodos normales: GET/HEAD/POST
// metodos complejos: PUT/PATCH/DELETE
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:3500'

    ]
    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  }
}))

const crypto = require('node:crypto') // biblioteca para crear id unicos

const { validateMovie, validatePartialMovie } = require('./schemas/movies')

// La rest api son arquitectua de softwares para crear apis fue creada en los aios 2000 por roy,  promete la sostenibilidad y escabilidad en el tiempo

// Todos los recursos que sean MOVIES se identifican con /movies
app.get('/movies', (req, res) => {
  const { genre } = req.query // recuperar los parametros en el query en este caso el genero

  // filtrar la busqueda por genero correctamente
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase())
    )
    res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => { // path-to-regexp el :id es un segmento dinamico donde recibira el id propuesto para buscar la movie deseada
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id) // Encontrar el objeto movie en el arreglo de json que se recibe en la request
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Movie not found' })
})

// POSTS

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body) // Se valida las entradas mandando al body llamar el schema de movie

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const newMovie = {
    id: crypto.randomUUID(), // Crear un id inico universal para la movie
    ...result.data // En result tiene todos lo datos ya validados por el schema del movei por lo que se puede usar el ...result.data que agrega las propiedadades al nuevo objeto de newMovie
  }
  // Esto no seria rest porque estamos guardando el esatado de la aplicacion en memoria
  movies.push(newMovie)
  console.log(movies)
  // status 201 indica que fue creado el recurso correctamente
  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params

  const movieIndex = movies.findIndex(m => m.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
})

// Las options es para habilitar el cors en los metodos complejos como put, delete etc
app.options('/movies/:id', (req, res) => {
  res.send(200)
})

const PORT = process.env.PORT ?? 3000 // Siempre utilizar este para asignar puertos para los dominios

app.listen(PORT, () => {
  console.log(`Server listenning on port http://localhost:${PORT}`)
})
