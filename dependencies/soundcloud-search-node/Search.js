//Create variable request activating the "request" module
var request = require('request');


/**
 * Create the function that returns the tracks in the JSON format with a callback function
 * @param search The String of the song the user wants to search ex "Avicii"
 * @param limit "The limit on the amount of tracks to get (1 - 100)
 * @param callback Teh callback function which returns an array of tracks in JSON format
 */
exports.getTracks = function (client_id, search, limit, callback){
    if(isNaN(limit)) throw "Not a number";
    if(limit > 100 || limit < 1) throw "Limit must be between 1 and 100";
    if(!client_id) throw "Must have a client id";
    //Set the souncloud api tracks url with variables to replace
    var searchURL = "http://api.soundcloud.com/tracks.json?client_id=" + client_id + "&q=SEARCH_TERM&limit=LIMIT_TERM";

    search = encodeURI(search);
    searchURL =  searchURL.replace("SEARCH_TERM", search).replace("LIMIT_TERM", limit);
    request({
        url: searchURL
    }, function (error, response, body) {
        //Check for errors
        if(error) throw new Error(error);
        //Make sure there is no error and make sure the page is loaded
        if (!error && response.statusCode === 200){
            var tracks = JSON.parse(body);
            callback(tracks);
        }
    })
}

exports.getTrackJson = function(client_id, track_id, callback){
    if(!client_id) throw "You need to have a client id";
    if(!track_id) throw "You need to have a track id";

    var searchURL = "https://api.soundcloud.com/tracks/" + track_id + "?client_id=" + client_id;

    request({
        url: searchURL,
        json: true
    }, function (error, response, body) {
        //Check for errors
        if(error) throw new Error(error);
        //Make sure there is no error and make sure the page is loaded
        if (!error && response.statusCode === 200){
            callback(body);
        }
    })

}

