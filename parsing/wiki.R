library(XML)
library(rjson)
library(RJSONIO)
library(RCurl)
library(stringi)

#winner and nominates least
#this URL was accessed on April 13, 2015
url <- "http://en.wikipedia.org/wiki/Academy_Award_for_Best_Directing"
html <- htmlTreeParse(url, useInternalNodes=T, encoding="UTF-8")

#from 1940s to 2010s
byDecades <- xpathSApply(html, "//table", xmlValue)[5:12]

#ceremoney dates
#this URL was accessed on April 13, 2015
urlCeremony <- "http://en.wikipedia.org/wiki/List_of_Academy_Awards_ceremonies"
htmlCeremony <- htmlTreeParse(urlCeremony, useInternalNodes=T)
ceremonyList <- xpathSApply(htmlCeremony, "//table", xmlValue)[2]
splited <- unlist(strsplit(ceremonyList, "\n"))
datesText <- splited[grep("Academy Awards$", splited) + 1]

#make a data frame
winnerDf <- data.frame(year = numeric(0), name = character(0), title = character(0), date = character(0), stringsAsFactors = FALSE)
nominatesDf <- data.frame(year = numeric(0), name = character(0), title = character(0), stringsAsFactors = FALSE)
for (i in 1:length(byDecades)) {
  splited <- unlist(strsplit(byDecades[i], "\n"))
  items <- splited[5:length(splited)]
  
  #every year
  for (j in seq(1, length(items), 4)) {
    
    #Oscars are held in the next year
    year <- as.numeric(items[j]) + 1
    ceremonyDate <- datesText[grep(year, datesText)]
    
    multipleNames <- list()
    if (grepl("and", items[j+1])) {
      multipleNames <- unlist(strsplit(items[j+1], " and "))
    } else if (grepl("&", items[j+1])) {
      multipleNames <- unlist(strsplit(items[j+1], " & "))
    }
    if (length(multipleNames) > 1) {
      for (k in 1:length(multipleNames)) {
        name <- multipleNames[k]
        winnerDf <- rbind(winnerDf,
                          data.frame(year = as.numeric(items[j]),
                                     name = name,
                                     title = stri_sub(items[j+2], 4, -1),
                                     date = ceremonyDate))        
      }
    } else {
      winnerDf <- rbind(winnerDf,
                        data.frame(year = as.numeric(items[j]),
                                   name = items[j+1],
                                   title = stri_sub(items[j+2], 4, -1),
                                   date = ceremonyDate))      
    }
    
    #split nominates
    nominates <- unlist(strsplit(gsub("([a-z])([A-Z])","\\1§\\2", items[j+3]), "§"))
    for (k in 1:length(nominates)) {
      nameTitle <- unlist(strsplit(nominates[k], " – "))
      name <- nameTitle[1]
      title <- nameTitle[2]      
      
      #case of e.g., "McQueen"
      if (k > 1) {
        prevNameTitle <- unlist(strsplit(nominates[k-1], " – "))
        if (is.na(prevNameTitle[2])) {
          name <- paste(prevNameTitle[1], name, sep="")
        }
      }
      nominatesDf <- rbind(nominatesDf, data.frame(year = as.numeric(items[j]), name = name, title = title))   
    }
  }
}

nominatesDf <- na.omit(nominatesDf)

#export to CSV
write.csv(winnerDf, "winners.csv", row.names=FALSE)
write.csv(nominatesDf, "nominates.csv", row.names=FALSE)