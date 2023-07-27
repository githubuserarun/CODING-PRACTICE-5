const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

// API 1
// get all movies details
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name
    FROM movie`;
  const moviesDetails = await db.all(getMoviesQuery);
  response.send(
    moviesDetails.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// API 2
//Create a new movie details
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const postNewMoviesQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES ('${directorId}','${movieName}','${leadActor}')`;
  const createdMoviesDetails = await db.run(postNewMoviesQuery);
  response.send("Movie Successfully Added");
});

//API 3
//Get movie details based on ID
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

//API 4
//Update the movie based on ID
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE movie
    SET 
    director_id = '${directorId}',movie_name = '${movieName}',lead_actor = '${leadActor}'
    WHERE movie_id = '${movieId}';`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5
//Delete movie based on ID
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDeleteQuery = `
    DELETE FROM movie
    WHERE movie_id = '${movieId}';`;
  await db.run(movieDeleteQuery);
  response.send("Movie Removed");
});

//API 6
//Get director details
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorDetails = await db.all(getDirectorQuery);
  response.send(
    directorDetails.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API 7
//GET all movies name based on director id
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
      WHERE director_id='${directorId}';`;
  const directorMoviesDetails = await db.all(getDirectorMoviesQuery);
  response.send(
    directorMoviesDetails.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

module.exports = app;
