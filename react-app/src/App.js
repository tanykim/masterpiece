import React, { Component } from 'react';
import {directorsCount} from './processor';
import Main from './Main';
import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <header>
          <div className="title js-title">Road to Masterpiece</div>
          <div className="desc">
            {directorsCount}
            {` `}<span className="highlight-1">Film directors</span>
            {` `}who won <span className="highlight-2">Academy Awards</span> for
            {` `}<span className="highlight-3">Best Directing</span> Since 1941
          </div>
        </header>
        <Main />
        <footer>
          <div className="footer-wrapper">
            <div className="content">
          		<span className="source-title">DATA SOURCES</span>
          		<div className="sources">
          			List of Academy Awards Winners:
          			{` `}<a href="http://en.wikipedia.org/wiki/Academy_Award_for_Best_Directing" target="_blank" rel="noopener noreferrer">
          				http://en.wikipedia.org/wiki/Academy_Award_for_Best_Directing
          			</a><br/>
          			Ceremony Dates of Academy Awards:
          			{` `}<a href="http://en.wikipedia.org/wiki/List_of_Academy_Awards_ceremonies" target="_blank" rel="noopener noreferrer">
          				http://en.wikipedia.org/wiki/List_of_Academy_Awards_ceremonies
          			</a><br/>
          			Directors' works and basic biography:
          			{` `}The Movie Database API, <a href="http://docs.themoviedb.apiary.io" target="_blank" rel="noopener noreferrer">
          			http://docs.themoviedb.apiary.io</a>
          		</div>
          	</div>
          	<div className="copyright">
          		View on <a href="https://github.com/tanykim/road-to-masterpiece" target="_blank" className="l1" rel="noopener noreferrer">GitHub</a><br/>
          		© 2015-2019 <a href="http://tany.kim" target="_blank" className="l2" rel="noopener noreferrer">Tanyoung Kim</a>
          		{` `}<a href="http://twitter.com/tanykim" target="_blank" className="l3" rel="noopener noreferrer">@tanykim</a>
          	</div>
          	<div className="notice">If you find any errors in the dataset or visualization, <a href="mailto:tanykim@gmail.com">please let me know</a></div>
          	{/* <div className="footer-share">
          		<i className="twitter link js-social fa fa-twitter fa-2x" data-value="t"></i>
          		<i className="facebook link js-social fa fa-facebook fa-2x" data-value="f"></i>
          	</div>           */}
          </div>
        </footer>
      </div>
    );
  }
}

export default App;
