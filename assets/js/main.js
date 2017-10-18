var startTime = null;
var running = false;
var interval = null;
var entryNumberTime = 0;
var entryNumberStartLocation = 0;
var entryNumberStopLocation = 0;

/* Initializes the table with values from localStorage and resumes clock from previous session if running */
function initializeTable() {
	if (localStorage.length == 0) {
		return;
	}

	var tableItems = localStorage.length - 1;

	/* Fills in location entries that didn't have geographical data from previous session */
	for (entryNumber = 0; entryNumber < tableItems; entryNumber++) {
		var startTimeEntry = localStorage.getItem("startTime" + entryNumber);
		var startLocationEntry = localStorage.getItem("startLocation" + entryNumber);
		var stopTimeEntry = localStorage.getItem("stopTime" + entryNumber);
		var stopLocationEntry = localStorage.getItem("stopLocation" + entryNumber);
		var elapsedTimeEntry = localStorage.getItem("elapsedTime" + entryNumber);

		if (!startTimeEntry && !startLocationEntry && !stopTimeEntry && !stopLocationEntry && !elapsedTimeEntry) {
			break;
		}

		if (!startLocationEntry) {
			localStorage.setItem("startLocation" + entryNumber, "No GeoData");
			tableItems++;
		}

		if (!stopLocationEntry) {
			localStorage.setItem("stopLocation" + entryNumber, "No GeoData");
			tableItems++;
		}
	}

	var table = document.getElementById("tbody");

	/* Fills in table with data from previous session */
	for (entryNumber = 0; entryNumber < tableItems / 5; entryNumber++) {
		var newRow = table.insertRow(entryNumber);

		var startTimeCell = newRow.insertCell(0);
		var startTimeTextNode = document.createTextNode(localStorage.getItem("startTime" + entryNumber));
		startTimeCell.appendChild(startTimeTextNode);

		var startLocationCell = newRow.insertCell(1);
		var startLocationTextNode = document.createTextNode(localStorage.getItem("startLocation" + entryNumber));
		startLocationCell.appendChild(startLocationTextNode);

		var stopTimeCell = newRow.insertCell(2);
		var stopTimeString = localStorage.getItem("stopTime" + entryNumber);
		if (stopTimeString == null) {
			newRow.insertCell(3);
			newRow.insertCell(4);
			break;
		}
		var stopTimeTextNode = document.createTextNode(stopTimeString);
		stopTimeCell.appendChild(stopTimeTextNode);

		var stopLocationCell = newRow.insertCell(3);
		var stopLocationTextNode = document.createTextNode(localStorage.getItem("stopLocation" + entryNumber));
		stopLocationCell.appendChild(stopLocationTextNode);

		var elapsedTimeCell = newRow.insertCell(4);
		var elapsedTimeTextNode = document.createTextNode(localStorage.getItem("elapsedTime" + entryNumber));
		elapsedTimeCell.appendChild(elapsedTimeTextNode);
	}

	/* Sets entry numbers to resume from previous session and clock to resume from previous session if running */
	if (tableItems % 5 != 0) {
		entryNumberTime = Math.floor(tableItems / 5);
		entryNumberStartLocation = Math.ceil(tableItems / 5);
		entryNumberStopLocation = Math.floor(tableItems / 5);

		startTime = new Date(localStorage.getItem("startTime"));
		running = true;
		interval = setInterval("count()", 1);

		var button = document.getElementById("startstop");
		button.innerHTML = "Stop";
		button.setAttribute("onclick", "stopTimer()");
		button.style.backgroundColor = "#f44336";
	} else {
		entryNumberTime = tableItems / 5;
		entryNumberStartLocation = tableItems / 5;
		entryNumberStopLocation = tableItems / 5;
	}
}

/* Starts Stopwatch and changes button to Stop and adds appropriate table items */
function startTimer() {
	if (running) {
		return;
	}
	startTime = new Date();
	running = true;
	interval = setInterval("count()", 1);

	var button = document.getElementById("startstop");
	button.innerHTML = "Stop";
	button.setAttribute("onclick", "stopTimer()");
	button.style.backgroundColor = "#f44336";

	var table = document.getElementById("tbody");
	var newRow = table.insertRow(table.rows.length);
	for (i = 0; i < 5; i++) {
		newRow.insertCell(i);
	}

	insertTimeEntry(startTime, 0);
	insertLocationEntry(1);
}

/* Stops Stopwatch and changes button to Start and adds appropriate table items */
function stopTimer() {
	if (!running) {
		return;
	}
	var stopTime = new Date();
	running = false;
	clearInterval(interval);

	var button = document.getElementById("startstop");
	button.innerHTML = "Start";
	button.setAttribute("onclick", "startTimer()");
	button.style.backgroundColor = "#4CAF50";

	var table = document.getElementById("tbody");

	insertTimeEntry(stopTime, 2);
	insertLocationEntry(3);
	
	var elapsedTimeEntry = table.rows[table.rows.length - 1].cells[4];
	var elapsedTimeText = document.createTextNode(document.getElementById("h1").innerHTML);
	elapsedTimeEntry.appendChild(elapsedTimeText);

	localStorage.setItem("elapsedTime" + entryNumberTime, document.getElementById("h1").innerHTML);
	entryNumberTime++;
}

/* Resets the table and Stopwatch */
function reset() {
	if (running) {
		return;
	}
	document.getElementById("h1").innerHTML = "00:00:00.000";
	var tbody = document.getElementById("tbody");
	tbody.innerHTML = "";
	localStorage.clear();
	entryNumberTime = 0;
	entryNumberStartLocation = 0;
	entryNumberStopLocation = 0;
}

/* Inserts time entry into the table */
function insertTimeEntry(date, spot) {
	var table = document.getElementById("tbody");
	var timeEntry = table.rows[table.rows.length - 1].cells[spot];
	
	var timeTextNode = document.createTextNode(entryTime(date));

	timeEntry.appendChild(timeTextNode);

	if (spot == 0) {
		localStorage.setItem("startTime" + entryNumberTime, entryTime(date));
		localStorage.setItem("startTime", date.toUTCString());
	} else {
		localStorage.setItem("stopTime" + entryNumberTime, entryTime(date));
	}
}

/* Inserts location entry into the table */
function insertLocationEntry(spot) {
	if (!navigator.geolocation) {
		error();		
		return;
	}

	function success(position) {
		var table = document.getElementById("tbody");

		/* Fills in location at the first empty spot because there is lag between when time entries are added and location entries */
		for (i = 0; i < table.rows.length; i++) {
			if (table.rows[i].cells[spot].childNodes.length == 0) {
				var locationEntry = table.rows[i].cells[spot]
				break;
			}
		}

		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
		var locationText = latitude + String.fromCharCode(176) + ", " + longitude + String.fromCharCode(176);
		var locationTextNode = document.createTextNode(locationText);

		locationEntry.appendChild(locationTextNode);

		if (spot == 1) {
			localStorage.setItem("startLocation" + entryNumberStartLocation, locationText);
			entryNumberStartLocation++;
		} else {
			localStorage.setItem("stopLocation" + entryNumberStopLocation, locationText);
			entryNumberStopLocation++;
		}
	}

	function error() {
		var table = document.getElementById("tbody");

		/* Fills in location at the first empty spot because there is lag between when time entries are added and location entries */
		for (i = 0; i < table.rows.length; i++) {
			if (table.rows[i].cells[spot].childNodes.length == 0) {
				var locationEntry = table.rows[i].cells[spot]
				break;
			}
		}

		var locationTextNode = document.createTextNode("No GeoData");
		
		locationEntry.appendChild(locationTextNode);

		if (spot == 1) {
			localStorage.setItem("startLocation" + entryNumberStartLocation, "No GeoData");
			entryNumberStartLocation++;
		} else {
			localStorage.setItem("stopLocation" + entryNumberStopLocation, "No GeoData");
			entryNumberStopLocation++;
		}
	}

	navigator.geolocation.getCurrentPosition(success, error);
}

/* Counts the clock upward by replacing current time with new time */
function count() {
	var currentTime = new Date();
	var elapsedDate = new Date(currentTime - startTime);
	document.getElementById("h1").innerHTML = stopwatch(elapsedDate);
}

/* Returns a string representation of the time elapsed of a date since Jan 1, 1970 UTC (Used to display stopwatch) */
function stopwatch(date) {
	/* Assuming the stopwach won't elapse for more than a year; if it does, stopwatch will go back to 0. */
	var months = date.getUTCMonth();
	var days = elapsedDays(months) + (date.getUTCDate() - 1);
	var hours = days * 24 + date.getUTCHours();
	var minutes = date.getUTCMinutes();
	var seconds = date.getUTCSeconds();
	var milliseconds = date.getUTCMilliseconds();

	if (hours < 10) {
		hours = "0" + hours;
	}

	if (minutes < 10) {
		minutes = "0" + minutes;
	}

	if (seconds < 10) {
		seconds = "0" + seconds;
	}

	if (milliseconds < 10) {
		milliseconds = "0" + milliseconds;
	}

	if (milliseconds < 100) {
		milliseconds = "0" + milliseconds;
	}

	return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

/* Returns a string representation of a date with only the time and timezone (Used in table) */
function entryTime(date) {
	var string = date.toString();
	var items = string.split(" ");
	return items[4] + " " + items[5] + " " + string.substring(string.indexOf("("), string.indexOf(")") + 1);
}

/* Returns the number of days in the previous months if the current month is MONTHS (0-11) */
function elapsedDays(months) {
	if (months < 3) {
		if (months == 0) {
			return 0;
		} else if (months == 1) {
			return 31;
		} else {
			return 59; /* Assuming it's not a leap year */
		}
	} else {
		if (months < 8) {
			var monthsWith31Days = Math.ceil((months - 2) / 2);
			var monthsWith30Days = Math.floor((months - 2) / 2);
		} else {
			var monthsWith31Days = Math.floor(months / 2);
			var monthsWith30Days = Math.floor((months - 3) / 2);
		}
		return monthsWith31Days * 31 + monthsWith30Days * 30 + 59;
	}
}

/*
Number of days in each month:
0: 31
1: 28
2: 31
3: 30
4: 31
5: 30
6: 31
7: 31
8: 30
9: 31
10: 30
11: 31

(Months with 31 Days, Months with 30 Days) in months previous to this month not including months 0 and 1:
3: 1, 0
4: 1, 1
5: 2, 1
6: 2, 2
7: 3, 2

8: 4, 2
9: 4, 3
10: 5, 3
11: 5, 4 
*/