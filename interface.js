window.onload = function() {
  startMenu();
	openModal();
};

function menuClicked() {
	openNav();
}

function openNav() {
    document.getElementById("mySidenav").style.width = "100%";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
}

window.onresize = onResize;
setTimeout(onResize, 50);
function onResize() {
	let w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
	let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	let topgroup = document.getElementById("topgroup");
	let topgroupHeight = $('#topgroup').height();
	let remainingHeight = h - topgroupHeight;
	let squareSize = Math.min(remainingHeight / 8, w / 12) - 5;
	var squares = document.getElementsByClassName("square");
    for (var i = 0; i < squares.length; i++) {
        squares[i].style.width = (squareSize + "px");
        squares[i].style.height = (squareSize + "px");
    }
	let theboard = document.getElementById("theboard");
	theboard.style.marginLeft = (((w - 16) - (squareSize * 12)) / 2) + "px";
}

function aboutText() {
	document.getElementById("modaltitle").innerHTML = "About PathwayzAI";
	document.getElementById("modalInformation").innerHTML = "<p>PathwayzAI is a web app that lets you play the board game Pathwayz in the browser. It is still under development. Coming soon: computer AI!</p><a href=\"#\" onclick=\"closeModal();\">Close</a></div>";
}

function startMenu() {
	document.getElementById("modaltitle").innerHTML = "Setup Game";
	// openModal();
	// document.getElementById("modalInformation").innerHTML = "<select class=\"soflow\" id=\"player1\"><option>Select Player 1</option><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option></select><input type=\"text\" style=\"display: inline;\" name=\"player1name\" value=\"Player 1\"><br><select class=\"soflow\" id=\"player2\"><option>Select Player 2</option><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option></select><input type=\"text\" style=\"display: inline;\" name=\"player2name\" value=\"Player 2\"><br><a href=\"#\" onclick=\"closeModal(); testFunction();\">Start Game</a></div>";
}

function openModal() {
	document.getElementById("modal").style.visibility = "visible";
	document.getElementById("modal").style.opacity = 1;
	document.getElementById("modal").style.top = "50%";
}

function closeModal() {
	document.getElementById("modal").style.visibility = "hidden";
	document.getElementById("modal").style.opacity = 0;
	document.getElementById("modal").style.top = "-50%";
}
