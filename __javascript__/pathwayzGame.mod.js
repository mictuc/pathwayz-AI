	(function () {
		var random = {};
		__nest__ (random, '', __init__ (__world__.random));
		var monteCarloSearch = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			var moves = list ([]);
			var __iterable0__ = game.actions (state);
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var move = __iterable0__ [__index0__];
				var __left0__ = game.simulatedMove (state, move);
				var newBoard = __left0__ [0];
				var newPlayer = __left0__ [1];
				var score = evaluationFunction (game, newBoard, player);
				moves.append (tuple ([move, score]));
			}
			var moves = sorted (moves, __kwargtrans__ ({key: (function __lambda__ (scoredMove) {
				return scoredMove [1];
			}), reverse: true}));
			var children = list ([]);
			for (var i = 0; i < 5; i++) {
				if (i >= len (moves)) {
					break;
				}
				children.append (moves [i]);
			}
			var count = 100;
			var childrenScores = list ([]);
			for (var i = 0; i < len (children); i++) {
				var move = children [i];
				var monteScore = 0;
				for (var j = 0; j < count; j++) {
					monteScore += depthCharge (game, state, player);
				}
				var monteScore = float (monteScore) / count;
				childrenScores.append (tuple ([move, monteScore]));
			}
			var childrenScores = sorted (childrenScores, __kwargtrans__ ({key: (function __lambda__ (child) {
				return child [1];
			}), reverse: true}));
			var __left0__ = childrenScores [0];
			var bestMove = __left0__ [0];
			var _ = __left0__ [1];
			print (bestMove);
			return bestMove [0];
		};
		var depthCharge = function (game, state, originalPlayer) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (game.isEnd (state)) {
				if (originalPlayer) {
					return evaluationFunction (game, board, player);
				}
				else {
					return -(evaluationFunction (game, board, player));
				}
			}
			var moves = game.actions (state);
			var rand = random.choice (moves);
			var newState = game.simulatedMove (state, rand);
			return depthCharge (game, newState, !(originalPlayer));
		};
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
				return self.playerWon (board, player) || self.playerWon (board, self.otherPlayer (player)) || self.fullBoard (state);
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
				return self.playerWon (board, player);
			});},
			get utility () {return __get__ (this, function (self, state) {
				var __left0__ = state;
				var board = __left0__ [0];
				var player = __left0__ [1];
				if (self.isWinner (state, player)) {
					return 1000000.0;
				}
				else if (self.isWinner (state, self.otherPlayer (player))) {
					return -(1000000.0);
				}
				else {
					return 0;
				}
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
			get playerWon () {return __get__ (this, function (self, board, player) {
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
				var j = 0;
				for (var i = 0; i < 8; i++) {
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
						return true;
					}
				}
				return longestPath == 11;
			});},
			get simulatedMove () {return __get__ (this, function (self, state, action) {
				var __left0__ = state;
				var board = __left0__ [0];
				var player = __left0__ [1];
				var tempBoard = function () {
					var __accu0__ = [];
					var __iterable0__ = board;
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var row = __iterable0__ [__index0__];
						__accu0__.append (row.__getslice__ (0, null, 1));
					}
					return __accu0__;
				} ();
				return self.succ (tuple ([tempBoard, player]), action);
			});},
			get countPieces () {return __get__ (this, function (self, board, player) {
				var myNumPermanents = 0;
				var yourNumPermanents = 0;
				var myNum1EmptyNeighbor = 0;
				var yourNum1EmptyNeighbor = 0;
				var myNum2EmptyNeighbor = 0;
				var yourNum2EmptyNeighbor = 0;
				var myNumPieces = 0;
				var yourNumPieces = 0;
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
					if (board [i] [j] == player.upper ()) {
						myNumPermanents++;
						myNumPieces++;
					}
					else if (board [i] [j] == self.otherPlayer (player).upper ()) {
						yourNumPermanents++;
						yourNumPieces++;
					}
					else if (board [i] [j] == player) {
						myNumPieces++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							myNumPermanents++;
						}
						else if (numEmptyNeighbors == 1) {
							myNum1EmptyNeighbor++;
						}
						else if (numEmptyNeighbors == 2) {
							myNum2EmptyNeighbor++;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player)) {
						yourNumPieces++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							yourNumPermanents++;
						}
						else if (numEmptyNeighbors == 1) {
							yourNum1EmptyNeighbor++;
						}
						else if (numEmptyNeighbors == 2) {
							yourNum2EmptyNeighbor++;
						}
					}
				}
				return tuple ([myNumPermanents, yourNumPermanents, myNum1EmptyNeighbor, yourNum1EmptyNeighbor, myNum2EmptyNeighbor, yourNum2EmptyNeighbor, myNumPieces - yourNumPieces]);
			});},
			get getNumEmptyNeighbors () {return __get__ (this, function (self, row, col, board) {
				var neighbors = self.surroundingPlaces (row, col);
				var numEmptyNeighbors = 0;
				var __iterable0__ = neighbors;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var neighbor = __iterable0__ [__index0__];
					var __left0__ = neighbor;
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j] == '-') {
						numEmptyNeighbors++;
					}
				}
				return numEmptyNeighbors;
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
			var actions = game.actions (state);
			var __iterable0__ = actions;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				var newState = game.simulatedMove (state, action);
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
			var _ = __left0__ [0];
			var player = __left0__ [1];
			var bestScore = 0;
			var options = list ([]);
			var actions = game.actions (state);
			var __iterable0__ = actions;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				var newState = game.simulatedMove (state, action);
				var __left0__ = newState;
				var newBoard = __left0__ [0];
				var _ = __left0__ [1];
				var newScore = game.longestPath (newBoard, player) - 0.4 * game.longestPath (newBoard, game.otherPlayer (player));
				if (newScore > bestScore) {
					var bestScore = newScore;
					var options = list ([action]);
				}
				else if (newScore == bestScore) {
					options.append (action);
				}
			}
			if (len (options) == 0) {
				return randomMove (game, state);
			}
			return random.choice (options);
		};
		var value = function (game, state, depth, alpha, beta, originalPlayer) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (game.isEnd (state) || depth == 0) {
				if (originalPlayer) {
					return evaluationFunction (game, board, player);
				}
				else {
					return -(evaluationFunction (game, board, player));
				}
			}
			else if (originalPlayer) {
				var highestScore = -(float ('inf'));
				var __iterable0__ = game.actions (state);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					var score = value (game, game.simulatedMove (state, action), depth - 1, alpha, beta, false);
					var highestScore = MAX (list ([highestScore, score]));
					var alpha = MAX (list ([alpha, highestScore]));
					if (beta <= alpha) {
						break;
					}
				}
				return highestScore;
			}
			else {
				var lowestScore = float ('inf');
				var __iterable0__ = game.actions (state);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					var score = value (game, game.simulatedMove (state, action), depth - 1, alpha, beta, true);
					var lowestScore = MIN (list ([lowestScore, score]));
					var beta = MIN (list ([beta, lowestScore]));
					if (beta <= alpha) {
						break;
					}
				}
				return lowestScore;
			}
		};
		var MAX = function (array) {
			var currMax = -(float ('inf'));
			var __iterable0__ = array;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var x = __iterable0__ [__index0__];
				if (x > currMax) {
					var currMax = x;
				}
			}
			return currMax;
		};
		var MIN = function (array) {
			var currMin = float ('inf');
			var __iterable0__ = array;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var x = __iterable0__ [__index0__];
				if (x < currMin) {
					var currMin = x;
				}
			}
			return currMin;
		};
		var minimax = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			var tempBoard = function () {
				var __accu0__ = [];
				var __iterable0__ = board;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var row = __iterable0__ [__index0__];
					__accu0__.append (row.__getslice__ (0, null, 1));
				}
				return __accu0__;
			} ();
			var legalMoves = game.actions (state);
			var scores = function () {
				var __accu0__ = [];
				var __iterable0__ = legalMoves;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					__accu0__.append (value (game, game.simulatedMove (tuple ([tempBoard, player]), action), 1, -(float ('inf')), float ('inf'), false));
				}
				return __accu0__;
			} ();
			var bestScore = MAX (scores);
			var bestIndices = function () {
				var __accu0__ = [];
				for (var index = 0; index < len (scores); index++) {
					if (scores [index] == bestScore) {
						__accu0__.append (index);
					}
				}
				return __accu0__;
			} ();
			var chosenIndex = random.choice (bestIndices);
			return legalMoves [chosenIndex];
		};
		var advancedMinimax = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			var tempBoard = function () {
				var __accu0__ = [];
				var __iterable0__ = board;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var row = __iterable0__ [__index0__];
					__accu0__.append (row.__getslice__ (0, null, 1));
				}
				return __accu0__;
			} ();
			var legalMoves = game.actions (state);
			var piecesPlayed = 96 - 0.5 * len (legalMoves);
			var depth = int (piecesPlayed / 30);
			print (depth);
			var scores = function () {
				var __accu0__ = [];
				var __iterable0__ = legalMoves;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					__accu0__.append (value (game, game.simulatedMove (tuple ([tempBoard, player]), action), depth, -(float ('inf')), float ('inf'), false));
				}
				return __accu0__;
			} ();
			var bestScore = MAX (scores);
			var bestIndices = function () {
				var __accu0__ = [];
				for (var index = 0; index < len (scores); index++) {
					if (scores [index] == bestScore) {
						__accu0__.append (index);
					}
				}
				return __accu0__;
			} ();
			var chosenIndex = random.choice (bestIndices);
			return legalMoves [chosenIndex];
		};
		var shuffle = function (array) {
			var currentIndex = len (array);
			while (0 != currentIndex) {
				var randomIndex = int (random.random () * currentIndex);
				currentIndex--;
				var tempValue = array [currentIndex];
				array [currentIndex] = array [randomIndex];
				array [randomIndex] = tempValue;
			}
			return array;
		};
		var oneMoveAway = function (game, board, player) {
			var actions = game.actions (tuple ([board, player]));
			var winningActions = list ([]);
			var __iterable0__ = actions;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				if (game.isWinner (game.simulatedMove (tuple ([board, player]), action), player)) {
					return true;
				}
			}
			return false;
		};
		var beamScores = function (game, state, depth, beamWidth) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (game.isEnd (state) || depth == 0) {
				return list ([tuple ([evaluationFunction (game, board, player), null, state])]);
			}
			var actions = shuffle (game.actions (state));
			var numTopScores = beamWidth [depth - 1];
			if (numTopScores == null) {
				var numTopScores = len (actions);
			}
			var topScores = function () {
				var __accu0__ = [];
				for (var i = 0; i < numTopScores; i++) {
					__accu0__.append (tuple ([-(float ('inf')), null, null]));
				}
				return __accu0__;
			} ();
			var newStates = list ([]);
			var __iterable0__ = actions;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				var __left0__ = game.simulatedMove (state, action);
				var newBoard = __left0__ [0];
				var newPlayer = __left0__ [1];
				var newScore = evaluationFunction (game, newBoard, player);
				var minScore = sorted (topScores, __kwargtrans__ ({key: (function __lambda__ (score) {
					return score [0];
				})})) [0];
				if (newScore > minScore [0]) {
					topScores.remove (minScore);
					topScores.append (tuple ([newScore, action, tuple ([newBoard, newPlayer])]));
				}
			}
			var newTopScores = list ([]);
			var __iterable0__ = topScores;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var __left0__ = __iterable0__ [__index0__];
				var score = __left0__ [0];
				var action = __left0__ [1];
				var newState = __left0__ [2];
				var __left0__ = sorted (beamScores (game, newState, depth - 1, beamWidth), __kwargtrans__ ({key: (function __lambda__ (score) {
					return score [0];
				}), reverse: true})) [0];
				var _ = __left0__ [0];
				var _ = __left0__ [1];
				var lastState = __left0__ [2];
				newTopScores.append (tuple ([evaluationFunction (game, lastState [0], player), action, lastState]));
			}
			return newTopScores;
		};
		var beamMinimax = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (oneMoveAway (game, board, game.otherPlayer (player))) {
				var depth = 2;
				var beamWidth = list ([null, null]);
			}
			else {
				var depth = 3;
				var beamWidth = list ([1, 5, 15]);
			}
			var scores = beamScores (game, state, depth, beamWidth);
			var __left0__ = sorted (scores, __kwargtrans__ ({key: (function __lambda__ (score) {
				return score [0];
			}), reverse: true})) [0];
			var _ = __left0__ [0];
			var bestMove = __left0__ [1];
			var _ = __left0__ [2];
			return bestMove;
		};
		var AVG = function (scores) {
			var scores = sorted (scores);
			var weightedTotal = 0;
			for (var i = 0; i < len (scores); i++) {
				weightedTotal += scores [i] / (2 ^ i + 1);
			}
			return weightedTotal;
		};
		var valueExpectimax = function (game, state, depth, originalPlayer) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (game.isEnd (state) || depth == 0) {
				if (originalPlayer) {
					return evaluationFunction (game, board, player);
				}
				else {
					return -(evaluationFunction (game, board, player));
				}
			}
			else if (originalPlayer) {
				var highestScore = -(float ('inf'));
				var __iterable0__ = game.actions (state);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					var score = value (game, game.simulatedMove (state, action), depth - 1, false);
					var highestScore = MAX (list ([highestScore, score]));
				}
				return highestScore;
			}
			else {
				var scores = list ([]);
				var __iterable0__ = game.actions (state);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					var score = value (game, game.simulatedMove (state, action), depth - 1, true);
					scores.append (score);
				}
				var expectedScore = AVG (scores);
				return expectedScore;
			}
		};
		var advancedExpectimax = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (oneMoveAway (game, board, game.otherPlayer (player))) {
				return beamMinimax (game, state);
			}
			var tempBoard = function () {
				var __accu0__ = [];
				var __iterable0__ = board;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var row = __iterable0__ [__index0__];
					__accu0__.append (row.__getslice__ (0, null, 1));
				}
				return __accu0__;
			} ();
			var legalMoves = game.actions (state);
			var piecesPlayed = 96 - 0.5 * len (legalMoves);
			var depth = int (piecesPlayed / 20);
			var scores = function () {
				var __accu0__ = [];
				var __iterable0__ = legalMoves;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					__accu0__.append (value (game, game.simulatedMove (tuple ([tempBoard, player]), action), depth, false));
				}
				return __accu0__;
			} ();
			var bestScore = MAX (scores);
			var bestIndices = function () {
				var __accu0__ = [];
				for (var index = 0; index < len (scores); index++) {
					if (scores [index] == bestScore) {
						__accu0__.append (index);
					}
				}
				return __accu0__;
			} ();
			var chosenIndex = random.choice (bestIndices);
			return legalMoves [chosenIndex];
		};
		var featureExtractor = function (game, board, player) {
			var myLongestPath = game.longestPath (board, player);
			var yourLongestPath = game.longestPath (board, game.otherPlayer (player));
			var __left0__ = game.countPieces (board, player);
			var myNumPermanents = __left0__ [0];
			var yourNumPermanents = __left0__ [1];
			var myNum1EmptyNeighbor = __left0__ [2];
			var yourNum1EmptyNeighbor = __left0__ [3];
			var myNum2EmptyNeighbor = __left0__ [4];
			var yourNum2EmptyNeighbor = __left0__ [5];
			var differenceNumPieces = __left0__ [6];
			return list ([myLongestPath, yourLongestPath, myNumPermanents, yourNumPermanents, myNum1EmptyNeighbor, yourNum1EmptyNeighbor, myNum2EmptyNeighbor, yourNum2EmptyNeighbor, differenceNumPieces]);
		};
		var evaluationFunction = function (game, board, player) {
			var features = featureExtractor (game, board, player);
			var weights = list ([20, -(8), 3, -(6), -(0.5), 0.5, 0.5, -(0.5), 2]);
			var results = function () {
				var __accu0__ = [];
				var __iterable0__ = zip (features, weights);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					__accu0__.append (i * j);
				}
				return __accu0__;
			} ();
			if (game.isEnd (tuple ([board, player]))) {
				return game.utility (tuple ([board, player])) + sum (results);
			}
			return sum (results);
		};
		var GameManager = __class__ ('GameManager', [object], {
			get __init__ () {return __get__ (this, function (self) {
				self.game = PathwayzGame ();
				self.state = game.startState ();
				self.policies = dict ({'Human': null, 'PAI Random': randomMove, 'PAI Baseline': baselineMove, 'PAI Advanced Baseline': advancedBaselineMove, 'PAI Minimax': advancedMinimax, 'PAI Beam Minimax': beamMinimax, 'PAI Expectimax': advancedExpectimax, 'PAI MCS': monteCarloSearch});
				self.displayBoard ();
				self.isAI = dict ({'w': false, 'b': false});
			});},
			get setPlayers () {return __get__ (this, function (self) {
				var player1Policy = document.getElementById ('player1').value;
				var player1Name = document.getElementById ('player1name').value;
				var player2Policy = document.getElementById ('player2').value;
				var player2Name = document.getElementById ('player2name').value;
				self.playerNames = dict ({'w': player1Name, 'b': player2Name});
				self.isAI = dict ({'w': player1Policy != 'Human', 'b': player2Policy != 'Human'});
				self.policy = dict ({'w': self.policies [player1Policy], 'b': self.policies [player2Policy]});
			});},
			get isAITurn () {return __get__ (this, function (self) {
				return self.isAI [self.game.player (self.state)];
			});},
			get AITurn () {return __get__ (this, function (self) {
				if (!(self.isAITurn ()) || self.game.isEnd (self.state)) {
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
			});},
			get humanMove () {return __get__ (this, function (self, sqNo) {
				if (self.game.isEnd (self.state)) {
					print ('Game is over.');
					return ;
				}
				if (self.isAITurn ()) {
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
				document.getElementById ('modalInformation').innerHTML = '<h2>Player 1</h2><br><select class="soflow" id="player1"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Minimax</option></select><input type="text" style="display: inline;" id="player1name" value="Player 1"><br><h2>Player 2</h2><br><select class="soflow" id="player2"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Minimax</option><option>PAI Beam Minimax</option></select><input type="text" style="display: inline;" id="player2name" value="Player 2"><br><a href="#" onclick="closeModal(); pathwayzGame.gameManager.setPlayers();">Start Game</a></div>';
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
			__all__.AVG = AVG;
			__all__.GameManager = GameManager;
			__all__.MAX = MAX;
			__all__.MIN = MIN;
			__all__.PathwayzGame = PathwayzGame;
			__all__.advancedBaselineMove = advancedBaselineMove;
			__all__.advancedExpectimax = advancedExpectimax;
			__all__.advancedMinimax = advancedMinimax;
			__all__.baselineMove = baselineMove;
			__all__.beamMinimax = beamMinimax;
			__all__.beamScores = beamScores;
			__all__.depthCharge = depthCharge;
			__all__.evaluationFunction = evaluationFunction;
			__all__.featureExtractor = featureExtractor;
			__all__.game = game;
			__all__.gameManager = gameManager;
			__all__.minimax = minimax;
			__all__.monteCarloSearch = monteCarloSearch;
			__all__.oneMoveAway = oneMoveAway;
			__all__.randomMove = randomMove;
			__all__.shuffle = shuffle;
			__all__.value = value;
			__all__.valueExpectimax = valueExpectimax;
		__pragma__ ('</all>')
	}) ();
