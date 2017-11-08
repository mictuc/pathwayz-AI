window.onload = function() {
	openModal();
	var int=setInterval(checkAIsTurn,300);
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

function checkAIsTurn() {
	var squares = document.getElementsByClassName('square');
	if (pathwayzGame.gameManager.isAITurn()) {
		for(let i = 0; i < squares.length; i++) {
				let square = squares[i];
				square.onclick = function() {
				}
		}
		pathwayzGame.gameManager.AITurn();
	} else {
		for(let i = 0; i < squares.length; i++) {
				let square = squares[i];
				square.onclick = function() {
					pathwayzGame.gameManager.humanMove (square.getAttribute('sqid'));
				}
		}
	}
}
