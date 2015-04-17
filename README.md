# Road to Master Piece

"Road to Master Piece" is a visualization project that shows the fourty-one diretors who one Academy Awards for Best Directing since 1940. 

Each director's works are presented throughout time from their birth to the current date. The years when the director was nominated or won for the Oscars are highlighted, indicating the years took from his or her debut to the awarded master piece.

## Data Retrieval

#### 1. Run wiki.R

The list of Oscars winners are retreived from this Wikipedia page:

> http://en.wikipedia.org/wiki/Academy_Award_for_Best_Directing

Ceremony dates are retreived from here:
> http://en.wikipedia.org/wiki/List_of_Academy_Awards_ceremonies

You will get two files at the end: winners.csv and nominates.csv

####2. Run "movies.R"


Data of the directors' work and basic biography are accessible via The Movie Database API.

> http://docs.themoviedb.apiary.io/

To access the API, you need to get a key here. Find an instruction here:

> https://www.themoviedb.org/faq/api

Open API_KEY.local and enter the API key you required. Then save it as a text file.

```
$ cp API_KEY.local API_KEY.txt
```
You will get dataset.json at the end.

#### 3. Enjoy the visualization

First process a Less file to generate a style file.

```
$ cd ../public/
$ lessc style.less style.css
```

You can see the visualiatoin by opening the index.html file with the major browsers except Chrome. If you're using a chrome, start a simple web server.

```
$ python -m SimpleHTTPServer
```
Test on your browser.
> http://localhost:8000
