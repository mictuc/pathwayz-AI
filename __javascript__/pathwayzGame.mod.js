	(function () {
		var math = {};
		var random = {};
		__nest__ (random, '', __init__ (__world__.random));
		__nest__ (math, '', __init__ (__world__.math));
		var Node = __class__ ('Node', [object], {
			get __init__ () {return __get__ (this, function (self, curState, children, utility, visits, parent, action) {
				self.action = action;
				self.state = curState;
				self.children = children;
				self.utility = utility;
				self.visits = visits;
				self.parent = parent;
			});}
		});
		var select = function (node) {
			if (node.visits == 0 || len (node.children) == 0) {
				return node;
			}
			for (var i = 0; i < len (node.children); i++) {
				if (node.children [i].visits == 0) {
					return node.children [i];
				}
			}
			var result = random.choice (node.children);
			var score = selectfn (result);
			for (var i = 0; i < len (node.children); i++) {
				var newNode = node.children [i];
				if (newNode != result) {
					var newScore = selectfn (newNode);
					if (newScore > score) {
						var score = newScore;
						var result = newNode;
					}
				}
			}
			return select (result);
		};
		var expand = function (game, node) {
			var state = node.state;
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			var sortedChildren = list ([]);
			var __iterable0__ = game.actions (state);
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var move = __iterable0__ [__index0__];
				var newState = game.simulatedMove (state, move);
				var __left0__ = newState;
				var newBoard = __left0__ [0];
				var newPlayer = __left0__ [1];
				var newNode = Node (newState, list ([]), evaluationFunction (game, newBoard, player), 0, node, move);
				sortedChildren.append (newNode);
			}
			var sortedChildren = sorted (sortedChildren, __kwargtrans__ ({key: (function __lambda__ (score) {
				return score.utility;
			}), reverse: true}));
			node.children = sortedChildren.__getslice__ (0, 10, 1);
			return node;
		};
		var selectfn = function (node) {
			return node.utility / node.visits + math.sqrt ((2 * math.log (node.parent.visits)) / node.visits);
		};
		var backpropagate = function (node, score) {
			node.visits++;
			node.utility = node.utility + score;
			if (node.parent) {
				backpropagate (node.parent, score);
			}
		};
		var MCTSdepthCharge = function (game, node, originalPlayer) {
			var state = node.state;
			if (game.isEnd (state)) {
				if (game.isWinner (state, state [1])) {
					if (originalPlayer) {
						backpropagate (node, 1);
						return ;
					}
					else {
						backpropagate (node, 0);
						return ;
					}
				}
				else if (game.isWinner (state, game.otherPlayer (state [1]))) {
					if (originalPlayer) {
						backpropagate (node, 0);
						return ;
					}
					else {
						backpropagate (node, 1);
						return ;
					}
				}
			}
			var moves = game.actions (state);
			var rand = random.choice (moves);
			var newState = game.simulatedMove (state, rand);
			var __iterable0__ = node.children;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var child = __iterable0__ [__index0__];
				if (child.state == newState) {
					MCTSdepthCharge (game, child, !(originalPlayer));
					return ;
				}
			}
			var newNode = Node (newState, list ([]), 0.0, 0.0, node, rand);
			node.children.append (newNode);
			MCTSdepthCharge (game, newNode, !(originalPlayer));
		};
		var monteCarloTreeSearch = function (game, state) {
			var rootNode = Node (state, list ([]), 0.0, 0.0, null, null);
			var count = 200000;
			var node = rootNode;
			var __iterable0__ = game.actions (state);
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				if (game.isWinner (game.simulatedMove (state, action), state [1])) {
					return action;
				}
			}
			for (var i = 0; i < count; i++) {
				var node = select (node);
				var node = expand (game, node);
				var __iterable0__ = node.children;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var child = __iterable0__ [__index0__];
					MCTSdepthCharge (game, child, false);
				}
			}
			var move = sorted (rootNode.children, __kwargtrans__ ({key: (function __lambda__ (c) {
				return c.utility / c.visits;
			}), reverse: true})) [0].action;
			return move;
		};
		var monteCarloSearch = function (game, state) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			var scoredMoves = list ([]);
			var moves = shuffle (game.actions (state));
			var __iterable0__ = moves;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var move = __iterable0__ [__index0__];
				var __left0__ = game.simulatedMove (state, move);
				var newBoard = __left0__ [0];
				var newPlayer = __left0__ [1];
				var score = evaluationFunction (game, newBoard, player);
				scoredMoves.append (tuple ([move, score]));
			}
			var scoredMoves = sorted (scoredMoves, __kwargtrans__ ({key: (function __lambda__ (scoredMove) {
				return scoredMove [1];
			}), reverse: true}));
			var children = scoredMoves.__getslice__ (0, 5, 1);
			var count = 100;
			var childrenScores = list ([]);
			for (var i = 0; i < len (children); i++) {
				var move = children [i];
				var monteScore = 0;
				var newState = game.simulatedMove (state, move [0]);
				for (var j = 0; j < count; j++) {
					monteScore += depthCharge (game, newState, false);
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
					return -(evaluationFunction (game, board, game.otherPlayer (player)));
				}
			}
			var moves = game.actions (state);
			var nextMove = random.choice (moves);
			var newState = game.simulatedMove (state, nextMove);
			return depthCharge (game, newState, !(originalPlayer));
		};
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
		var featuresMove = function (game, state) {
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
				var newScore = evaluationFunction (game, newBoard, player);
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
		var smartFeaturesMove = function (game, state) {
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
				var newScore = smartEvaluationFunction (game, newBoard, player);
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
		var TDLfeaturesMove = function (game, state) {
			var __left0__ = state;
			var _ = __left0__ [0];
			var player = __left0__ [1];
			var bestScore = -(float ('inf'));
			var options = list ([]);
			var actions = game.actions (state);
			var __iterable0__ = actions;
			for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
				var action = __iterable0__ [__index0__];
				var newState = game.simulatedMove (state, action);
				var __left0__ = newState;
				var newBoard = __left0__ [0];
				var _ = __left0__ [1];
				var newScore = TDLevaluationFunction (game, newBoard, player);
				if (newScore > bestScore) {
					var bestScore = newScore;
					var options = list ([action]);
				}
				else if (newScore == bestScore) {
					options.append (action);
				}
			}
			if (len (options) == 0) {
				print ('hello...');
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
		var beamScores = function (game, state, depth, beamWidth, evalFunction) {
			var __left0__ = state;
			var board = __left0__ [0];
			var player = __left0__ [1];
			if (game.isEnd (state) || depth == 0) {
				return list ([tuple ([evalFunction (game, board, player), null, state])]);
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
				var newScore = evalFunction (game, newBoard, player);
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
				var __left0__ = sorted (beamScores (game, newState, depth - 1, beamWidth, evalFunction), __kwargtrans__ ({key: (function __lambda__ (score) {
					return score [0];
				}), reverse: true})) [0];
				var _ = __left0__ [0];
				var _ = __left0__ [1];
				var lastState = __left0__ [2];
				newTopScores.append (tuple ([evalFunction (game, lastState [0], player), action, lastState]));
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
			var scores = beamScores (game, state, depth, beamWidth, evaluationFunction);
			var __left0__ = sorted (scores, __kwargtrans__ ({key: (function __lambda__ (score) {
				return score [0];
			}), reverse: true})) [0];
			var _ = __left0__ [0];
			var bestMove = __left0__ [1];
			var _ = __left0__ [2];
			return bestMove;
		};
		var beamMinimaxMoreFeatures = function (game, state) {
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
			var scores = beamScores (game, state, depth, beamWidth, smartEvaluationFunction);
			var __left0__ = sorted (scores, __kwargtrans__ ({key: (function __lambda__ (score) {
				return score [0];
			}), reverse: true})) [0];
			var _ = __left0__ [0];
			var bestMove = __left0__ [1];
			var _ = __left0__ [2];
			return bestMove;
		};
		var beamMinimaxTDL = function (game, state) {
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
			var scores = beamScores (game, state, depth, beamWidth, TDLevaluationFunction);
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
					return -(evaluationFunction (game, board, game.otherPlayer (player)));
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
					__accu0__.append (valueExpectimax (game, game.simulatedMove (tuple ([tempBoard, player]), action), depth, false));
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
			var weights = list ([20, -(8), 3, -(6), -(0.2), 0.2, 0.1, -(0.1), 1]);
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
		var initSmartFeatureWeights = function () {
			var weights = dict (float);
			weights ['myLongestPath'] = 20;
			weights ['yourLongestPath'] = -(8);
			weights ['myCols'] = 2;
			weights ['yourCols'] = -(2);
			weights ['myPerm'] = 3;
			weights ['yourPerm'] = -(6);
			weights ['myTotal'] = 0.5;
			weights ['yourTotal'] = -(0.5);
			weights ['my1Empty'] = -(0.1);
			weights ['your1Empty'] = 0.1;
			weights ['my2Empty'] = 0.2;
			weights ['your2Empty'] = -(0.2);
			weights ['my3Empty'] = 0;
			weights ['your3Empty'] = 0;
			weights ['my4Empty'] = 0;
			weights ['your4Empty'] = 0;
			weights ['my5Empty'] = 0;
			weights ['your5Empty'] = 0;
			weights ['my6Empty'] = 0;
			weights ['your6Empty'] = 0;
			weights ['my7Empty'] = 0;
			weights ['your7Empty'] = 0;
			weights ['my8Empty'] = 0;
			weights ['your8Empty'] = 0;
			weights ['my1Flip'] = 0;
			weights ['your1Flip'] = 0;
			weights ['my2Flip'] = 0;
			weights ['your2Flip'] = 0;
			weights ['my3Flip'] = 0.01;
			weights ['your3Flip'] = -(0.01);
			weights ['my4Flip'] = 0.01;
			weights ['your4Flip'] = -(0.01);
			weights ['my5Flip'] = 0.01;
			weights ['your5Flip'] = -(0.01);
			weights ['my6Flip'] = 0.01;
			weights ['your6Flip'] = -(0.01);
			weights ['my7Flip'] = 0.01;
			weights ['your7Flip'] = -(0.01);
			weights ['my8Flip'] = 0.01;
			weights ['your8Flip'] = -(0.01);
			return weights;
		};
		var initOpponentWeights = function () {
			var weights = dict ({'your2Flip': 0.7822916666666648, 'myPerm': 6.375000000000007, 'diffPerm': 5.657291666666555, 'my2Flip': -(0.43645833333333245), 'your1Flip': 0.5760416666666688, 'your2Empty': -(0.8906250000000077), 'my8Empty': -(0.047916666666666705), 'your4Flip': -(0.09791666666666667), 'my3Flip': 0.0500000000000001, 'your8Flip': -(0.1), 'your5Empty': 0.220833333333333, 'your8Empty': 0.09479166666666669, 'yourCols': -(4.266666666666366), 'your3Empty': -(0.13125), 'diffLongestPath': 91.69166666666835, 'yourPerm': -(4.282291666666636), 'my8Flip': 0.1, 'my5Empty': -(0.005208333333333049), 'myTotal': 6.836458333333379, 'diffTotal': 9.201041666666528, 'my4Empty': 0.8666666666666678, 'yourLongestPath': -(34.5416666666668), 'my4Flip': 0.09895833333333334, 'your6Flip': -(0.1), 'your1Empty': -(0.03229166666666664), 'your7Empty': 0.06979166666666668, 'my3Empty': 0.596875000000004, 'my1Flip': -(1.504166666666667), 'my6Flip': 0.1, 'myLongestPath': 57.150000000000546, 'myCols': 26.93333333333583, 'your6Empty': 0.055208333333333366, 'your5Flip': -(0.09687500000000002), 'my6Empty': 0.0697916666666667, 'my7Flip': 0.1, 'my7Empty': -(0.05000000000000005), 'your4Empty': -(0.06874999999999995), 'your7Flip': -(0.1), 'my5Flip': 0.1, 'yourTotal': -(2.364583333333319), 'your3Flip': -(0.07708333333333331), 'my1Empty': 0.35937499999999944, 'my2Empty': 1.27187500000002});
			return weights;
		};
		var initSmartOpponentWeights = function () {
			var weights = dict ({'your2Flip': 1.056770833333335, 'myPerm': 6.885937499999994, 'your4Flip': -(0.08072916666666671), 'your6Empty': 0, 'your1Flip': 1.4874999999999974, 'myLongestPermPath': 23.88749999999985, 'my8Empty': 0, 'diffPerm': 4.184374999999997, 'myOneTurnAway': 73.15000000000013, 'onlyTurnAway': 72.65000000000016, 'your5Empty': 0, 'your8Empty': 0, 'your2Empty': -(0.24114583333333348), 'myLongestFuturePath': 35.37083333333433, 'yourCols': 2.4458333333333497, 'blockedMe': -(18.649999999999995), 'your3Empty': 0, 'diffLongestPath': 54.299999999998704, 'yourPathFlex': 0, 'yourPerm': -(2.298437500000008), 'myPathFlex': 0, 'blockedYou': 24.650000000000084, 'my5Empty': 0, 'myTotal': 6.554687500000025, 'diffTotal': 5.864062499999954, 'yourLongestPermPath': -(7.7791666666666455), 'my3Flip': 0.08385416666666674, 'my4Flip': 0.09114583333333334, 'futureAhead': 70.65000000000026, 'your1Empty': 0, 'yourLongestPathSquared': -(32.36319444444533), 'your7Empty': 0, 'my3Empty': 0, 'my1Flip': 0.9515625000000025, 'myLongestPath': 46.73333333333455, 'myCols': 24.09583333333396, 'my2Flip': -(0.18437499999999996), 'my6Empty': 0, 'my2Empty': 0.7708333333333343, 'my7Empty': 0, 'ahead': 105.34999999999832, 'your3Flip': 0.07395833333333346, 'diffLongestFuturePath': 30.291666666666504, 'myLongestFuturePathSquared': 37.923958333334184, 'my4Empty': 0, 'yourTotal': 0.19062499999999877, 'your4Empty': 0, 'yourOneTurnAway': -(57.80000000000055), 'myLongestPathSquared': 56.31250000000151, 'yourLongestFuturePath': -(1.9208333333333298), 'my1Empty': -(0.01), 'yourLongestFuturePathSquared': -(12.174652777777599), 'yourLongestPath': -(15.566666666666364)});
			return weights;
		};
		var smartEvaluationFunction = function (game, board, player) {
			var features = game.smartFeatures (board, player);
			var weights = initSmartFeatureWeights ();
			var value = sum (function () {
				var __accu0__ = [];
				var __iterable0__ = features.py_keys ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var k = __iterable0__ [__index0__];
					__accu0__.append (features [k] * weights [k]);
				}
				return __accu0__;
			} ());
			if (game.isEnd (tuple ([board, player]))) {
				return game.utility (tuple ([board, player])) + value;
			}
			return value;
		};
		var TDLevaluationFunction = function (game, board, player) {
			var features = game.smartFeaturesTDL (board, player);
			var weights = initSmartOpponentWeights ();
			var value = sum (function () {
				var __accu0__ = [];
				var __iterable0__ = features.py_keys ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var k = __iterable0__ [__index0__];
					__accu0__.append (features [k] * weights [k]);
				}
				return __accu0__;
			} ());
			if (game.isEnd (tuple ([board, player]))) {
				return game.utility (tuple ([board, player])) + value;
			}
			return value;
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
				var _ = __left0__ [0];
				var player = __left0__ [1];
				return self.isWinner (state, player) || self.isWinner (state, self.otherPlayer (player)) || self.fullBoard (state);
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
				return self.longestPath (board, player, __kwargtrans__ ({checkWinner: true})) == 12;
			});},
			get utility () {return __get__ (this, function (self, state) {
				var __left0__ = state;
				var _ = __left0__ [0];
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
			get player () {return __get__ (this, function (self, state) {
				return state [1];
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
			get findPathLength () {return __get__ (this, function (self, board, player, row, col) {
				var farthestCol = -(1);
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j].lower () == player) {
						if (j > farthestCol) {
							var farthestCol = j;
						}
						if (j == 11) {
							return 11;
						}
						else if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var maxCol = self.findPathLength (board, player, i, j);
							if (maxCol > farthestCol) {
								var farthestCol = maxCol;
							}
						}
					}
				}
				return farthestCol;
			});},
			get longestPath () {return __get__ (this, function (self, board, player, checkWinner) {
				if (typeof checkWinner == 'undefined' || (checkWinner != null && checkWinner .hasOwnProperty ("__kwargtrans__"))) {;
					var checkWinner = false;
				};
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
				var __iterable0__ = function () {
					var __accu0__ = [];
					var __iterable1__ = (!(checkWinner) ? range (12) : range (0));
					for (var __index0__ = 0; __index0__ < __iterable1__.length; __index0__++) {
						var j = __iterable1__ [__index0__];
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
							var newPath = self.findPathLength (board, player, i, j) - j;
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
			});},
			get getFlipPotential () {return __get__ (this, function (self, row, col, board, player) {
				var neighbors = self.surroundingPlaces (row, col);
				var flipPotential = 0;
				var otherPlayer = self.otherPlayer (player);
				var __iterable0__ = neighbors;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var neighbor = __iterable0__ [__index0__];
					var __left0__ = neighbor;
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j] == otherPlayer) {
						flipPotential++;
					}
					else if (board [i] [j] == player) {
						flipPotential--;
					}
				}
				return flipPotential;
			});},
			get smartFeatures () {return __get__ (this, function (self, board, player) {
				var featureNames = list (['myLongestPath', 'yourLongestPath', 'myCols', 'yourCols', 'myPerm', 'yourPerm', 'myTotal', 'yourTotal', 'my1Empty', 'your1Empty', 'my2Empty', 'your2Empty', 'my3Empty', 'your3Empty', 'my4Empty', 'your4Empty', 'my5Empty', 'your5Empty', 'my6Empty', 'your6Empty', 'my7Empty', 'your7Empty', 'my8Empty', 'your8Empty', 'my1Flip', 'your1Flip', 'my2Flip', 'your2Flip', 'my3Flip', 'your3Flip', 'my4Flip', 'your4Flip', 'my5Flip', 'your5Flip', 'my6Flip', 'your6Flip', 'my7Flip', 'your7Flip', 'my8Flip', 'your8Flip']);
				var features = function () {
					var __accu0__ = [];
					var __iterable0__ = featureNames;
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var feature = __iterable0__ [__index0__];
						__accu0__.append (list ([feature, 0]));
					}
					return dict (__accu0__);
				} ();
				var myCols = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 12; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
				var yourCols = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 12; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
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
						features ['myPerm']++;
						features ['myTotal']++;
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player).upper ()) {
						features ['yourPerm']++;
						features ['yourTotal']++;
						if (yourCols [j] == 0) {
							yourCols [j] = 1;
						}
					}
					else if (board [i] [j] == player) {
						features ['myTotal']++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							features ['myPerm']++;
						}
						else if (numEmptyNeighbors == 1) {
							features ['my1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['my2Empty']++;
						}
						else if (numEmptyNeighbors == 3) {
							features ['my3Empty']++;
						}
						else if (numEmptyNeighbors == 4) {
							features ['my4Empty']++;
						}
						else if (numEmptyNeighbors == 5) {
							features ['my5Empty']++;
						}
						else if (numEmptyNeighbors == 6) {
							features ['my5Empty']++;
						}
						else if (numEmptyNeighbors == 7) {
							features ['my7Empty']++;
						}
						else if (numEmptyNeighbors == 8) {
							features ['my8Empty']++;
						}
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player)) {
						features ['yourTotal']++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							features ['yourPerm']++;
						}
						else if (numEmptyNeighbors == 1) {
							features ['your1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['your2Empty']++;
						}
						else if (numEmptyNeighbors == 3) {
							features ['your3Empty']++;
						}
						else if (numEmptyNeighbors == 4) {
							features ['your4Empty']++;
						}
						else if (numEmptyNeighbors == 5) {
							features ['your5Empty']++;
						}
						else if (numEmptyNeighbors == 6) {
							features ['your6Empty']++;
						}
						else if (numEmptyNeighbors == 7) {
							features ['your7Empty']++;
						}
						else if (numEmptyNeighbors == 8) {
							features ['your8Empty']++;
						}
						if (yourCols [j] == 0) {
							yourCols [j] = 1;
						}
					}
				}
				var features = function () {
					var __accu0__ = [];
					var __iterable0__ = features.py_items ();
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var __left0__ = __iterable0__ [__index0__];
						var k = __left0__ [0];
						var v = __left0__ [1];
						__accu0__.append (list ([k, v / 96.0]));
					}
					return dict (__accu0__);
				} ();
				features ['myCols'] = sum (myCols) / 12.0;
				features ['yourCols'] = sum (yourCols) / 12.0;
				features ['myLongestPath'] = game.longestPath (board, player) / 12.0;
				features ['yourLongestPath'] = game.longestPath (board, game.otherPlayer (player)) / 12.0;
				return features;
			});},
			get TDLfeatures () {return __get__ (this, function (self, board, player) {
				var featureNames = list (['myLongestPath', 'yourLongestPath', 'diffLongestPath', 'myCols', 'yourCols', 'myPerm', 'yourPerm', 'diffPerm', 'myTotal', 'yourTotal', 'diffTotal', 'my1Empty', 'your1Empty', 'my2Empty', 'your2Empty', 'my3Empty', 'your3Empty', 'my4Empty', 'your4Empty', 'my5Empty', 'your5Empty', 'my6Empty', 'your6Empty', 'my7Empty', 'your7Empty', 'my8Empty', 'your8Empty', 'my1Flip', 'your1Flip', 'my2Flip', 'your2Flip', 'my3Flip', 'your3Flip', 'my4Flip', 'your4Flip', 'my5Flip', 'your5Flip', 'my6Flip', 'your6Flip', 'my7Flip', 'your7Flip', 'my8Flip', 'your8Flip']);
				var features = function () {
					var __accu0__ = [];
					var __iterable0__ = featureNames;
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var feature = __iterable0__ [__index0__];
						__accu0__.append (list ([feature, 0]));
					}
					return dict (__accu0__);
				} ();
				var myCols = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 12; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
				var yourCols = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 12; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
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
						features ['myPerm']++;
						features ['myTotal']++;
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player).upper ()) {
						features ['yourPerm']++;
						features ['yourTotal']++;
						if (yourCols [j] == 0) {
							yourCols [j] = 1;
						}
					}
					else if (board [i] [j] == player) {
						features ['myTotal']++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							features ['myPerm']++;
						}
						else if (numEmptyNeighbors == 1) {
							features ['my1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['my2Empty']++;
						}
						else if (numEmptyNeighbors == 3) {
							features ['my3Empty']++;
						}
						else if (numEmptyNeighbors == 4) {
							features ['my4Empty']++;
						}
						else if (numEmptyNeighbors == 5) {
							features ['my5Empty']++;
						}
						else if (numEmptyNeighbors == 6) {
							features ['my6Empty']++;
						}
						else if (numEmptyNeighbors == 7) {
							features ['my7Empty']++;
						}
						else if (numEmptyNeighbors == 8) {
							features ['my8Empty']++;
						}
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player)) {
						features ['yourTotal']++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							features ['yourPerm']++;
						}
						else if (numEmptyNeighbors == 1) {
							features ['your1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['your2Empty']++;
						}
						else if (numEmptyNeighbors == 3) {
							features ['your3Empty']++;
						}
						else if (numEmptyNeighbors == 4) {
							features ['your4Empty']++;
						}
						else if (numEmptyNeighbors == 5) {
							features ['your5Empty']++;
						}
						else if (numEmptyNeighbors == 6) {
							features ['your6Empty']++;
						}
						else if (numEmptyNeighbors == 7) {
							features ['your7Empty']++;
						}
						else if (numEmptyNeighbors == 8) {
							features ['your8Empty']++;
						}
						if (yourCols [j] == 0) {
							yourCols [j] = 1;
						}
					}
					else if (board [i] [j] == '-') {
						var flipPotential = self.getFlipPotential (i, j, board, player);
						if (flipPotential > 0) {
							if (flipPotential == 1) {
								features ['my1Flip']++;
							}
							else if (flipPotential == 2) {
								features ['my2Flip']++;
							}
							else if (flipPotential == 3) {
								features ['my3Flip']++;
							}
							else if (flipPotential == 4) {
								features ['my4Flip']++;
							}
							else if (flipPotential == 5) {
								features ['my5Flip']++;
							}
							else if (flipPotential == 6) {
								features ['my6Flip']++;
							}
							else if (flipPotential == 7) {
								features ['my7Flip']++;
							}
							else if (flipPotential == 8) {
								features ['my8Flip']++;
							}
						}
						else if (flipPotential < 0) {
							if (flipPotential == -(1)) {
								features ['your1Flip']++;
							}
							else if (flipPotential == -(2)) {
								features ['your2Flip']++;
							}
							else if (flipPotential == -(3)) {
								features ['your3Flip']++;
							}
							else if (flipPotential == -(4)) {
								features ['your4Flip']++;
							}
							else if (flipPotential == -(5)) {
								features ['your5Flip']++;
							}
							else if (flipPotential == -(6)) {
								features ['your6Flip']++;
							}
							else if (flipPotential == -(7)) {
								features ['your7Flip']++;
							}
							else if (flipPotential == -(8)) {
								features ['your8Flip']++;
							}
						}
					}
				}
				features ['diffPerm'] = features ['myPerm'] - features ['yourPerm'];
				features ['diffTotal'] = features ['myTotal'] - features ['yourTotal'];
				var features = function () {
					var __accu0__ = [];
					var __iterable0__ = features.py_items ();
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var __left0__ = __iterable0__ [__index0__];
						var k = __left0__ [0];
						var v = __left0__ [1];
						__accu0__.append (list ([k, v / 96.0]));
					}
					return dict (__accu0__);
				} ();
				features ['myCols'] = sum (myCols) / 12.0;
				features ['yourCols'] = sum (yourCols) / 12.0;
				var myLongestPath = game.longestPath (board, player);
				var yourLongestPath = game.longestPath (board, game.otherPlayer (player));
				features ['myLongestPath'] = myLongestPath / 12.0;
				features ['yourLongestPath'] = yourLongestPath / 12.0;
				features ['diffLongestPath'] = (myLongestPath - yourLongestPath) / 12.0;
				return features;
			});},
			get findPermPathLength () {return __get__ (this, function (self, board, player, row, col) {
				var farthestCol = -(1);
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (self.permSpaces [i] [j] == player) {
						if (j > farthestCol) {
							var farthestCol = j;
						}
						if (j == 11) {
							return 11;
						}
						else if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var maxCol = self.findPermPathLength (board, player, i, j);
							if (maxCol > farthestCol) {
								var farthestCol = maxCol;
							}
						}
					}
				}
				return farthestCol;
			});},
			get findLongestPermPath () {return __get__ (this, function (self, board, player) {
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
					if (self.permSpaces [i] [j] == player) {
						if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var newPath = self.findPermPathLength (board, player, i, j) - j;
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
			get findPathLengthEdges () {return __get__ (this, function (self, board, player, row, col, leftEdge, leftEdges, rightEdges) {
				var farthestCol = -(1);
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j].lower () == player) {
						if (j < leftEdge) {
							var leftEdge = j;
							leftEdges.append (tuple ([i, j]));
						}
						else if (j == leftEdge) {
							leftEdges.append (tuple ([i, j]));
						}
						if (j == farthestCol) {
							rightEdges.append (tuple ([i, j]));
						}
						else if (j > farthestCol) {
							var farthestCol = j;
							var rightEdges = list ([tuple ([i, j])]);
						}
						if (j == 11) {
							return tuple ([11, leftEdges, rightEdges]);
						}
						else if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var __left0__ = self.findPathLengthEdges (board, player, i, j, leftEdge, leftEdges, rightEdges);
							var maxCol = __left0__ [0];
							var newLeftEdges = __left0__ [1];
							var newRightEdges = __left0__ [2];
							if (maxCol >= farthestCol) {
								var farthestCol = maxCol;
								var leftEdges = newLeftEdges;
								var rightEdges = newRightEdges;
							}
						}
					}
				}
				return tuple ([farthestCol, leftEdges, rightEdges]);
			});},
			get findLongestPathEdges () {return __get__ (this, function (self, board, player) {
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
				self.leftEdges = list ([]);
				self.rightEdges = list ([]);
				var longestPath = -(1);
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
							var leftEdge = j;
							var leftEdges = list ([tuple ([i, j])]);
							var rightEdges = list ([tuple ([i, j])]);
							var __left0__ = self.findPathLengthEdges (board, player, i, j, leftEdge, leftEdges, rightEdges);
							var rightEdge = __left0__ [0];
							var leftEdges = __left0__ [1];
							var rightEdges = __left0__ [2];
							if (rightEdge - leftEdge > longestPath) {
								var longestPath = rightEdge - leftEdge;
								self.leftEdges = leftEdges;
								self.rightEdges = rightEdges;
							}
							else if (rightEdge - leftEdge == longestPath) {
								for (var k = 0; k < len (leftEdges); k++) {
									self.leftEdges.append (leftEdges [k]);
								}
								for (var k = 0; k < len (rightEdges); k++) {
									self.rightEdges.append (rightEdges [k]);
								}
							}
						}
					}
					if (longestPath == 11) {
						return 12;
					}
				}
				return longestPath + 1;
			});},
			get findFrontierMoves () {return __get__ (this, function (self, board, player) {
				var frontierSpacesChecked = function () {
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
				var leftFrontierPlaces = list ([]);
				var rightFrontierPlaces = list ([]);
				var leftFrontierFlips = list ([]);
				var rightFrontierFlips = list ([]);
				var __iterable0__ = self.leftEdges;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					var __iterable1__ = self.surroundingPlaces (i, j);
					for (var __index1__ = 0; __index1__ < __iterable1__.length; __index1__++) {
						var __left0__ = __iterable1__ [__index1__];
						var row = __left0__ [0];
						var col = __left0__ [1];
						if (!(frontierSpacesChecked [row] [col])) {
							frontierSpacesChecked [row] [col] = true;
							if (board [row] [col] == '-') {
								leftFrontierPlaces.append (tuple ([row, col]));
							}
							else if (board [row] [col] == self.otherPlayer (player)) {
								leftFrontierFlips.append (tuple ([row, col]));
							}
						}
					}
				}
				var __iterable0__ = self.rightEdges;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					var __iterable1__ = self.surroundingPlaces (i, j);
					for (var __index1__ = 0; __index1__ < __iterable1__.length; __index1__++) {
						var __left0__ = __iterable1__ [__index1__];
						var row = __left0__ [0];
						var col = __left0__ [1];
						if (!(frontierSpacesChecked [row] [col])) {
							frontierSpacesChecked [row] [col] = true;
							if (board [row] [col] == '-') {
								rightFrontierPlaces.append (tuple ([row, col]));
							}
							else if (board [row] [col] == self.otherPlayer (player)) {
								rightFrontierFlips.append (tuple ([row, col]));
							}
						}
					}
				}
				return tuple ([leftFrontierPlaces, rightFrontierPlaces, leftFrontierFlips, rightFrontierFlips]);
			});},
			get findPathFromSquare () {return __get__ (this, function (self, board, player, row, col) {
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (!(self.alreadyChecked [i] [j])) {
						self.alreadyChecked [i] [j] = true;
						if (board [i] [j].lower () == player) {
							if (j > self.rightCol) {
								self.rightCol = j;
							}
							if (j < self.leftCol) {
								self.leftCol = j;
							}
							self.findPathFromSquare (board, player, i, j);
						}
					}
				}
			});},
			get findLongestFuturePath () {return __get__ (this, function (self, board, player, longestPath) {
				var longestFuturePath = longestPath;
				var leftFrontierMoves = 0;
				var rightFrontierMoves = 0;
				var __left0__ = self.findFrontierMoves (board, player);
				var leftFrontierPlaces = __left0__ [0];
				var rightFrontierPlaces = __left0__ [1];
				var leftFrontierFlips = __left0__ [2];
				var rightFrontierFlips = __left0__ [3];
				var __iterable0__ = leftFrontierPlaces;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var frontier = __iterable0__ [__index0__];
					self.alreadyChecked = function () {
						var __accu0__ = [];
						for (var y = 0; y < 8; y++) {
							__accu0__.append (function () {
								var __accu1__ = [];
								for (var x = 0; x < 12; x++) {
									__accu1__.append (false);
								}
								return __accu1__;
							} ());
						}
						return __accu0__;
					} ();
					var __left0__ = frontier;
					var i = __left0__ [0];
					var j = __left0__ [1];
					self.leftCol = j;
					self.rightCol = j;
					self.findPathFromSquare (board, player, i, j);
					var futurePath = (self.rightCol - self.leftCol) + 1;
					if (futurePath > longestPath) {
						leftFrontierMoves++;
						if (futurePath > longestFuturePath) {
							var longestFuturePath = futurePath;
						}
					}
				}
				var __iterable0__ = rightFrontierPlaces;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var frontier = __iterable0__ [__index0__];
					self.alreadyChecked = function () {
						var __accu0__ = [];
						for (var y = 0; y < 8; y++) {
							__accu0__.append (function () {
								var __accu1__ = [];
								for (var x = 0; x < 12; x++) {
									__accu1__.append (false);
								}
								return __accu1__;
							} ());
						}
						return __accu0__;
					} ();
					var __left0__ = frontier;
					var i = __left0__ [0];
					var j = __left0__ [1];
					self.leftCol = j;
					self.rightCol = j;
					self.findPathFromSquare (board, player, i, j);
					var futurePath = (self.rightCol - self.leftCol) + 1;
					if (futurePath > longestPath) {
						rightFrontierMoves++;
						if (futurePath > longestFuturePath) {
							var longestFuturePath = futurePath;
						}
					}
				}
				var alreadyFlipped = function () {
					var __accu0__ = [];
					for (var y = 0; y < 8; y++) {
						__accu0__.append (function () {
							var __accu1__ = [];
							for (var x = 0; x < 12; x++) {
								__accu1__.append (false);
							}
							return __accu1__;
						} ());
					}
					return __accu0__;
				} ();
				var __iterable0__ = leftFrontierFlips;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var frontier = __iterable0__ [__index0__];
					var __left0__ = frontier;
					var i = __left0__ [0];
					var j = __left0__ [1];
					var __iterable1__ = self.surroundingPlaces (i, j);
					for (var __index1__ = 0; __index1__ < __iterable1__.length; __index1__++) {
						var __left0__ = __iterable1__ [__index1__];
						var row = __left0__ [0];
						var col = __left0__ [1];
						if (board [row] [col] == '-' && !(alreadyFlipped [row] [col])) {
							alreadyFlipped [row] [col] = true;
							var action = tuple ([row, col, true]);
							var newState = game.simulatedMove (tuple ([board, player]), action);
							var __left0__ = newState;
							var newBoard = __left0__ [0];
							var otherPlayer = __left0__ [1];
							self.alreadyChecked = function () {
								var __accu0__ = [];
								for (var y = 0; y < 8; y++) {
									__accu0__.append (function () {
										var __accu1__ = [];
										for (var x = 0; x < 12; x++) {
											__accu1__.append (false);
										}
										return __accu1__;
									} ());
								}
								return __accu0__;
							} ();
							self.leftCol = j;
							self.rightCol = j;
							self.findPathFromSquare (newBoard, player, i, j);
							var futurePath = (self.rightCol - self.leftCol) + 1;
							if (futurePath > longestPath) {
								leftFrontierMoves++;
								if (futurePath > longestFuturePath) {
									var longestFuturePath = futurePath;
								}
							}
						}
					}
				}
				var __iterable0__ = rightFrontierFlips;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var frontier = __iterable0__ [__index0__];
					var __left0__ = frontier;
					var i = __left0__ [0];
					var j = __left0__ [1];
					var __iterable1__ = self.surroundingPlaces (i, j);
					for (var __index1__ = 0; __index1__ < __iterable1__.length; __index1__++) {
						var __left0__ = __iterable1__ [__index1__];
						var row = __left0__ [0];
						var col = __left0__ [1];
						if (board [row] [col] == '-' && !(alreadyFlipped [row] [col])) {
							alreadyFlipped [row] [col] = true;
							var action = tuple ([row, col, true]);
							var newState = game.simulatedMove (tuple ([board, player]), action);
							var __left0__ = newState;
							var newBoard = __left0__ [0];
							var otherPlayer = __left0__ [1];
							self.alreadyChecked = function () {
								var __accu0__ = [];
								for (var y = 0; y < 8; y++) {
									__accu0__.append (function () {
										var __accu1__ = [];
										for (var x = 0; x < 12; x++) {
											__accu1__.append (false);
										}
										return __accu1__;
									} ());
								}
								return __accu0__;
							} ();
							self.leftCol = j;
							self.rightCol = j;
							self.findPathFromSquare (newBoard, player, i, j);
							var futurePath = (self.rightCol - self.leftCol) + 1;
							if (futurePath > longestPath) {
								rightFrontierMoves++;
								if (futurePath > longestFuturePath) {
									var longestFuturePath = futurePath;
								}
							}
						}
					}
				}
				return tuple ([longestFuturePath, leftFrontierMoves, rightFrontierMoves]);
			});},
			get smartFeaturesTDL () {return __get__ (this, function (self, board, player) {
				var featureNames = list (['myLongestPath', 'yourLongestPath', 'ahead', 'futureAhead', 'onlyTurnAway', 'myOneTurnAway', 'yourOneTurnAway', 'myLongestPathSquared', 'yourLongestPathSquared', 'myLongestFuturePath', 'yourLongestFuturePath', 'myLongestFuturePathSquared', 'yourLongestFuturePathSquared', 'diffLongestPath', 'diffLongestFuturePath', 'myLongestPermPath', 'yourLongestPermPath', 'blockedYou', 'blockedMe', 'yourPathFlex', 'myPathFlex', 'myCols', 'yourCols', 'myPerm', 'yourPerm', 'myTotal', 'yourTotal', 'my1Empty', 'your1Empty', 'my2Empty', 'your2Empty', 'my3Empty', 'your3Empty', 'my4Empty', 'your4Empty', 'my5Empty', 'your5Empty', 'my6Empty', 'your6Empty', 'my7Empty', 'your7Empty', 'my8Empty', 'your8Empty', 'my1Flip', 'your1Flip', 'my2Flip', 'your2Flip', 'my3Flip', 'your3Flip', 'my4Flip', 'your4Flip']);
				var features = function () {
					var __accu0__ = [];
					var __iterable0__ = featureNames;
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var feature = __iterable0__ [__index0__];
						__accu0__.append (list ([feature, 0]));
					}
					return dict (__accu0__);
				} ();
				var myCols = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 12; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
				var yourCols = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 12; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
				self.permSpaces = function () {
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
						features ['myPerm']++;
						features ['myTotal']++;
						self.permSpaces [i] [j] = player;
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player).upper ()) {
						features ['yourPerm']++;
						features ['yourTotal']++;
						self.permSpaces [i] [j] = self.otherPlayer (player);
						if (yourCols [j] == 0) {
							yourCols [j] = 1;
						}
					}
					else if (board [i] [j] == player) {
						features ['myTotal']++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							features ['myPerm']++;
							self.permSpaces [i] [j] = player;
						}
						else if (numEmptyNeighbors == 1) {
							features ['my1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['my2Empty']++;
						}
						else if (numEmptyNeighbors == 3) {
							features ['my3Empty']++;
						}
						else if (numEmptyNeighbors == 4) {
							features ['my4Empty']++;
						}
						else if (numEmptyNeighbors == 5) {
							features ['my5Empty']++;
						}
						else if (numEmptyNeighbors == 6) {
							features ['my6Empty']++;
						}
						else if (numEmptyNeighbors == 7) {
							features ['my7Empty']++;
						}
						else if (numEmptyNeighbors == 8) {
							features ['my8Empty']++;
						}
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player)) {
						features ['yourTotal']++;
						var numEmptyNeighbors = self.getNumEmptyNeighbors (i, j, board);
						if (numEmptyNeighbors == 0) {
							features ['yourPerm']++;
							self.permSpaces [i] [j] = self.otherPlayer (player);
						}
						else if (numEmptyNeighbors == 1) {
							features ['your1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['your2Empty']++;
						}
						else if (numEmptyNeighbors == 3) {
							features ['your3Empty']++;
						}
						else if (numEmptyNeighbors == 4) {
							features ['your4Empty']++;
						}
						else if (numEmptyNeighbors == 5) {
							features ['your5Empty']++;
						}
						else if (numEmptyNeighbors == 6) {
							features ['your6Empty']++;
						}
						else if (numEmptyNeighbors == 7) {
							features ['your7Empty']++;
						}
						else if (numEmptyNeighbors == 8) {
							features ['your8Empty']++;
						}
						if (yourCols [j] == 0) {
							yourCols [j] = 1;
						}
					}
					else if (board [i] [j] == '-') {
						var __left0__ = self.getFlipPotential (i, j, board, player);
						var myFlip = __left0__ [0];
						var yourFlip = __left0__ [1];
						var flipPotential = myFlip - yourFlip;
						if (flipPotential > 0) {
							if (flipPotential == 1) {
								features ['my1Flip']++;
							}
							else if (flipPotential == 2) {
								features ['my2Flip']++;
							}
							else if (flipPotential == 3) {
								features ['my3Flip']++;
							}
							else if (flipPotential >= 4) {
								features ['my4Flip']++;
							}
						}
						else if (flipPotential < 0) {
							if (flipPotential == -(1)) {
								features ['your1Flip']++;
							}
							else if (flipPotential == -(2)) {
								features ['your2Flip']++;
							}
							else if (flipPotential == -(3)) {
								features ['your3Flip']++;
							}
							else if (flipPotential <= -(4)) {
								features ['your4Flip']++;
							}
						}
					}
				}
				features ['diffPerm'] = features ['myPerm'] - features ['yourPerm'];
				features ['diffTotal'] = features ['myTotal'] - features ['yourTotal'];
				var features = function () {
					var __accu0__ = [];
					var __iterable0__ = features.py_items ();
					for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
						var __left0__ = __iterable0__ [__index0__];
						var k = __left0__ [0];
						var v = __left0__ [1];
						__accu0__.append (list ([k, v / 96.0]));
					}
					return dict (__accu0__);
				} ();
				features ['myCols'] = sum (myCols) / 12.0;
				features ['yourCols'] = sum (yourCols) / 12.0;
				features ['myLongestPermPath'] = self.findLongestPermPath (board, player) / 12.0;
				features ['yourLongestPermPath'] = self.findLongestPermPath (board, self.otherPlayer (player)) / 12.0;
				var myLongestPath = self.findLongestPathEdges (board, player);
				features ['myLongestPath'] = myLongestPath / 12.0;
				features ['myLongestPathSquared'] = Math.pow (myLongestPath, 2) / 144.0;
				var __left0__ = self.findLongestFuturePath (board, player, myLongestPath);
				var myLongestFuturePath = __left0__ [0];
				var myLeftFrontierFlex = __left0__ [1];
				var myRightFrontierFlex = __left0__ [2];
				var myPathFlex = myLeftFrontierFlex + myRightFrontierFlex;
				features ['myLongestFuturePath'] = myLongestFuturePath / 12.0;
				features ['myLongestFuturePathSquared'] = Math.pow (myLongestFuturePath, 2) / 144.0;
				var myOneTurnAway = myLongestFuturePath == 12;
				features ['myOneTurnAway'] = myOneTurnAway;
				if (myLongestPath <= 1 || myLongestPath == 12) {
					var blockedMe = false;
				}
				else if (myLeftFrontierFlex == 0 && len (self.leftEdges) > 0 && self.leftEdges [0] [1] != 0) {
					var blockedMe = true;
				}
				else if (myRightFrontierFlex == 0 && len (self.rightEdges) > 0 && self.rightEdges [0] [1] != 11) {
					var blockedMe = true;
				}
				else {
					var blockedMe = false;
				}
				features ['blockedMe'] = blockedMe;
				features ['myPathFlex'] = myPathFlex / 96.0;
				var yourLongestPath = self.findLongestPathEdges (board, self.otherPlayer (player));
				features ['yourLongestPath'] = yourLongestPath / 12.0;
				features ['yourLongestPathSquared'] = Math.pow (yourLongestPath, 2) / 144.0;
				var __left0__ = self.findLongestFuturePath (board, self.otherPlayer (player), yourLongestPath);
				var yourLongestFuturePath = __left0__ [0];
				var yourLeftFrontierFlex = __left0__ [1];
				var yourRightFrontierFlex = __left0__ [2];
				var yourPathFlex = yourLeftFrontierFlex + yourRightFrontierFlex;
				features ['yourLongestFuturePath'] = yourLongestFuturePath / 12.0;
				features ['yourLongestFuturePathSquared'] = Math.pow (yourLongestFuturePath, 2) / 144.0;
				var yourOneTurnAway = yourLongestFuturePath == 12;
				features ['yourOneTurnAway'] = yourOneTurnAway;
				if (yourLongestPath <= 1 || yourLongestPath == 12) {
					var blockedYou = false;
				}
				else if (yourLeftFrontierFlex == 0 && len (self.leftEdges) > 0 && self.leftEdges [0] [1] != 0) {
					var blockedYou = true;
				}
				else if (yourRightFrontierFlex == 0 && len (self.rightEdges) > 0 && self.rightEdges [0] [1] != 11) {
					var blockedYou = true;
				}
				else {
					var blockedYou = false;
				}
				features ['blockedYou'] = blockedYou;
				features ['yourPathFlex'] = yourPathFlex / 96.0;
				features ['diffLongestPath'] = (myLongestPath - yourLongestPath) / 12.0;
				features ['diffLongestFuturePath'] = (myLongestFuturePath - yourLongestFuturePath) / 12.0;
				features ['ahead'] = myLongestPath > yourLongestPath;
				features ['futureAhead'] = myLongestFuturePath > yourLongestFuturePath;
				features ['onlyTurnAway'] = myOneTurnAway && !(yourOneTurnAway);
				return features;
			});}
		});
		var GameManager = __class__ ('GameManager', [object], {
			get __init__ () {return __get__ (this, function (self) {
				self.game = PathwayzGame ();
				self.state = game.startState ();
				self.policies = dict ({'Human': null, 'PAI Random': randomMove, 'PAI Baseline': baselineMove, 'PAI Advanced Baseline': advancedBaselineMove, 'PAI Features': featuresMove, 'PAI Advanced Features': smartFeaturesMove, 'PAI TDL': TDLfeaturesMove, 'PAI Minimax': advancedMinimax, 'PAI Beam Minimax': beamMinimax, 'PAI Advanced Beam Minimax': beamMinimaxMoreFeatures, 'PAI TDL Beam Minimax': beamMinimaxTDL, 'PAI Expectimax': advancedExpectimax, 'PAI MCS': monteCarloSearch, 'PAI MCTS': monteCarloTreeSearch});
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
				var __left0__ = self.state;
				var curBoard = __left0__ [0];
				var curPlayer = __left0__ [1];
				var curFeatures = game.smartFeaturesTDL (curBoard, game.otherPlayer (curPlayer));
				print (curFeatures);
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
				self.isAI = dict ({'w': false, 'b': false});
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
				document.getElementById ('modalInformation').innerHTML = '<h2>Player 1</h2><br><select class="soflow" id="player1"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Minimax</option><option>PAI Beam Minimax</option><option>PAI Advanced Beam Minimax</option><option>PAI Expectimax</option><option>PAI MCS</option><option>PAI MCTS</option></select><input type="text" style="display: inline;" id="player1name" value="Player 1"><br><h2>Player 2</h2><br><select class="soflow" id="player2"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Minimax</option><option>PAI Beam Minimax</option><option>PAI Advanced Beam Minimax</option><option>PAI Expectimax</option><option>PAI MCS</option><option>PAI MCTS</option></select><input type="text" style="display: inline;" id="player2name" value="Player 2"><br><a href="#" onclick="closeModal(); pathwayzGame.gameManager.setPlayers();">Start Game</a></div>';
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
		var game = PathwayzGame ();
		var gameManager = GameManager ();
		__pragma__ ('<use>' +
			'math' +
			'random' +
		'</use>')
		__pragma__ ('<all>')
			__all__.AVG = AVG;
			__all__.GameManager = GameManager;
			__all__.MAX = MAX;
			__all__.MCTSdepthCharge = MCTSdepthCharge;
			__all__.MIN = MIN;
			__all__.Node = Node;
			__all__.PathwayzGame = PathwayzGame;
			__all__.TDLevaluationFunction = TDLevaluationFunction;
			__all__.TDLfeaturesMove = TDLfeaturesMove;
			__all__.advancedBaselineMove = advancedBaselineMove;
			__all__.advancedExpectimax = advancedExpectimax;
			__all__.advancedMinimax = advancedMinimax;
			__all__.backpropagate = backpropagate;
			__all__.baselineMove = baselineMove;
			__all__.beamMinimax = beamMinimax;
			__all__.beamMinimaxMoreFeatures = beamMinimaxMoreFeatures;
			__all__.beamMinimaxTDL = beamMinimaxTDL;
			__all__.beamScores = beamScores;
			__all__.depthCharge = depthCharge;
			__all__.evaluationFunction = evaluationFunction;
			__all__.expand = expand;
			__all__.featureExtractor = featureExtractor;
			__all__.featuresMove = featuresMove;
			__all__.game = game;
			__all__.gameManager = gameManager;
			__all__.initOpponentWeights = initOpponentWeights;
			__all__.initSmartFeatureWeights = initSmartFeatureWeights;
			__all__.initSmartOpponentWeights = initSmartOpponentWeights;
			__all__.minimax = minimax;
			__all__.monteCarloSearch = monteCarloSearch;
			__all__.monteCarloTreeSearch = monteCarloTreeSearch;
			__all__.oneMoveAway = oneMoveAway;
			__all__.randomMove = randomMove;
			__all__.select = select;
			__all__.selectfn = selectfn;
			__all__.shuffle = shuffle;
			__all__.smartEvaluationFunction = smartEvaluationFunction;
			__all__.smartFeaturesMove = smartFeaturesMove;
			__all__.value = value;
			__all__.valueExpectimax = valueExpectimax;
		__pragma__ ('</all>')
	}) ();
