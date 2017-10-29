	(function () {
		var random = {};
		__nest__ (random, '', __init__ (__world__.random));
		var PathwayzGame = __class__ ('PathwayzGame', [object], {
			get __init__ () {return __get__ (this, function (self) {
				// pass;
			});},
			get startState () {return __get__ (this, function (self) {
				var board = function () {
					var __accu0__ = [];
					for (var j = 0; j < 8; j++) {
						__accu0__.append (function () {
							var __accu1__ = [];
							for (var i = 0; i < 12; i++) {
								__accu1__.append ('-');
							}
							return __accu1__;
						} ());
					}
					return __accu0__;
				} ();
				var startingPlayer = 'w';
				return tuple ([board, startingPlayer]);
			});},
			get isEnd () {return __get__ (this, function (self, state) {
				var __left0__ = state;
				var board = __left0__ [0];
				var player = __left0__ [1];
				return self.longestPath (board, player) == 12 || self.longestPath (board, self.otherPlayer (player)) == 12 || self.fullBoard (state);
			});},
			get fullBoard () {return __get__ (this, function (self, state) {
				var __left0__ = state;
				var board = __left0__ [0];
				var player = __left0__ [1];
				for (var i = 0; i < 8; i++) {
					for (var j = 0; j < 12; j++) {
						if (board [i] [j] == '-') {
							return false;
						}
					}
				}
				return true;
			});},
			get isWinner () {return __get__ (this, function (self, state, player) {
				var __left0__ = state;
				var board = __left0__ [0];
				var _ = __left0__ [1];
				return self.longestPath (board, player) == 12;
			});},
			get utility () {return __get__ (this, function (self, state) {
				var __left0__ = state;
				var board = __left0__ [0];
				var player = __left0__ [1];
			});},
			get actions () {return __get__ (this, function (self, state) {
				var __left0__ = state;
				var board = __left0__ [0];
				var player = __left0__ [1];
				var actions = list ([]);
				var __iterable0__ = function () {
					var __accu0__ = [];
					for (var j = 0; j < 12; j++) {
						for (var i = 0; i < 8; i++) {
							__accu0__.append (tuple ([i, j]));
						}
					}
					return __accu0__;
				} ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (self.emptyPlace (state, i, j)) {
						actions.append (tuple ([i, j, true]));
						actions.append (tuple ([i, j, false]));
					}
				}
				return actions;
			});},
			get player () {return __get__ (this, function (self, state) {
				var __left0__ = state;
				var _ = __left0__ [0];
				var player = __left0__ [1];
				return player;
			});},
			get succ () {return __get__ (this, function (self, state, action) {
				var __left0__ = state;
				var board = __left0__ [0];
				var player = __left0__ [1];
				var __left0__ = action;
				var row = __left0__ [0];
				var col = __left0__ [1];
				var permanent = __left0__ [2];
				if (!(row < 8 && row >= 0 && col < 12 && col >= 0)) {
					var __except0__ = Exception ('Row, column out of bounds.');
					__except0__.__cause__ = null;
					throw __except0__;
				}
				else if (!(self.emptyPlace (state, row, col))) {
					var __except0__ = Exception ('Position is already played.');
					__except0__.__cause__ = null;
					throw __except0__;
				}
				else if (permanent) {
					board [row] [col] = self.otherPlayer (player).upper ();
					self.flipPieces (board, row, col);
					return tuple ([board, self.otherPlayer (player)]);
				}
				else {
					board [row] [col] = player;
					return tuple ([board, self.otherPlayer (player)]);
				}
			});},
			get emptyPlace () {return __get__ (this, function (self, state, row, col) {
				var __left0__ = state;
				var board = __left0__ [0];
				var _ = __left0__ [1];
				return board [row] [col] == '-';
			});},
			get otherPlayer () {return __get__ (this, function (self, player) {
				if (player == 'w') {
					return 'b';
				}
				else if (player == 'b') {
					return 'w';
				}
				else {
					var __except0__ = Exception ('Not valid player');
					__except0__.__cause__ = null;
					throw __except0__;
				}
			});},
			get flipPieces () {return __get__ (this, function (self, board, row, col) {
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j] == 'b' || board [i] [j] == 'w') {
						board [i] [j] = self.otherPlayer (board [i] [j]);
					}
				}
			});},
			get surroundingPlaces () {return __get__ (this, function (self, row, col) {
				var rows = function () {
					var __accu0__ = [];
					for (var i = row - 1; i < row + 2; i++) {
						if (i >= 0 && i < 8) {
							__accu0__.append (i);
						}
					}
					return __accu0__;
				} ();
				var cols = function () {
					var __accu0__ = [];
					for (var j = col - 1; j < col + 2; j++) {
						if (j >= 0 && j < 12) {
							__accu0__.append (j);
						}
					}
					return __accu0__;
				} ();
				return function () {
					var __accu0__ = [];
					var __iterable0__ = rows;
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var i = __iterable0__ [__index0__];
						var __iterable1__ = cols;
						for (var __index1__ = 0; __index1__ < __iterable1__.length; __index1__++) {
							var j = __iterable1__ [__index1__];
							__accu0__.append (tuple ([i, j]));
						}
					}
					return __accu0__;
				} ();
			});},
			get findPathLength () {return __get__ (this, function (self, board, player, row, col, test) {
				var farthestCol = -(1);
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					test++;
					if (board [i] [j].lower () == player) {
						if (j > farthestCol) {
							var farthestCol = j;
						}
						if (j == 11) {
							return 11;
						}
						else if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var maxCol = self.findPathLength (board, player, i, j, test);
							if (maxCol > farthestCol) {
								var farthestCol = maxCol;
							}
						}
					}
				}
				return farthestCol;
			});},
			get longestPath () {return __get__ (this, function (self, board, player) {
				self.alreadyChecked = function () {
					var __accu0__ = [];
					for (var j = 0; j < 8; j++) {
						__accu0__.append (function () {
							var __accu1__ = [];
							for (var i = 0; i < 12; i++) {
								__accu1__.append (false);
							}
							return __accu1__;
						} ());
					}
					return __accu0__;
				} ();
				var longestPath = -(1);
				var test = 0;
				var __iterable0__ = function () {
					var __accu0__ = [];
					for (var j = 0; j < 12; j++) {
						for (var i = 0; i < 8; i++) {
							__accu0__.append (tuple ([i, j]));
						}
					}
					return __accu0__;
				} ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j].lower () == player) {
						if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var newPath = self.findPathLength (board, player, i, j, test) - j;
							if (newPath > longestPath) {
								var longestPath = newPath;
							}
						}
					}
					if (longestPath == 11) {
						return 12;
					}
				}
				return longestPath + 1;
			});},
			get simulatedMove () {return __get__ (this, function (self, board, permanent, row, col, player) {
				var tempBoard = function () {
					var __accu0__ = [];
					var __iterable0__ = board;
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var row = __iterable0__ [__index0__];
						__accu0__.append (row.__getslice__ (0, null, 1));
					}
					return __accu0__;
				} ();
				self.succ (tuple ([tempBoard, player]), tuple ([row, col, permanent]));
				return self.longestPath (tempBoard, player);
			});},
			get simulatedAdvancedMove () {return __get__ (this, function (self, board, permanent, row, col, player) {
				var tempBoard = function () {
					var __accu0__ = [];
					var __iterable0__ = board;
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var row = __iterable0__ [__index0__];
						__accu0__.append (row.__getslice__ (0, null, 1));
					}
					return __accu0__;
				} ();
				self.succ (tuple ([tempBoard, player]), tuple ([row, col, permanent]));
				return self.longestPath (tempBoard, player) - 0.4 * self.longestPath (tempBoard, self.otherPlayer (player));
			});}
		});
		var game = PathwayzGame ();
		var randomMove = function (game, state) {
			return random.choice (game.actions (state));
		};
		var baselineMove = function (game, state) {
			var __left0__ = state;
			var _ = __left0__ [0];
			var player = __left0__ [1];
			var bestPath = 0;
			var options = list ([]);
			var __iterable0__ = game.actions (state);
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				var newState = game.succ (state, action);
				var __left0__ = newState;
				var newBoard = __left0__ [0];
				var _ = __left0__ [1];
				var newPathLength = game.longestPath (newBoard, player);
				if (newPathLength > bestPath) {
					var bestPath = newPathLength;
					var options = list ([action]);
				}
				else if (newPathLength == bestPath) {
					options.append (action);
				}
			}
			if (len (options) == 0) {
				return randomMove (game, state);
			}
			return random.choice (options);
		};
		var advancedBaselineMove = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			var bestPath = 0;
			var options = list ([]);
			var __iterable0__ = function () {
				var __accu0__ = [];
				for (var i = 0; i < 8; i++) {
					for (var j = 0; j < 12; j++) {
						__accu0__.append (tuple ([i, j]));
					}
				}
				return __accu0__;
			} ();
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var __left0__ = __iterable0__ [__index0__];
				var i = __left0__ [0];
				var j = __left0__ [1];
				if (game.emptyPlace (state, i, j)) {
					var newPath = game.simulatedAdvancedMove (board, false, i, j, player);
					if (newPath > bestPath) {
						var bestPath = newPath;
						var options = list ([tuple ([i, j, false])]);
					}
					else if (newPath == bestPath) {
						options.append (tuple ([i, j, false]));
					}
					var newPath = game.simulatedAdvancedMove (board, true, i, j, player);
					if (newPath > bestPath) {
						var bestPath = newPath;
						var options = list ([tuple ([i, j, true])]);
					}
					else if (newPath == bestPath) {
						options.append (tuple ([i, j, true]));
					}
				}
			}
			if (len (options) == 0) {
				return randomMove (game, state);
			}
			return random.choice (options);
		};
		var GameManager = __class__ ('GameManager', [object], {
			get __init__ () {return __get__ (this, function (self) {
				self.game = PathwayzGame ();
				self.state = game.startState ();
				self.policies = dict ({'Human': null, 'PAI Random': randomMove, 'PAI Baseline': baselineMove, 'PAI Advanced Baseline': advancedBaselineMove});
				self.displayBoard ();
			});},
			get setPlayers () {return __get__ (this, function (self) {
				var player1Policy = document.getElementById ('player1').value;
				var player1Name = document.getElementById ('player1name').value;
				var player2Policy = document.getElementById ('player2').value;
				var player2Name = document.getElementById ('player2name').value;
				self.playerNames = dict ({'w': player1Name, 'b': player2Name});
				self.isAI = dict ({'w': player1Policy != 'Human', 'b': player2Policy != 'Human'});
				self.policy = dict ({'w': self.policies [player1Policy], 'b': self.policies [player2Policy]});
				if (self.isAI [self.game.player (self.state)]) {
					self.AITurn ();
				}
			});},
			get AITurn () {return __get__ (this, function (self) {
				if (self.game.isEnd (self.state)) {
					return ;
				}
				var player = self.game.player (self.state);
				var policy = self.policy [player];
				var action = policy (self.game, self.state);
				self.state = game.succ (self.state, action);
				self.displayBoard (self.coordinatesToSqNo (action));
				if (self.game.isEnd (self.state)) {
					if (self.game.isWinner (self.state, player)) {
						self.displayWinner (player);
					}
					else if (self.game.isWinner (self.state, self.game.otherPlayer (player))) {
						self.displayWinner (self.game.otherPlayer (player));
					}
					else {
						self.displayDraw ();
					}
				}
				else if (self.isAI [self.game.player (self.state)]) {
					self.AITurn ();
				}
			});},
			get humanMove () {return __get__ (this, function (self, sqNo) {
				if (self.game.isEnd (self.state)) {
					print ('Game is over.');
					return ;
				}
				if (self.isAI [self.game.player (self.state)]) {
					print ('Wait your turn.');
					return ;
				}
				var __left0__ = self.sqNoToCoordinates (sqNo);
				var row = __left0__ [0];
				var col = __left0__ [1];
				if (!(self.game.emptyPlace (self.state, row, col))) {
					print ('Place is already taken.');
					return ;
				}
				var player = self.game.player (self.state);
				var permanent = document.getElementById ('switch_perm').checked;
				self.state = game.succ (self.state, tuple ([row, col, permanent]));
				self.displayBoard (sqNo);
				if (self.game.isEnd (self.state)) {
					if (self.game.isWinner (self.state, player)) {
						self.displayWinner (player);
					}
					else if (self.game.isWinner (self.state, self.game.otherPlayer (player))) {
						self.displayWinner (self.game.otherPlayer (player));
					}
					else {
						self.displayDraw ();
					}
				}
				else if (self.isAI [self.game.player (self.state)]) {
					self.AITurn ();
				}
			});},
			get coordinatesToSqNo () {return __get__ (this, function (self, action) {
				var __left0__ = action;
				var row = __left0__ [0];
				var col = __left0__ [1];
				var _ = __left0__ [2];
				return 12 * row + col;
			});},
			get sqNoToCoordinates () {return __get__ (this, function (self, sqNo) {
				var row = int (sqNo / 12);
				var col = __mod__ (sqNo, 12);
				return tuple ([row, col]);
			});},
			get displayBoard () {return __get__ (this, function (self, fadeIn) {
				if (typeof fadeIn == 'undefined' || (fadeIn != null && fadeIn .hasOwnProperty ("__kwargtrans__"))) {;
					var fadeIn = -(1);
				};
				var __left0__ = self.state;
				var board = __left0__ [0];
				var _ = __left0__ [1];
				var squares = document.getElementsByClassName ('square');
				var __iterable0__ = squares;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var square = __iterable0__ [__index0__];
					self.refreshSquare (square, board, fadeIn == square.getAttribute ('sqid'));
				}
			});},
			get refreshSquare () {return __get__ (this, function (self, square, board, fadeIn) {
				var sqNo = square.getAttribute ('sqid');
				var __left0__ = self.sqNoToCoordinates (sqNo);
				var row = __left0__ [0];
				var col = __left0__ [1];
				var pieceType = board [row] [col];
				while (square.firstChild) {
					square.removeChild (square.firstChild);
				}
				if (pieceType == '-') {
					return ;
				}
				var piece = document.createElement ('div');
				square.appendChild (piece);
				var dot = document.createElement ('div');
				if (pieceType == 'W' || pieceType == 'B') {
					dot.classList.add ('cdot');
					piece.appendChild (dot);
				}
				if (pieceType == 'w' || pieceType == 'W') {
					piece.classList.add ('whitepiece');
				}
				else if (pieceType == 'b' || pieceType == 'B') {
					piece.classList.add ('blackpiece');
				}
				if (fadeIn) {
					piece.classList.add ('animated');
					piece.classList.add ('justPlayed');
					piece.classList.add ('fadeIn');
				}
			});},
			get resetGame () {return __get__ (this, function (self) {
				self.game = PathwayzGame ();
				self.state = game.startState ();
				self.displayBoard ();
				self.displayStartMenu ();
			});},
			get showModal () {return __get__ (this, function (self) {
				document.getElementById ('modal').style.visibility = 'visible';
				document.getElementById ('modal').style.opacity = '1';
				document.getElementById ('modal').style.top = '50%';
			});},
			get displayStartMenu () {return __get__ (this, function (self) {
				self.setStartMenuText ();
				self.showModal ();
			});},
			get setStartMenuText () {return __get__ (this, function (self) {
				document.getElementById ('modaltitle').innerHTML = 'Setup Game';
				document.getElementById ('modalInformation').innerHTML = '<h2>Player 1</h2><br><select class="soflow" id="player1"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option></select><input type="text" style="display: inline;" id="player1name" value="Player 1"><br><h2>Player 2</h2><br><select class="soflow" id="player2"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option></select><input type="text" style="display: inline;" id="player2name" value="Player 2"><br><a href="#" onclick="closeModal(); pathwayzGame.gameManager.setPlayers();">Start Game</a></div>';
			});},
			get displayWinner () {return __get__ (this, function (self, player) {
				self.setWinText (player);
				self.showModal ();
			});},
			get setWinText () {return __get__ (this, function (self, player) {
				document.getElementById ('modaltitle').innerHTML = 'Game Over!';
				document.getElementById ('modalInformation').innerHTML = '<p>{} wins!!</p><a href="#" onclick="closeModal();">Close</a></div>'.format (self.playerNames [player]);
			});},
			get displayDraw () {return __get__ (this, function (self) {
				self.setDrawText ();
				self.showModal ();
			});},
			get setDrawText () {return __get__ (this, function (self) {
				document.getElementById ('modaltitle').innerHTML = 'Game Over!';
				document.getElementById ('modalInformation').innerHTML = '<p>Draw! No one wins!</p><a href="#" onclick="closeModal();">Close</a></div>';
			});}
		});
		var gameManager = GameManager ();
		__pragma__ ('<use>' +
			'random' +
		'</use>')
		__pragma__ ('<all>')
			__all__.GameManager = GameManager;
			__all__.PathwayzGame = PathwayzGame;
			__all__.advancedBaselineMove = advancedBaselineMove;
			__all__.baselineMove = baselineMove;
			__all__.game = game;
			__all__.gameManager = gameManager;
			__all__.randomMove = randomMove;
		__pragma__ ('</all>')
	}) ();
