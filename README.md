# Road to Masterpiece

"Road to Masterpiece" is a visualization project that shows the sixty-one directors who one Academy Awards for Best Directing since 1941.

Each director's works are presented throughout a timeline. Those movies that won or nominated are highlighted.

The list of directors can be sorted in various ways - by the year when the director won for the first time, by the age of the first award, and by the spanned time from the debut as a director to the first award. According to the sorting options, related information is displayed over the timeline. In addition, sorting by name, and the total number of directed movies are available.

## Client-side Set-up

Process a Less file to generate a style file.

```
$ cd html/less
$ lessc style.less ../public/style/style.css
```
Install necessary Javascript libraries

```
$ cd ../public
bower install jquery underscore moment d3
````

You can see the visualization by opening the index.html file with the major browsers except Chrome. If you're using Chrome, start a simple web server.

```
$ python -m SimpleHTTPServer
```
Test on your browser.

> http://localhost:8000

## Data Retrieval (Optional)

#### 1. wiki.R

The list of Oscars winners are retrieved from this Wikipedia page:

> http://en.wikipedia.org/wiki/Academy_Award_for_Best_Directing

Ceremony dates are retrieved from here:
> http://en.wikipedia.org/wiki/List_of_Academy_Awards_ceremonies

You will get two files at the end: winners.csv and nominates.csv

#### 2. movies.R

Data of the directors' work and basic biography are accessible via The Movie Database API.

> http://docs.themoviedb.apiary.io/

To access the API, you need to get a key here. Find an instruction here:

> https://www.themoviedb.org/faq/api

Open API_KEY.local and enter the API key you required. Then save it as a text file.

```
$ cp API_KEY.local API_KEY.txt
```
You will get dataset.json in ../html/public folder at the end.