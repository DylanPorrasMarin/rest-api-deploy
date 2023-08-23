// validar tipos de entradas en el body
const z = require('zod') // libreria para validar tipos de varibales string, number, date etc

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be string',
    required_error: 'Movie title is required.'
  }),
  year: z.number().int().positive().min(1900).max(2024), // validar el anio que sea nuemro tipo int positivo y un nuemro de rangos disponibles
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(0),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  // validar un array enum
  genre: z.array(
    z.enum(['Action', 'Adventure', 'Crime', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']),
    {
      required_error: 'Movie genre is required',
      invalid_type_error: 'Movie genre must be an array of enum Genre'
    }
  )
})

function validateMovie (object) {
  return movieSchema.safeParse(object) // safeParse devuevle un object result si hay un error o si hay datos
}

function validatePartialMovie (input) {
  return movieSchema.partial().safeParse(input) // Partial hace las entradas opcionales ya sea el title, fecha etc
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
