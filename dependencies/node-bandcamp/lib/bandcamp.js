'use strict';

var when    = require('when');
var qs      = require('querystring');
var request = require('request');
var cheerio = require('cheerio');

module.exports = (function() {

  /*
   * Initialize the Bandcamp API.
   *
   * @constructor
   */
  function Bandcamp() {}

  /* ====================================================== */

  /*
   * Remove leading and trailing whitespace,
   * remove any newlines or returns,
   * then remove any extra spaces.
   *
   * @param {String} text
   * @return {String} text
   */
  Bandcamp.prototype.formatText = function(text) {
    text = text.trim();
    text = text.replace(/\r?\n|\r/g, '');
    text = text.replace(/ +(?= )/g, '');

    return text;
  };

  /* ====================================================== */

  /*
   * Web scraping must be used on bandcamp.com/search due to lack of public API.
   * 1. iterate over all results inside .results > .result-items
   * 2. only process results of class `searchresult track`
   *      - title of track is a link inside div of class `heading`
   *      - artist and album are inside div of class `subhead`, of the format
   *        "from <album name> by <artist>"
   *      - track URL is a link inside div of class `itemurl`
   *
   * This process is done recursively until the limit is hit.
   *
   * @param {String} searchQuery
   * @param {Number} pageNumber, defaulting to null
   * @param {Number} limit, defaulting to 20
   * @return {Promise} searchResults, defaulting to an empty array
   */
  Bandcamp.prototype.trackSearch = function(query, limit, pageNumber, searchResults) {
    var deferred = when.defer();
    var albumArtistRegex = /from (.+?) by (.+)/i;
    var searchUrl = 'http://bandcamp.com/search?';
    var $;
    var subheadText;
    var imageUrl;
    var regexResult;
    var trackResult;

    limit = limit || 20;
    searchResults = searchResults || [];
    pageNumber = pageNumber || 1;

    searchUrl += qs.stringify({
      q: query.replace(/(%20)|( )/gi, '+'),
      page: pageNumber > 1 ? pageNumber : null
    });

    // retrieve and scrape Bandcamp search results page
    request(searchUrl, function(err, response, body){
      if ( err ) {
        deferred.reject(err);
      } else {
        $ = cheerio.load(body);

        // process each search result
        if( $('.searchresult.track').length ) {
          $('.searchresult.track').each(function(index, element) {
            if ( searchResults.length < limit ) {
              subheadText = this.formatText($(element).find('.subhead').text());
              regexResult = albumArtistRegex.exec(subheadText);

              trackResult = {
                title: this.formatText($(element).find('.heading').text()),
                album: regexResult ? regexResult[1] : null,
                artist: regexResult ? regexResult[2] : null,
                image: imageUrl,
                url: this.formatText($(element).find('.itemurl').text())
              };

              searchResults.push(trackResult);
            }
          }.bind(this));

          // Recurse as long as there are still results and we aren't at our result limit
          if ( searchResults.length < limit ) {
            deferred.resolve(this.trackSearch(query, limit, pageNumber + 1, searchResults));
          }
        }

        // If no more results, return the results we've collected
        deferred.resolve(searchResults);
      }
    }.bind(this));

    return deferred.promise;
  };

  /* ====================================================== */

  /*
   * Retrieves the raw MP3 file via scraping for the Bandcamp track URL provided,
   * and returns it as a stream.
   *
   * @param {String} url
   * @return {Stream} audio
   */
  Bandcamp.prototype.getTrack = function(url) {
    var deferred = when.defer();
    var trackRegex = /{"mp3-128":"(.+?)"/ig;
    var urlResults;
    var returnUrl;

    request(url, function(err, response, body) {
      if ( err ) {
        deferred.reject({ message: 'Unable to retrieve the MP3 file for the specified URL.' });
      } else {
        urlResults = trackRegex.exec(body);

        if ( urlResults !== null ) {
          returnUrl = urlResults[1];
          returnUrl = returnUrl.indexOf('//') === 0 ? 'http:' + returnUrl : returnUrl;
          deferred.resolve(request.get(returnUrl));
        } else {
          deferred.reject({ message: 'Unable to retrieve the MP3 file for the specified URL.' });
        }
      }
    });

    return deferred.promise;
  };

  /* ====================================================== */

  /*
   * Retrieves the track details for the Bandcamp track URL provided.
   *
   * @param {String} url
   * @return {Promise} trackDetails
   */
  Bandcamp.prototype.getDetails = function(url) {
    var deferred = when.defer();
    var $;

    request(url, function(err, response, body) {
      if ( err ) {
        deferred.reject({ message: 'Unable to retrieve the Bandcamp page for the specified URL.' });
      } else {
        $ = cheerio.load(body);

        deferred.resolve({
          title: this.formatText($('h2[itemprop=name]').text()),
          album: this.formatText($('span[itemprop=inAlbum]').text()),
          artist: this.formatText($('span[itemProp=byArtist]').text()),
          url: url
        });
      }
    }.bind(this));

    return deferred.promise;
  };

  /* ====================================================== */

  return new Bandcamp();

})();
