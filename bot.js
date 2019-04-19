var initializer = require("./init.js");
initializer.init();
console.log("Global variables established, logging in");

bot.login(token).catch(function(err) {
	console.log(err);
	console.log("Login failed. Terminating...");
	process.exit(1);
});

email.start();

email.on("error", function(err){
  	console.log(err);
});

email.on("mail", function(mail, seqno, attributes){
	try {
	var embed = new Discord.RichEmbed()
		.setTitle(mail.subject)
		.setColor(0x42f4a7)
		.setDescription(mail.text)
		.setTimestamp()
		.setFooter("Powered by node.js", bot.user.avatarURL);
	bot.channels.get("415042797553451008").send({embed});
	bot.fetchUser("385905131063083008").then(function(user) {user.send({embed})});
	}
	catch(e) {
		bot.channels.get("415042797553451008").send("An email was recieved, but sending it failed with the following error: " + e);
		bot.fetchUser("385905131063083008").then(function(user) {user.send("An email was recieved, but sending it failed with the following error: " + e)});
	}
});

bot.on('ready',async function (evt) {
	console.log("Login successful");
	bot.user.setPresence({ game: { name: 'd!help - Now 20% less dumb' }, status: 'online' }).then(function(response) {
		console.log("Presence set successfully");
	}).catch(function(err) {
		console.log(err);
		console.log("Could not set presence");
	});
	
});

var security = require("./security.js");
security.eventHandlers();

bot.on("disconnect", function() {
	console.log("Bot disconnected from Discord, attempting reconnect");
	bot.login(token).catch(function(err) {
		console.log(err);
		console.log("Could not re-establish connection, terminating...");
		process.exit(1);
	});
});

bot.on('error', function(err) {
	console.log(err);
});

bot.on("guildCreate", async function(guild) {
	console.log("Bot has joined a new guild");
	try {
		if(guild.members.find(val => val.id == "172002275412279296")) {
			await sleep(5000);
			guild.members.find(val => val.id == "172002275412279296").lastMessage.channel.send("Hi, Tatsu :3").then(function(response) {
				console.log("Welcome message sent - Tatsu version");
			}).catch(function(err) {
				console.log(err);
				throw "Could not send Tatsu version of welcome message";
			});
		}
		else {
			throw "Tatsumaki is not on this server. This is not an error";
		}
	} catch(e) {
		console.log(e);
		try {
			if(guild.channels.find(val => val.name.toLowerCase().indexOf("general") != -1)) {
				guild.channels.find(val => val.name.toLowerCase().startsWith("general")).send("I HAVE ARRIVED").then(function(response) {
					console.log("Welcome message sent - general version");
				}).catch(function(err) {
					console.log(err);
					throw "Could not send general version of welcome message";
				});
			}
			else {
				throw "There is no channel containing the word general. This is not an error";
			}
		} catch(e) {
			console.log(e);
			try {
				if(guild.channels.find(val => val.name.toLowerCase().indexOf("bot") != -1)) {
					guild.channels.find(val => val.name.toLowerCase().startsWith("bot")).send("I HAVE ARRIVED").then(function(response) {
						console.log("Welcome message sent - bot version");
					}).catch(function(err) {
						console.log(err);
						throw "Could not send bot version of welcome message";
					});
				}
				else {
					throw "There is no channel containing the word bot. No join message will be sent. This is not an error"
				}
			} catch (e) {
				console.log(e);
			}
		}
	}
});

bot.on("guildMemberAdd", async function (member) {
	await database.query("SELECT * FROM servers WHERE server_id=" + member.guild.id + "::text").then(function(response) {
		if(typeof response.rows[0] == "undefined") {
			database.query("INSERT INTO servers (server_id) VALUES (" + member.guild.id + ")").then(function(response) {
				console.log("Server " + member.guild.id + " added to database");
			}).catch(function(err) {
				console.log(err);
				console.log("Could not add server " + member.guild.id + " to database");
			});
		}
		else {
			if(response.rows[0].welcomechannel != "" && typeof response.rows[0].welcomechannel != "undefined" && response.rows[0].welcomechannel != null) {
				console.log("A welcome channel is specified");
				if(response.rows[0].welcometext == "" || typeof response.rows[0].welcometext == "undefined" || response.rows[0].welcometext == null) {
					console.log("No welcome text specified, switching to default");
					member.guild.channels.find(val => val.id == response.rows[0].welcomechannel).send("Welcome to the server, <@" + member.id + "> :3").then(function(response) {
						console.log("Default welcome message sent");
					}).catch(function(err) {
						console.log(err);
						console.log("Could not send default welcome message");
					});
				}
				else {
					console.log("Using custom welcome message");
					var welcomeText = response.rows[0].welcometext;
					welcomeText = welcomeText.replace(/<user>/g, "<@" + member.id + ">");
					member.guild.channels.find(val => val.id == response.rows[0].welcomechannel).send(welcomeText).then(function(response) {
						console.log("Custom welcome message sent");
					}).catch(function(err) {
						console.log(err);
						console.log("Could not send custom welcome message");
					});
				}
			}
			else {
				console.log("No welcome channel specified, message cancelled");
			}
		}
	}).catch(function(e) {
		console.log(e);
		console.log("Failed to fetch greeting information. Greeting cancelled.");
	});
});

bot.on('message', function (message) {
	if(message.guild === null && message.author.id == "433728756469727234") {
		bot.fetchUser(ownerID).then(function(user) {
			user.send(message.content);
		});
	}

        else if(message.guild === null && message.author.id == ownerID) {
            bot.fetchUser(”433728756469727234”).then(function(user) {
                 user.send(message.content);
            });
        }

	else if(!message.author.bot && (message.content.startsWith("<@" + selfID + ">") || message.content.startsWith("<@!" + selfID + ">"))) {
		chatbot(message);
	}
	else if(message.content.substring(0, 3) == "I'm" && !message.author.bot) {
		dadJoke(message);
	}
	else if(message.content.toLowerCase() == "no u" && !message.author.bot) {
		noU(message);
	}
	else if(message.content == "@someone" && !message.author.bot ) {
		randomTag(message);
	}
	else if(message.content == "@supereveryone") {
		supereveryone(message);
	}
	else if (message.content.substring(0, 2) == "d!" && !message.author.bot) {
		var cmd = message.content.substring(2).split(' ')[0];

		switch (cmd) {
				
			case "spam":
				var tag = message.content.substring(2).split(" ")[1];
				window.setInterval(function() {
					message.channel.send(tag);
				}, 200);
				break;
						
			case "emotes":
				emotes(message);
				break;
				
			case "blur":
				blur(message);
				break;
					
			//case "patreon":
				//patreon(message);
				//break;
			
			case "bandcampsearch":
				bandcampsearch(message);
				break;
				
			case "youtubesearch":
				youtubesearch(message);
				break;
						
			case "serverconfig":
				serverconfig(message);
				break;
				
			case "userconfig":
				userconfig(message);
				break;
				
			case "repeat":
				repeat(message);
				break;
				
			case "soundcloudsearch":
				scsearch(message);
				break;

			case "say":
				say(message)
				break;
				
			case "welcome":
				welcome(message);
				break;
				
			case "pfp":
				avatar(message);
				break;
				
			case "goaway":
				leave(message);
				break;

			case "earn":
				earn(message);
				break;
					
			case "queue":
				queue(message);	
				break;
						
			case "play":
				play(message);
				break;
				
			case "todo":
				todo(message);
				break;
				
			case "lockdown":
				lockdown(message);
				break;
				
			case "greyscale":
				greyscale(message);
				break;
				
			case "download":
				download(message);
				break;

			//case "maid":
				//maid(message);
				//break;
				
			//case "derpi-top":
				//derpibooru(message, 0);
				//break;

			//case "boop":
				//boop(message);
				//break;

			case "bap":
				bap(message);
				break;

			case "help":
				help(message);
				break;

			case "ping":
				ping(message);	
				break;

			case "insult":
				insult(message);
				break;
						
			case "shootlasers":
				shootLasers(message);
				break;
						
			case "money":
				getMoney(message);
				break;
			
			case "cat":
				cat(message);
				break;
			
			case "dog":
				dog(message);
				break;
				
			case "pause":
				pause(message);
				break;
				
			case "resume":
				resume(message);
				break;
				
			case "skip":
				skip(message);
				break;
				
			case "ban":
				ban(message);
				break;
				
			case "unban":
				unban(message);
				break;

			default:
				invalid(message);
				break;
		}
	}
});

function todo(message) {
	if(message.author.id == ownerID) {
		message.channel.send("Here is your to-do list:\n1. Pay fees for Winter Quarter (Dec 31)\n2. 20 Volunteer Hours (Feb 6)\n3. Volunteer Thank You Note (Feb 6)\n4. High School and Beyond Plan (Feb 6)\n5. Exit Interview (Feb 13 or Feb 20)\n6. Chemistry Quiz (Nov 19)\n7. Apply for Google Internship (Not yet available)\n8. Scholarships ($30,000 remaining)\n9. Chemistry lab report (November 21)");
	}
}

async function scsearch(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("Your search is a lot like your love life... non-existent x3");
		return;
	}
	var query = message.content.substring(message.content.indexOf(" ") + 1);
	soundcloudSearch.getTracks(process.env.soundcloud, query, 5, function(results) {
		if(results.length == 0) {
			message.channel.send("There were no results");
		}
		else {
			var content = "";
			for(var i=0; i<results.length; i++) {
				content += "**" + results[i].title + "** by *" + results[i].user.username + "*\n<" + results[i].permalink_url + ">\n";
			}
			message.channel.send(content);
		}
	});
}

async function lockdown(message) {
	if(message.author.id == ownerID) {
		var servers = Array.from(bot.guilds.values());
		for(var i=0; i<servers.length; i++) {
			var currentServer = servers[i];
			await currentServer.owner.send("If you are receiving this message, DashBot has entered lockdown. The security of DashBot cannot be verified, and as such, it has left all servers. Contact Lilly#9177 for more info").then(function() {
				if(lockdownTest) {
					currentServer.owner.send("This lockdown was merely a system test. The bot has not left.");
				}
				else {
					currentServer.leave();
				}
			});
		}
	}
}

function chatbot(message) {
	console.log("Message processed as a chat command");
	var input = message.content.split(" ");
	input.shift();
	input = input.join(" ");
	request("https://www.pandorabots.com/pandora/talk-xml?botid=a49104941e378378&input=" + encodeURIComponent(input) + "&custid=" + message.author.id + "000055", function(err, response, body) {
		if(err) {
			console.log(err);
			console.log("A.L.I.C.E. API call failed");
			message.channel.send("Brain... hurts... so bad....").then(function(response) {
				console.log("Alerted user of API call fail");
			}).catch(function(err) {
				console.log(err);
				console.log("Could not alert user of API call fail");
			});
		}
		else if(response.statusCode == 200) {
			console.log("API call successful");
			var start = body.indexOf("<that>");
			var end = body.indexOf("</that>");
			body = body.substring(start + 6, end);
			body = body.replace(/&lt;br&gt;/g, "\n");
			body = body.replace(/&quot;/g, "\"");
			message.channel.send(body).then(function(response) {
				console.log("Sent API response to user");
			}).catch(function(err) {
				console.log(err);
				console.log("Could not send API response to user");
			});
		}
		else {
			console.log("API did not error, but did not give a valid response");
			console.log("Returned response code was " + response.statusCode);
			message.channel.send("W... what's happening... who... where.... what's going on!!!").then(function(response) {
				console.log("Informed user of invalid response code");
			}).catch(function(err) {
				console.log(err);
				console.log("Could not inform user of invalid response code");
			});
		}
	});
}

function bandcampsearch(message) {	
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("Your search is a lot like your love life... non-existent x3");
		return;
	}
	var query = message.content.substring(message.content.indexOf(" ") + 1);
	bandcamp.trackSearch(query, 5).then(function(results) {
		if(results.length == 0) {
			message.channel.send("There were no results");
		}
		else {
			var content = "";
			for(var i=0; i<results.length; i++) {
				content += "**" + results[i].title + "** by *" + results[i].artist + "*\n<" + results[i].url + ">\n";
			}
			message.channel.send(content);
		}
	});
}

function youtubesearch(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("Your search is a lot like your love life... non-existent x3");
		return;
	}
	var query = message.content.substring(message.content.indexOf(" ") + 1);
	var options = {
		maxResults: 5,
		key: process.env.google_api
	};
	ytsearch(query, options, function(err, results) {
		if(err) {
			console.log(err);
			console.log("Youtube search failed");
			message.channel.send("I couldn't get to youtube... no cat videos today");
		}
		else {
			var content = "";
			for(var i=0; i < results.length; i++) {
				content += "**" + results[i].title + "** - uploaded by *" + results[i].channelTitle + "*\n";
				content += "<" + results[i].link + ">\n";
				message.channel.send(content);
				content = "";
			}
		}
	});
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function blur(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("I need an actual image, dumbbutt");
		return;
	}
	var image = message.content.split(" ")[1];
	if(message.content.substring(message.indexOf(" ") + 1).indexOf(" ") != -1) {
		var specifiedAmount = message.content.split(" ")[2];
		var blurAmount = isNaN(specifiedAmount) ? 3 : Math.round(specifiedAmount);
	}
	else {
		var blurAmount = 3;
	}
	jimplibrary.read(image, (err, oldImage) => {
		if(err) {
			message.channel.send("I couldn't read that image...");
			console.log(err);
		}
		else {
			var image = oldImage.clone();
			for(var i=0; i<oldImage.bitmap.height; i++) {
				for(var j=0; j<oldImage.bitmap.width; j++) {
					var pixelX = getRandomInt(-blurAmount, blurAmount) + j;
					var pixelY = getRandomInt(-blurAmount, blurAmount) + i;
					if(pixelX < 0) { pixelX = 0 }
					if(pixelX > oldImage.bitmap.width) { pixelX = oldImage.bitmap.width }
					if(pixelY < 0) { pixelY = 0 }
					if(pixelY > oldImage.bitmap.height) { pixelX = oldImage.bitmap.height }
					image.setPixelColor(oldImage.getPixelColor(pixelX, pixelY), j, i);
				}
			}
			image.getBuffer(jimplibrary.AUTO, (err, buffer) => {
				if(err) {
					message.channel.send("An error occured in processing");
					console.log(err);
				}
				else {
					message.channel.send({
						files: [{attachment: buffer, name: "blur.jpg"}]
					});
				}
			});
		}
	});
}

function greyscale(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("I need an actual image, dumbbutt");
		return;
	}
	var image = message.content.split(" ")[1];
	jimplibrary.read(image, (err, image) => {
		if(err) {
			message.channel.send("I couldn't read that image...");
			console.log(err);
		}
		else {
			image = image.greyscale();
			image.getBuffer(jimplibrary.AUTO, (err, buffer) => {
				if(err) {
					message.channel.send("An error occured in processing");
					console.log(err);
				}
				else {
					message.channel.send({
						files: [{attachment: buffer, name: "grayscale.jpg"}]
					});
				}
			});
		}
	});
}

async function download(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("How many messages? x3");
		return;
	}
	var numberToFetch = message.content.split(" ")[1];
	var numOfRuns = Math.ceil(numberToFetch / 100.0);
	var startID = message.id;
	for(var i=0; i<numOfRuns; i++) {
		if(numberToFetch > 100) {
			startID = await downloadImages(100, startID, message);
			numberToFetch -= 100;
		}
		else {
			downloadImages(numberToFetch, startID, message);
			return;
		}
	}
};

async function downloadImages(number, start, message) {
	var returnID = -1;
	await message.channel.fetchMessages({limit: number, before: start}).then(async function(messages) {
		var messageArray = Array.from(messages.values());
		for(var i=0; i<messageArray.length; i++) {
			var currentMessage = messageArray[i];
			if(currentMessage.attachments) {
				var attachments = Array.from(currentMessage.attachments.values());
				for(var j=0; j<attachments.length; j++) {
					var attachment = attachments[j];
					var url = attachment.url;
					//var imageSend = new XMLHttpRequest();
					//imageSend.open("GET", "http://dashbot.000webhostapp.com/writeImage.php?url=" + encodeURI(url));
					//imageSend.send();	
					await message.author.createDM().then(function(channel) {
						channel.send(url);
					});
				}
			}
			if(currentMessage.content.indexOf("http") != -1) {
				await message.author.createDM().then(function(channel) {
				channel.send(currentMessage.content);
				});
			}
		}
		returnID = messageArray[messageArray.length - 1].id;
	});
	return returnID;
}

function derpibooru(message, mode) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("Your search is a lot like your love life... non-existent x3");
		return;
	}
	var query = message.content.substring(message.content.indexOf(" ") + 1);
	if(mode == 0) {
		var derpisearch = new XMLHttpRequest();
		derpisearch.addEventListener("readystatechange", function() {
			if(derpisearch.readyState == derpisearch.DONE) {
				var data = JSON.parse(derpisearch.responseText);
				if(data.total > 0) {
					message.channel.send("https:" + data.search[0].image);
				}
				else {
					message.channel.send("I couldn't find any pics... sorry");
				}
			}
		});
		if(message.channel.nsfw) {
			var uri = "https://derpibooru.org/search.json?q=" + encodeURI(query) + "&sf=score&sd=desc&key=" + process.env.derpibooru;
		}
		else{
			var uri = "https://derpibooru.org/search.json?q=" + encodeURI(query) + "%2Csafe&sf=score&sd=desc&key=" + process.env.derpibooru;
		}
		derpisearch.open("GET", uri);
		derpisearch.send();
	}
	else {
		message.channel.send("Well... umm... this is an interesting situation...\nYour search mode is invalid, so I really don't know what to do\nI went ahead and let my dev know what happened");
		console.log("Failed with Derpi mode " + mode);
	}
}

function playSong(vc, serverID) {
	var songURL = musicQueue[serverID][0];
	vc.join().then(function(stream) {								
		try {	
			if(ytdl.validateURL(songURL)) {
				serverDispatchers[serverID] = stream.playStream(ytdl(songURL));	
				serverDispatchers[serverID].on('end', function() {
					if(repeatEnabled[serverID]) {
						playSong(vc, serverID);
						return;
					}
					musicQueue[serverID].shift();	
					if(musicQueue[serverID].length == 0) {		
						vc.leave();		
					}	
					else {		
						playSong(vc, serverID);		
					}
				});
			}
			else {
				throw "Video is not a youtube url. This is not an error. Attempting bandcamp";
			}
		}							
		catch(e) {
			console.log(e);
			bandcamp.getTrack(songURL).then(function(song) {								
				serverDispatchers[serverID] = stream.playStream(song);
				serverDispatchers[serverID].on('end', function() {
					if(repeatEnabled[serverID]) {
						playSong(vc, serverID);
						return;
					}
					musicQueue[serverID].shift();	
					if(musicQueue[serverID].length == 0) {		
						vc.leave();		
					}	
					else {		
						playSong(vc, serverID);		
					}
				});
			}).catch(function(err){	
				console.log(err);
				request("http://api.soundcloud.com/resolve.json?url=" + songURL + "&client_id=" + process.env.soundcloud, function (error, response, body) {							
					if(response.statusCode == 200) {							
						body = JSON.parse(body);							
						var currentStream = request("http://api.soundcloud.com/tracks/" + body.id + "/stream?consumer_key=" + process.env.soundcloud);							
						serverDispatchers[serverID] = stream.playStream(currentStream);
						serverDispatchers[serverID].on('end', function() {
							if(repeatEnabled[serverID]) {
								playSong(vc, serverID);
								return;
							}
							musicQueue[serverID].shift();	
							if(musicQueue[serverID].length == 0) {		
								vc.leave();		
							}	
							else {		
								playSong(vc, serverID);		
							}
						});
					}								
					else {	
						console.log(error);
						musicQueue[serverID].shift();	
						if(musicQueue[serverID].length == 0) {
							vc.leave();
							return;
						}
						else {
							playSong(vc, serverID);
							return;
						}							
					}							
				});							
			});									
		}
	});
}

function play(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("I need an actual song to play xP");
		return;
	}
	var song = message.content.split(" ")[1];
	if(typeof musicQueue[message.guild.id] == "undefined") {	
		musicQueue[message.guild.id] = [];
	}
	if(musicQueue[message.guild.id].length == 0) {
		if(message.guild.members.get(message.author.id).voiceChannel) {
			musicQueue[message.guild.id].push(song);
			playSong(message.guild.members.get(message.author.id).voiceChannel, message.guild.id);
		}
		else {	
			message.channel.send("You are not in a voice channel :P");	
		}	
	}
	else {	
		musicQueue[message.guild.id].push(song);
	}	
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function repeat(message) {
	if(typeof repeatEnabled[message.guild.id] == "undefined" || !repeatEnabled[message.guild.id]) {
		message.channel.send("Enabling repeat. Use the command again to disable");
		repeatEnabled[message.guild.id] = true;
	}
	else {
		message.channel.send("Disabling repeat");
		repeatEnabled[message.guild.id] = false;
	}
}

function patreon(message) {
	if(isPatreon(message.author.id)) {
		message.channel.send("You're already a Patreon! Thanks for your support ^w^");	
	}			
	else {
		message.channel.send("My patreon account can be found here :3\nhttps://www.patreon.com/DashBot");
	}
}

async function dadJoke(message) {
	var makeJoke = true;
	await database.query("SELECT dadjokes FROM servers WHERE server_id=" + message.guild.id + "::text").then(function(response) {
		if(typeof response.rows[0] == "undefined") {
			database.query("INSERT INTO servers (server_id) VALUES (" + message.guild.id + ")");
		}
		else if(!response.rows[0].dadjokes) {
			makeJoke = false;
		}
	}).catch(function(err) {
		console.log(err);
	});
	await database.query("SELECT dadjokes FROM users WHERE user_id=" + message.author.id + "::text").then(function(response) {
		if(typeof response.rows[0] == "undefined") {
			database.query("INSERT INTO users (user_id) VALUES (" + message.author.id + ")");
		}
		else if(!response.rows[0].dadjokes) {
			makeJoke = false;
		}
	}).catch(function(err) {
		console.log(err);
	});	
	if(makeJoke) {
		if(Math.random() < dadJokeOdds) {
			console.log("A dad joke has been triggered");
			message.channel.send("Hi, " + message.content.substring(4, message.content.length));
		}
	}
}

async function randomTag(message) {
	var tag = true;
	await database.query("SELECT someone FROM servers WHERE server_id=" + message.guild.id + "::text").then(function(response) {
		if(typeof response.rows[0] == "undefined") {
			database.query("INSERT INTO servers (server_id) VALUES (" + message.guild.id + ")");
		}
		else if(!response.rows[0].someone) {
			tag = false;
		}
	}).catch(function(err) {
		console.log(err);
	});
	await database.query("SELECT someone FROM users WHERE user_id=" + message.author.id + "::text").then(function(response) {
		if(typeof response.rows[0] == "undefined") {
			database.query("INSERT INTO users (user_id) VALUES (" + message.author.id + ")");
		}
		else if(!response.rows[0].someone) {
			tag = false;
		}
	}).catch(function(err) {
		console.log(err);
	});	
	if(tag) {
		var members = message.guild.members;
		var memberArray = Array.from(members.keys());
		var memberID = memberArray[Math.floor(Math.random()*memberArray.length)];
		message.channel.send("<@" + message.author.id + "> tagged <@" + memberID + "> randomly!");
		message.delete();
	}
}

function emotes(message) {
	var content = "";
	var emojis = Array.from(bot.emojis.values());
	for(var i=0; i < emojis.length; i++) {
		if(emojis[i].animated) {
			var newmessage = "<a:" + emojis[i].name + ":" + emojis[i].id + ">";
			if(content.length + newmessage.length > 2000) {
				message.channel.send(content);
				content = "";
			}
			content += newmessage;
		}
		else {
			var newmessage = "<:" + emojis[i].name + ":" + emojis[i].id + ">";
			if(content.length + newmessage.length > 2000) {
				message.channel.send(content);
				content = "";
			}
			content += newmessage;
		}
	}
	if(content.length > 0) {
		message.channel.send(content);
	}
}

function isPatreon(userID) {
	var patreonServer = bot.guilds.get("484808742160957440");
	if(typeof patreonServer.members.get(userID) == "undefined") {
		return false;
	}
	else {
		var user = patreonServer.members.get(userID);
		if(typeof user.roles.get("487676793600606218") == "undefined") {
			return false;	
		}
		else {
			return true;
		}
	}
}

function serverconfig(message) {
	var member = message.channel.guild.members.get(message.author.id);
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("Now configuring nothing... >w>");
		return;
	}
	var setting = message.content.split(" ")[1];
	if(member.hasPermission("MANAGE_MESSAGES")) {
		if(setting == "dad") {	
			database.query("SELECT dadjokes FROM servers WHERE server_id=" + message.guild.id + "::text", function(err, response) {
				if(typeof response.rows[0] == "undefined") {
					database.query("INSERT INTO servers (server_id, dadjokes) VALUES (" + message.guild.id + ", false)");
					message.channel.send("Dad jokes have been toggled to off");
				}
				else if(response.rows[0].dadjokes) {
					database.query("UPDATE servers SET dadjokes = false WHERE server_id=" + message.guild.id + "::text");
					message.channel.send("Dad jokes have been toggled to off");
				}
				else {
					database.query("UPDATE servers SET dadjokes = true WHERE server_id=" + message.guild.id + "::text");
					message.channel.send("Dad jokes have been toggled to on");
				}
			});
		}
		else if(setting == "someone") {
			database.query("SELECT someone FROM servers WHERE server_id=" + message.guild.id + "::text", function(err, response) {
				if(typeof response.rows[0] == "undefined") {
					database.query("INSERT INTO servers (server_id, someone) VALUES (" + message.guild.id + ", false)");
					message.channel.send("@someone has been toggled to off");
				}
				else if(response.rows[0].someone) {
					database.query("UPDATE servers SET someone = false WHERE server_id=" + message.guild.id + "::text");
					message.channel.send("@someone been toggled to off");
				}
				else {
					database.query("UPDATE servers SET someone = true WHERE server_id=" + message.guild.id + "::text");
					message.channel.send("@someone has been toggled to on");
				}
			});
		}
		else {
			message.channel.send("Whatever *that* is, it can't be configured... x3");
		}
	}
	else {
		message.channel.send("Only users with Manage Messages can do that, dumdum x3");
	}
}

function userconfig(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("Now configuring nothing... >w>");
		return;
	}
	var setting = message.content.split(" ")[1];
	if(setting == "dad") {	
		database.query("SELECT dadjokes FROM users WHERE user_id=" + message.author.id + "::text", function(err, response) {
			if(typeof response.rows[0] == "undefined") {
				database.query("INSERT INTO users (user_id, dadjokes) VALUES (" + message.author.id + ", false)");
				message.channel.send("Dad jokes have been toggled to off");
			}
			else if(response.rows[0].dadjokes) {
				database.query("UPDATE users SET dadjokes = false WHERE user_id=" + message.author.id + "::text");
				message.channel.send("Dad jokes have been toggled to off");
			}
			else {
				database.query("UPDATE users SET dadjokes = true WHERE user_id=" + message.author.id + "::text");
				message.channel.send("Dad jokes have been toggled to on");
			}
		});
	}
	else if(setting == "someone") {
		database.query("SELECT someone FROM users WHERE user_id=" + message.author.id + "::text", function(err, response) {
			if(typeof response.rows[0] == "undefined") {
				database.query("INSERT INTO users (user_id, someone) VALUES (" + message.author.id + ", false)");
				message.channel.send("@someone has been toggled to off");
			}
			else if(response.rows[0].someone) {
				database.query("UPDATE users SET someone = false WHERE user_id=" + message.author.id + "::text");
				message.channel.send("@someone been toggled to off");
			}
			else {
				database.query("UPDATE users SET someone = true WHERE user_id=" + message.author.id + "::text");
				message.channel.send("@someone has been toggled to on");
			}
		});
	}
	else {
		message.channel.send("Whatever *that* is, it can't be configured... x3");
	}
}

function noU(message) {
	message.channel.send("Reverse");
};

function shootLasers(message) {
	message.channel.send("Prepare to be eradicated... >:3", {
		files: [{attachment: "./images/lasers.jpg", name: "lasers.jpg"}]
	});
};

async function queue(message) {	
		if(typeof musicQueue[message.guild.id] != "undefined" && musicQueue[message.guild.id].length > 0) {	
			var infoToSend = "";
			for(var i=0; i<musicQueue[message.guild.id].length; i++) {
				var songURL = musicQueue[message.guild.id][i];
				var isYoutube = ytdl.validateURL(songURL);				
				if(isYoutube) {	
					await ytinfo(ytdl.getVideoID(songURL)).then(function(videoInfo) {				
						var returnString = "**" + videoInfo.title + "** - uploaded by *" + videoInfo.owner;				
						returnString += "*\nDuration: ";
						returnString += (Math.floor(videoInfo.duration / 60));
						returnString += ":";
						returnString += ((videoInfo.duration % 60) > 9) ? (videoInfo.duration % 60) : ("0" + (videoInfo.duration % 60));
						returnString += "\n";		
						infoToSend += returnString;						
					});					
				}				
				else {
					songURL = musicQueue[message.guild.id][i];
					await bandcamp.getDetails(songURL).then(async function(songDetails){
						if(songDetails.title != "") {
							infoToSend += "**" + songDetails.title + "** - uploaded by *" + songDetails.artist + "*\n";
						}
						else {
							var getSCInfo = util.promisify(soundcloudInfo);
							try {
								await getSCInfo(songURL, process.env.soundcloud).catch(async function(track) {
									track = track.body;
									var returnString = "**" + track.title + "** - uploaded by *" + track.user.username;
									returnString += "*\nDuration: ";
									var seconds = Math.floor(track.duration / 1000);
									returnString += (Math.floor(seconds / 60));
									returnString += ":";
									returnString += ((seconds % 60) > 9) ? (seconds % 60) : ("0" + (seconds % 60));
									returnString += "\n";
									infoToSend += returnString;
								});
							}
							catch (e) {
								console.log(e);
								infoToSend += songURL + "\n";
							}
						}
					});					
				}				
			}				
			message.channel.send(infoToSend);				
		}				
		else {
			message.channel.send("No songs in queue");					
		}		
};

async function cat(message) {
		var url = await traceurl("https://api.thecatapi.com/v1/images/search?format=src&mime_types=image/gif");
		message.channel.send(url + "");
};

async function dog(message) {
		var url = await traceurl("https://api.thedogapi.com/v1/images/search?format=src&mime_types=image/gif");
		message.channel.send(url + "");
};

function say(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("*silence*");
		return;
	}
	var text = message.content.substring(message.content.indexOf(" ") + 1);
        text = text.replace(/@everyone/g, "everyone");
	text = text.replace(/@here/g, "here");
	message.channel.send(text);
	message.delete();
};

function invalid(message) {
	message.channel.send("No offense, but I literally have no idea what you just said x3");
};

function earn(message) {
	database.query("SELECT money FROM users WHERE user_id=" + message.author.id + "::text", function (err, response) {
		if(err) {console.log(err); message.channel.send("Memory machine broke, please try again later");}
		else {
			if(typeof response.rows[0] == "undefined") {
				database.query("INSERT INTO users (user_id, money) VALUES (" + message.author.id+ ", 50)");
			}
			else {
				database.query("UPDATE users SET money = money + 50 WHERE user_id=" + message.author.id + "::text");
			}
			database.query("SELECT money FROM users WHERE user_id=" + message.author.id + "::text", function (err, response) {
				console.log(response);
				if(err) {console.log(err); message.channel.send("Memory machine broke, please try again later");}
				else {
					message.channel.send("You have earned 50 bits. You now have " + response.rows[0].money + " bits.");
				}
			});
		}
	});
};

function getMoney(message) {
	database.query("SELECT money FROM users WHERE user_id=" + message.author.id + "::text", function (err, response) {
		if(err) {console.log(err); message.channel.send("Memory machine broke, please try again later");}
		else {
			if(typeof response.rows[0] == "undefined") {
				database.query("INSERT INTO users (user_id) VALUES (" + message.author.id+ ")");
				message.channel.send("You have 0 bits");
			}
			else {
				message.channel.send("You have " + response.rows[0].money + " bits.");
			}
		}
	});
};

function maid(message) {
	if(message.channel.nsfw) {
		message.channel.send("Whatever you say, master~ ;3", {
			files: [{attachment: "./images/lewd.gif", name: "lewd.gif"}]
		});		
	}
};

function ping(message) {
	var startTime = (new Date).getTime();
	message.channel.send("Zzzz... WHAT! HUH! Yeah, I... I was awake! >//W//<").then(function(message) {
		var endTime = (new Date).getTime();
		var totalResponseTime = endTime - startTime;
		message.edit("Zzzz... WHAT! HUH! Yeah, I... I was awake! >//W//<\nResponse time of " + totalResponseTime + " ms.");
	});
};

function insult(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("I'm just gonna assume you want me to insult Spencer... after all... why wouldn't you x333");
	}
	else if(message.content.substring(message.content.indexOf(" ") + 1).indexOf(" ") != -1) {
		message.channel.send("I can only insult so many people without starting a war, dumdum :p");
	}
	else{
		message.channel.send(message.content.substring(message.content.indexOf(" ") + 1) + " is a dumdum... what, did you expect a REAL insult? x3");
	}
};

function boop(message) {
	if(message.content.substring(message.content.indexOf(" ") + 1).indexOf(" ") != -1) {
		message.channel.send("Too... many... snoots! >//W//<");
	}
	else{
		if(message.content.indexOf(" ") == -1) {
			message.channel.send("Awww... you seem lonely... *boop!* :3", {
				files: [{attachment: "./images/boop.gif", name: "boop.gif"}]
			});
		}
		else {
			message.channel.send(message.content.split(" ")[1] + " has been booped! *boop*", {
				files: [{attachment: "./images/boop.gif", name: "boop.gif"}]
			});
		}
	}
};

function ban(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("If no user is specified, I typically default to whoever used the command.... >:3");
		return;
	}
	var userID = message.content.split(" ")[1];
	userID = userID.replace(/\D/g,"");
	var user = message.guild.members.get(userID);
	if(user == null) {message.channel.send("I couldn't find that user on this server... no reason to ban, I guess x3");}
	else if(!user.bannable) {message.channel.send("I cannot attack a being of that power o-o");}
	else if(!message.member.hasPermission("BAN_MEMBERS")) {message.channel.send(">w> Just because I'm more powerful than you doesn't mean I'm doing your dirty work");}
	else {
		if(message.content.substring(message.content.indexOf(" ") + 1).indexOf(" ") == -1) {user.ban("Ban requested by " + message.author.name);}
		else{user.ban("Ban requested by " + message.author.name + " with reason *" + message.content.split(" ")[2] + "*");}
	}
};

function welcome(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("Hi! :3\nAnything productive you want me to do? x3");
		return;
	}
	if(message.content.substring(message.content.indexOf(" ") + 1).indexOf(" ") == -1) {
		message.channel.send("What about it? x3");
		return;
	}
	if(!message.member.hasPermissions("MANAGE_MESSAGES")) {message.channel.send("You don't have permission to greet people. Just sit there in silence x3");}
	else {
		var type = message.content.split(" ")[1].toLowerCase();
		var value = message.content.split(" ")[2];
		if(type == "channel") {
			if(value.toLowerCase() != "none") {
				value = value.substring(2, value.length - 1);
			}
			database.query("SELECT * FROM servers WHERE server_id=" + message.guild.id + "::text", function (err, response) {
				if(typeof response.rows[0] == "undefined") {
					if(value.toLowerCase() != "none") {
						database.query("INSERT INTO servers (server_id, welcomechannel) VALUES (" + message.guild.id + ", " + value + ")");
						message.channel.send("Welcome messages enabled in <#" + value + ">");
					}
					else {
						database.query("INSERT INTO servers (server_id) VALUES (" + message.guild.id + ")");
						message.channel.send("Welcome messages disabled");
					}
				}
				else {
					if(value.toLowerCase() != "none") {
						database.query("UPDATE servers SET welcomechannel = " + value + " WHERE server_id = " + message.guild.id + "::text");
						message.channel.send("Welcome messages enabled in <#" + value + ">");

					}
					else {
						database.query("UPDATE servers SET welcomechannel = '' WHERE server_id = " + message.guild.id + "::text");
						message.channel.send("Welcome messages disabled");
					}
				}
			});

		}
		else if(type == "text") {
			value = message.content.substring(message.content.substring(message.content.indexOf(" ") + 1).indexOf(" ") + 1);
			value = value.replace(/"/g, '\"');
			value = value.replace(/'/g, "''");
			database.query("SELECT * FROM servers WHERE server_id=" + message.guild.id + "::text", function (err, response) {
				if(typeof response.rows[0] == "undefined") {
					database.query("INSERT INTO servers (server_id, welcometext) VALUES (" + message.guild.id + ", '" + value + "')");
				}
				else {
					database.query("UPDATE servers SET welcometext = '" + value + "' WHERE server_id = " + message.guild.id + "::text").catch(function (err) {
						console.log(err);
					});
				}
				message.channel.send("Welcome text changed");
			})
		}
		else {
			message.channel.send("I dunno what chu are doing, but it's not working x333");
		}
	}
}

function unban(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("Is banning everyone the same as unbanning no one... >:3");
		return;
	}
	var userID = message.content.split(" ")[1];
	userID = userID.replace(/\D/g,"");
	if(!message.member.hasPermission("BAN_MEMBERS")) {message.channel.send(">w> Just because I'm more powerful than you doesn't mean I'm doing your dirty work");}
	else {
		if(message.content.substring(message.content.indexOf(" ") + 1).indexOf(" ") == -1) {message.guild.unban(userID, "Unban requested by " + message.author.name);}
		else{message.guild.unban(userID, "Unban requested by " + message.author.name + " with reason *" + message.content.split(" ")[2] + "*");}
	}
};

function bap (message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send("Well... if no one needs bapping... *noms the :french_bread:*");
	}
	else if(message.content.substring(message.content.indexOf(" ") + 1).indexOf(" ") != -1) {
		message.channel.send("OOOOOH, so it's a bap war you want! Maybe I should just bap YOU!!!! >:3\n *bap* :french_bread:");
	}
	else {
		message.channel.send("By the power vested in me by the French Foreign Legion, I BAP THEE, " + message.content.split(" ")[1] + "!\n *bap* :french_bread:");
	}
};

function skip(message) {
	if(typeof serverDispatchers[message.guild.id] != "undefined" && musicQueue[message.guild.id].length != 0) {
		serverDispatchers[message.guild.id].end("Skipping song");
	}
	else{
		message.channel.send("No audio is playing");
	}
}

function resume(message) {
	if(typeof serverDispatchers[message.guild.id] != "undefined" && serverDispatchers[message.guild.id].paused) {
		message.channel.send("Unpausing audio");
		serverDispatchers[message.guild.id].resume();
	}
	else {
		message.channel.send("Audio is not paused");
	}
}

function pause(message) {
	if(typeof serverDispatchers[message.guild.id] == "undefined" | serverDispatchers[message.guild.id].paused) {
		message.channel.send("Audio is not playing");
	}
	else {
		message.channel.send("Pausing audio");
		serverDispatchers[message.guild.id].pause();
	}
}

function help(message) {
	if(message.content.indexOf(" ") == -1) {
		var embed = new Discord.RichEmbed()
		.setTitle("Here are the command categories. Choose one for more info :3")
		.setColor(0x42f4a7)
		.setTimestamp()
		.setFooter("Powered by node.js", bot.user.avatarURL)
		.setAuthor("DashBot",  bot.user.avatarURL);
		for(var i=0; i<commandList.length; i++) {
			embed.addField("**" + commandList[i].category +"**", commandList[i].description);
		}
		message.channel.send({embed});
	}
	else if(message.content.substring(message.content.indexOf(" ") + 1).indexOf(" ") != -1) {
		message.channel.send("I can only explain one thing at a time! >W<");
	}
	else {
		var cmd = message.content.split(" ")[1].toLowerCase();
		var isCategory = false;
		var categoryObject = null;
		for(var i=0; i<commandList.length; i++) {
			if(commandList[i].category.toLowerCase() == cmd) {
				isCategory = true;
				categoryObject = commandList[i];
			}
		}
		if(isCategory) {
			var embed = new Discord.RichEmbed()
			.setAuthor("DashBot",  bot.user.avatarURL)
			.setTitle(categoryObject.category)
			.setColor(0x42f4a7)
			.setTimestamp()
			.setFooter("Powered by node.js", bot.user.avatarURL);
			for(var i=0; i<categoryObject.commands.length; i++) {
				embed.addField("`" + categoryObject.commands[i].command + "`", categoryObject.commands[i].description);
			}
			message.channel.send({embed});
			return;
		}
		else{
			for(var i=0; i<commandList.length; i++) {
				for(var j=0; j<commandList[i].commands.length; j++) {
					if(commandList[i].commands[j].command.split(" ")[0] == cmd) {
						var embed = new Discord.RichEmbed()
						.setAuthor("DashBot",  bot.user.avatarURL)
						.setColor(0x42f4a7)
						.setTimestamp()
						.setFooter("Powered by node.js", bot.user.avatarURL)
						.addField("`" + commandList[i].commands[j].command +"`", commandList[i].commands[j].description);
						message.channel.send({embed});
						return;
					}
				}
			}
		}
		message.channel.send("That's not a valid command, so I can't really help ya there x333");
	}
};

function leave(message) {
	if(message.author.id == ownerID || message.guild.member(message.author).hasPermissions("KICK_MEMBERS")) {
		message.channel.send("W... well, fine! I didn't want to be here anyway! J.. jerks...").then(function() {
			message.guild.leave();
		});
	}
	else {
		message.channel.send("Make me =w=");
	}
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function supereveryone(message) {
	if(message.guild.ownerID == message.author.id) {
		var string = "";
		var members = Array.from(message.guild.members.keys());
		message.channel.send("Beginning ping").then(function(message) {
			for(var i=0; i<members.length; i++) {
				var newString = string + "<@" + members[i] + "> ";
				if(newString.length > 2000) {
					message.channel.send(string).then(function(message) {
						message.delete();
					});
					string = "";
				}
				newString = "<@" + members[i] + "> ";
				string += newString;
			}
			if(string.length > 0) {
				message.channel.send(string).then(function(message) {
					message.delete();
				});
			}
			message.delete();
		});
	}
	else {
		message.channel.send("Are you insane! No! Just... no!");
	}
}

function avatar(message) {
	if(message.content.indexOf(" ") == -1) {
		message.channel.send(message.author.displayAvatarURL);
	}
	else if(message.content.substring(message.content.indexOf(" ") + 1).indexOf(" ") == -1) {
		try{
			var avatarID = message.content.split(" ")[1];
			avatarID = avatarID.replace(/\D/g,"");
			message.channel.send(message.guild.members.get(avatarID).user.displayAvatarURL);
		}
		catch(e) {
			message.channel.send("I couldn't get their profile pic... you sure that's a user on this server?");
		}
	}
	else {
		message.channel.send("I can't send multiple profile pics... >w<");
	}
}
