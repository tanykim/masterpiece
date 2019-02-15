library(jsonlite)
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
  results_count <- personData$total_results
  if (results_count == 1) {
    personId <- results$id
  } else if (results_count > 1) {
    for (pId in 1:results_count) {
      knownFor <- results[pId, ]$known_for
      for (tId in 1:length(knownFor)) {
        titles <- knownFor[[tId]]$original_title
      }
      ##check title
      titlesFromWiki <- union(
        as.character(winners[winners$name == name, "title"]),
        as.character(nominates[nominates$name == name, "title"])
      )
      if (length(intersect(titles, titlesFromWiki)) > 0) {
        ids <- results$id
        personId <- ids[pId]
      }
    }
  }
  personId
}

#missing & wrong elements
winnerDf[winnerDf$name == "John Ford", "id"] <- 8500
winnerDf[winnerDf$name == "George Stevens", "id"] <- 18738
winnerDf[winnerDf$name == "Ron Howard", "id"] <- 6159

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
  movies <- subset(movieData$crew, job == 'Director')
  movies <- movies[c("release_date", "title")]
  movies <- movies[!is.na(movies$release_date), ]
  movies <- movies[movies$release_date != '', ]
  
  #get nominates and winner
  nominatedTitles <- getTitles(nominates, movies, name)
  wonTitles <- getTitles(winners, movies, name)
  movies$oscars <- ""
  movies[movies$title %in% nominatedTitles , "oscars"] <- "nominated"
  movies[movies$title %in% wonTitles , "oscars"] <- "won"
  
  movies$year <- lapply(movies$title, function(x) {
    if (x %in% nominatedTitles) {
      unique(nominates[nominates$title == x, 'year'])
    } else if (x %in% wonTitles) {
      unique(winners[winners$title == x, 'year'])
    } else {
       ""
    }
  })
  
  #get age
  if (!is.null(birthday)) {
    movies$age <- lapply(movies$release_date, function(x) as.numeric(as.Date(x, "%Y-%m-%d") - as.Date(birthday, "%Y-%m-%d"))/365.25)    
  }
  
  #order by release date
  movies <- movies[order(unlist(movies$release_date)), ]
  movies <- movies[!is.null(movies$release_date), ]
  movies
}

#get bio
getBio <- function (id) {
  bioURL <- paste("https://api.themoviedb.org/3/person/", id , 
                  "?api_key=", API_KEY, sep ="")
  bioData <- fromJSON(getURL(bioURL))
  deathday <- ""
  birthPlace <- ""
  if (!is.null(bioData$deathday)) {
    deathday <- bioData$deathday
  }
  if (!is.null(bioData$place_of_birth)) {
    birthPlace <- bioData$place_of_birth
  }
  bio <- list (birthday = bioData$birthday,
               deathday = deathday,
               imdb_id = bioData$imdb_id,
               place_of_birth = birthPlace,
               name=bioData$name
              )
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
  
  birthday <- bio$birthday
  awards_dates <- as.character(winners[winners$name == name, "date"])
  years <- as.numeric(substrRight(awards_dates, 4))
  awards_age <- NULL
  if (!is.null(birthday)) {
    awards_age <- as.numeric(lapply(awards_dates, function (x) as.numeric(as.Date(x, "%B %d, %Y") - as.Date(birthday)) / 365.25 ))
  }
  movies <- getMovies(id, name, birthday)
  moviesList <- unname(as.list(as.data.frame(t(movies))))
  
  director <- list(name = bio$name,
                   id = id,
                   bio = bio,
                   years = as.list(years),
                   awards = lapply(1:length(years), function (x) 
                        list(date = awards_dates[x], age = awards_age[x])),
                   age = awards_age[1],
                   movies = moviesList)
  directors[i] <- list(director)
}

#create JSON
dataset <- minify(toJSON(directors, auto_unbox = TRUE))
write(dataset, "../html/public/dataset.json")