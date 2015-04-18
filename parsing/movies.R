library(jsonlite)
library(rjson)
library(RCurl)

#data frame from the previous R code
winners <- read.csv("winners.csv")
nominates <- read.csv("nominates.csv")

#data frame
winnerDf <- data.frame(name = unique(read.csv("winners.csv")$name), id = 0)

#API key
API_KEY <- readLines("API_KEY.txt")

#get person id from the api
getPersonId <- function (name) {
  personURL <- paste("https://api.themoviedb.org/3/search/person?api_key=", API_KEY, 
                     "&query=",  gsub(" ", "%20", name), sep ="")
  personData <- fromJSON(getURL(personURL))
  results <- personData$results
  
  personId <- 0
  if (personData$total_results == 1) {
    personId <- unlist(lapply(results, function (x) x$id))
  } else if (personData$total_results > 1) {
    for (pId in 1:length(results)) {
      knownFor <- lapply(results[pId], function(x) x$known_for)
      titles <- list()
      for (tId in 1:length(knownFor)) {
        titles <- lapply(knownFor[[tId]], function(x) x$original_title)
      }
      
      ##check title
      titlesFromWiki <- union(
        as.character(winners[winners$name == name, "title"]),
        as.character(nominates[nominates$name == name, "title"])
      )
      if (length(intersect(titles, titlesFromWiki)) > 0) {
        ids <- unlist(lapply(results, function (x) x$id))
        personId <- ids[pId]
      }
    }
  }
  personId
}

#missing & wrong elements
winnerDf[winnerDf$name == "John Ford", "id"] <- 8500
winnerDf[winnerDf$name == "George Stevens", "id"] <- 18738

for (person in 1:nrow(winnerDf)) {
  if (winnerDf[person, "id"] == 0) {
    winnerDf[person, "id"] <- getPersonId(as.character(winnerDf[person, "name"]))
  }
}

#check if any ID is unfound -- not used anymor
#unfound <- winnerDf$name[winnerDf$id == 0]

#get titles
getTitles <- function (dataset, movies, name) {
  titles <- dataset[dataset$name == name, "title"]
  titles <- unlist(lapply(titles, as.character))
  movies[movies$title %in% titles, "title"]    
}

#get movie
getMovies <- function (id, name, birthday) {
  
  movieURL <- paste("https://api.themoviedb.org/3/person/", id , 
                    "/movie_credits?api_key=", API_KEY, sep ="")
  movieData <- fromJSON(getURL(movieURL))
  
  #get directed movies
  movies <- data.frame(t(sapply(movieData$crew,c)))
  movies <- movies[movies$job == "Director", c("release_date", "title")]
  
  #get nominates and winner
  nominatedTitles <- getTitles(nominates, movies, name)
  wonTitles <- getTitles(winners, movies, name)
  movies$oscars <- ""
  movies[movies$title %in% nominatedTitles , "oscars"] <- "nominated"
  movies[movies$title %in% wonTitles , "oscars"] <- "won"
  movies$year <- lapply(movies$title, function(x) {
    if (x %in% nominatedTitles) {
      nominates[nominates$title == x, 'year']
    } else if (x %in% wonTitles) {
      winners[winners$title == x, 'year']
    } else {
       ""
    }
  })    
  
  #Birdman
  if (name == "Alejandro González Iñárritu") {
    movies[movies$title == "Birdman", "oscars"] <- "won"
  }
  
  movies <- movies[movies$release_date != "NULL", ]
  
  #get age
  if (!is.null(birthday)) {
    movies$age <- lapply(movies$release_date, function(x) as.numeric(as.Date(x) - as.Date(birthday))/365.25)    
  }
  
  #order by release date
  movies <- movies[order(unlist(movies$release_date)), ]
  movies
}

#get bio
getBio <- function (id) {
  bioURL <- paste("https://api.themoviedb.org/3/person/", id , 
                  "?api_key=", API_KEY, sep ="")
  bioData <- fromJSON(getURL(bioURL))
  bio <- list (birthday = bioData$birthday,
               deathday = bioData$deathday,
               imdb_id = bioData$imdb_id,
               place_of_birth = bioData$bioData$place_of_birth)
}

#director list
directors <- list()

substrRight <- function(x, n){
  substr(x, nchar(x)-n+1, nchar(x))
}

for (i in 1:length(winnerDf$name)) {
  name <- as.character(winnerDf$name[i])
  
  id <- winnerDf$id[i]
  bio <- getBio(id)
  
  #missing data
  if (name == "Tom Hooper") {
    bio$birthday <- "1972-10-01"
  }
  
  awards_dates <- as.character(winners[winners$name == name, "date"])  
  years <- substrRight(awards_dates, 4)

  birthday <- bio$birthday
  age <- NULL
  if (!is.null(birthday)) {
    age <- as.numeric(as.Date(awards_dates[1], "%B %d, %Y") - as.Date(birthday)) / 365.25 
  }
  movies <- getMovies(id, name, birthday)
  moviesList <- unname(as.list(as.data.frame(t(movies))))
  
  director <- list(name = name,
                   id = id,
                   bio = bio,
                   years = as.list(years),
                   awards_dates = as.list(winners[winners$name == name, "date"]),
                   age = age,
                   movies = moviesList)
  directors[i] <- list(director)
}

#create JSON
dataset <- toJSON(directors)
write(dataset, "../public/dataset.json")