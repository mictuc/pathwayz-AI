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
					return evaluationFunction (game, board, game.otherPlayer (player));
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
				var beamWidth = list ([1, 5, 10]);
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
				var beamWidth = list ([1, 5, 10]);
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
				var beamWidth = list ([1, 5, 10]);
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
			for (var i = 0; i < min (5, len (scores)); i++) {
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
					return TDLevaluationFunction (game, board, player);
				}
				else {
					return TDLevaluationFunction (game, board, game.otherPlayer (player));
				}
			}
			else if (originalPlayer) {
				var highestScore = -(float ('inf'));
				var __iterable0__ = game.actions (state);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					var score = valueExpectimax (game, game.simulatedMove (state, action), depth - 1, false);
					var highestScore = MAX (list ([highestScore, score]));
				}
				return highestScore;
			}
			else {
				var scores = list ([]);
				var __iterable0__ = game.actions (state);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var action = __iterable0__ [__index0__];
					var score = valueExpectimax (game, game.simulatedMove (state, action), depth - 1, true);
					scores.append (score);
				}
				var sortedScores = sorted (scores, __kwargtrans__ ({reverse: true}));
				var expectedScore = 0;
				for (var i = 0; i < min (5, len (sortedScores)); i++) {
					expectedScore += sortedScores [i];
				}
				var expectedScore = expectedScore / 5.0;
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
			var weights = dict ({'yourTurnsAwayMid': 217.5669936760614, 'diffLongestPath': 15013.415941931396, 'my3EmptyEnd': -(56.98086974755125), 'your2PathExtensionMid': -(45.722207225856096), 'diffLongestPermPath': 15532.663438758429, 'your4FlipMid': -(4.825422130412166), 'blockedMeEarly': 72.75289717746845, 'myTurnsAwayEarly': -(460.47097296284284), 'diff1EdgeEmpty': 77.03328733394876, 'myTotalEnd': 1942.7114444698575, 'yourLongestSafePathSquaredEnd': -(4296.584618578756), 'yourClosedPathFlexMid': -(133.06802461998342), 'your8Empty': 0, 'myLongestPermPathSquaredEarly': 0.9081676101095164, 'amTurnsAheadMid': 410.2704496427704, 'myLongestEvenPathSquaredMid': -(80.01249182852244), 'your1FlipEnd': -(91.64358751992845), 'myLongestSafePath': 6059.318505107663, 'myLongestEvenPathEarly': -(14.290720593484972), 'yourOneTurnAwayEarly': 0.0, 'my1EmptyEarly': -(3.0864191467372204), 'your5Empty': 0, 'diffLongestSafePathEnd': 10596.729349374236, 'myLongestEvenPathSquared': 9075.448014410476, 'futureAheadEnd': 20113.96581796395, 'my3EdgeEmptyEnd': 7.249228665849321, 'yourClosedPathFlexEnd': -(513.2465103743647), 'diff4FlipEarly': 1.0814157651670944, 'yourLongestPath': -(4822.031580284883), 'futureAhead': 20063.125500124577, 'your2PathExtension': -(88.01195789761108), 'diff3FlipMid': 20.799424237607692, 'diffLongestPathSquaredEnd': 5507.942493741861, 'diff3FlipEnd': 180.66851201693473, 'myPermMid': -(189.4742723825262), 'yourPermEnd': -(1256.6657786290255), 'your4EdgeEmptyEarly': 2.067629808413787, 'diff3EmptyEnd': -(133.31252054211373), 'yourLongestFuturePath': -(6495.888781355024), 'my3EmptyMid': -(41.44353043102558), 'diff1FlipEnd': -(289.6056854226995), 'my6Empty': 0, 'yourTurnsAwaySquared': 1406.0342968996856, 'your1FlipEarly': -(169.38223397478203), 'yourColsEnd': 514.7443633783677, 'diff4Flip': 26.449933498579405, 'your4Empty': 97.58368967218586, 'yourLongestExtensionEarly': -(171.9306194294323), 'diffLongestPermPathEarly': 147.7348103753336, 'diffLongestEvenPathSquaredMid': 312.9424604903454, 'yourTurnsAwayEarly': -(789.3175070728257), 'your3Flip': -(89.74364392764853), 'diffLongestSafePathEarly': -(186.10596176429402), 'yourLongestPermPathSquared': -(7697.798612698168), 'my3PathExtension': 82.79657727972814, 'diffTotalEarly': -(57.328801078939556), 'myLongestPermPathSquared': 8480.277367185661, 'diff1EdgeEmptyMid': 33.259104607796566, 'yourLongestPathSquaredEnd': -(4319.06231849227), 'diffPermEarly': 48.11674400734055, 'yourClosedPathFlex': -(641.7900248988254), 'myOneTurnAway': 45856.86187103466, 'yourLongestEvenPathEnd': -(4960.85992203528), 'myLongestFuturePathSquaredEnd': 18845.33828272426, 'blockedMyLeftEnd': -(4036.3201686186103), 'myLongestFuturePathEnd': 11722.539982043903, 'myLongestExtensionEnd': -(421.36060677293926), 'blockedMyRightMid': -(815.6421170330424), 'diff3FlipEarly': 8.835837394187587, 'turnsAhead': 18310.365792456156, 'yourLongestSafePathSquaredMid': -(1110.5795680274045), 'your1EmptyMid': -(45.419342803955956), 'yourTotal': -(1562.630208873833), 'diffLongestSafePathMid': 838.1704248920721, 'diff2FlipMid': 15.09933130939728, 'myLongestPathSquaredEnd': 16569.139188327437, 'behind': -(19518.414954263542), 'your1FlipMid': -(318.41721085588927), 'blockedMyLeft': -(4155.097659653071), 'diffLongestSafePathSquaredMid': 253.33692868850264, 'your3EdgeEmpty': 16.36456368637668, 'your2EdgeEmptyEarly': 1.298696700109425, 'my4FlipMid': -(0.4578354749490522), 'myTurnsAwayMid': -(1722.157572981146), 'your4EdgeEmptyMid': 0.9775186231841196, 'your3PathExtension': -(226.61290606059964), 'diffLongestFuturePathSquared': 5287.834467579524, 'yourLongestPermPathSquaredEarly': -(22.03283936902007), 'my3EmptyEarly': -(5.457268058665229), 'my2PathExtensionMid': -(16.367405526474098), 'yourPermEarly': -(26.30078545129056), 'my1FlipEnd': -(91.85943450798445), 'yourLongestEvenPathEarly': -(65.04093600920997), 'yourLongestPermPath': -(8050.449558865587), 'ahead': 18450.181536447726, 'your2PathExtensionEarly': -(3.7440722128203485), 'diff4EmptyEnd': -(148.52164841065905), 'diffPermEnd': 2991.575624026244, 'yourLongestPermPathEarly': -(107.92722071294482), 'diff3EdgeEmpty': -(9.717859954984771), 'myLongestPathSquared': 15816.912084392066, 'my2EmptyEarly': -(6.855199105295753), 'yourLongestFuturePathSquared': -(9025.615795987564), 'myLongestExtension': -(725.8170584195013), 'my3FlipMid': 8.866121569219262, 'behindEarly': 2068.092648268146, 'myLongestSafePathEnd': 7416.3938425215, 'myLongestPermPath': 7543.021379892886, 'your2FlipEnd': -(11.581610966498182), 'yourTotalEnd': -(803.7403095458801), 'your1Flip': -(577.1094906839329), 'your3FlipMid': -(23.632742818950714), 'yourPermMid': -(600.7699511565064), 'yourLongestSafePath': -(5198.083640727706), 'myPerm': 1578.9842399040617, 'diff1EdgeEmptyEarly': -(4.49500484278212), 'myLongestSafePathSquaredEnd': 8989.074962183242, 'myLongestFuturePathMid': -(1926.2478735648249), 'my8Empty': 0, 'your4Flip': -(15.331902803353769), 'blockedYourRightEarly': -(56.67694552619545), 'diffCols': 3447.4734884349386, 'diff1EmptyMid': 27.809327320273496, 'yourLongestEvenPathSquared': -(7025.476518362022), 'your2EmptyEarly': 5.771600412806242, 'my4EdgeEmptyMid': -(2.926707968987763), 'amTurnsBehindEnd': -(28559.680166270504), 'blockedMyLeftMid': -(115.03166628253976), 'onlyTurnAwayEnd': 21226.32233957107, 'diff1EdgeEmptyEnd': 48.26918756893425, 'your4EmptyEarly': 3.5057408562755574, 'yourOpenPathFlexEnd': 215.9754103445665, 'diffLongestFuturePathEnd': 14443.235002961825, 'diffLongestSafePathSquaredEnd': 4353.225274859486, 'myLongestPermPathSquaredMid': 24.223932188879076, 'diffLongestFuturePath': 15935.561084582028, 'yourOpenPathFlexEarly': -(16.789389513924547), 'blockedMyLeftEarly': 8.854175248078182, 'your2EdgeEmpty': -(3.591511781238535), 'myLongestPathSquaredEarly': -(118.83388889340188), 'yourLongestPathSquared': -(5770.304586320543), 'myClosedPathFlexEnd': 934.7821170918664, 'my4EmptyEnd': -(117.3308188703575), 'diff3EdgeEmptyMid': -(1.2966235434124207), 'myLongestSafePathSquaredMid': -(284.51123543965406), 'aheadMid': -(320.0731866944002), 'your6Empty': 0, 'my1PathExtension': 60.82440407762451, 'myLongestFuturePathSquaredEarly': -(156.38598264576856), 'my3PathExtensionMid': 26.657979216480452, 'yourLongestPathEarly': 66.08476044196395, 'diffLongestEvenPathMid': 1110.4556111879988, 'yourLongestSafePathSquared': -(5425.294918012042), 'your2FlipMid': -(65.97866022224432), 'amTurnsAheadEarly': -(432.875112587467), 'diff1EmptyEarly': -(6.01516597992177), 'diff2Flip': 336.2426554278908, 'myTotalEarly': -(45.09521942106472), 'yourLongestExtensionMid': -(1483.4373230235012), 'blockedMeMid': -(930.6737833155826), 'my1EdgeEmptyEarly': -(3.094274151043162), 'my2PathExtensionEnd': 173.89177310245003, 'blockedYouEnd': 5776.564385558303, 'diff2Empty': -(161.093224585815), 'my3FlipEnd': 168.72400194966173, 'yourOpenPathFlexMid': 5.5607742493619945, 'your2Flip': -(104.80249968788581), 'diffPerm': 3460.494400974237, 'yourLongestFuturePathSquaredEnd': -(5282.295354189657), 'yourOpenPathFlex': 204.74679508000403, 'my4EdgeEmptyEnd': -(16.168488529334795), 'your2PathExtensionEnd': -(38.54567845893463), 'diffColsEnd': 3173.434527490144, 'your3FlipEarly': -(5.4417983514628006), 'my2PathExtensionEarly': 11.208210321227307, 'your1EdgeEmpty': -(14.077141923599475), 'your4FlipEnd': -(10.254257293438654), 'diff1Empty': 316.517789096255, 'onlyTurnAway': 22630.08884460779, 'diff4EdgeEmpty': -(30.64431646148529), 'blockedYourRightMid': 117.43411508137827, 'diff2EmptyMid': 3.868853194009724, 'yourTotalEarly': 12.233581657874478, 'yourTurnsAwaySquaredEnd': 1873.5949657709045, 'diff2FlipEnd': 275.22979036950034, 'myClosedPathFlex': 918.1991205309615, 'your3EdgeEmptyEnd': 19.40864114195895, 'diff4EdgeEmptyMid': -(3.073534851397457), 'your1PathExtensionMid': -(40.44479241135185), 'diff2EdgeEmptyMid': -(13.562666880441926), 'futureAheadEarly': -(421.3355509153697), 'myOpenPathFlexEarly': 1.9952744639047777, 'blockedMeEnd': -(7459.2021561244865), 'behindEnd': -(19652.725421901254), 'diffLongestFuturePathSquaredEarly': -(29.908072906149417), 'myLongestFuturePathSquaredMid': -(831.4414678496264), 'diff2EdgeEmpty': 35.44544546954163, 'diff4Empty': -(180.85066942039887), 'blockedYourLeftEnd': 3713.2674147000766, 'myTurnsAwaySquaredEnd': -(4717.354932657996), 'onlyTurnAwayMid': 1223.80650503672, 'myPermEarly': 21.81595855604995, 'your3EdgeEmptyMid': -(5.378067844250867), 'myTurnsAway': -(14153.783528928532), 'yourLongestExtensionEnd': -(47.9459252838638), 'diffLongestEvenPathSquared': 5392.6080876762235, 'your3EmptyMid': -(5.613512943412475), 'yourLongestEvenPathSquaredEarly': -(9.966229390779478), 'futureBehind': -(30146.185459996475), 'diffLongestEvenPathSquaredEnd': 5074.009163846885, 'my4FlipEnd': 21.366924715234994, 'myClosedPathFlexEarly': -(4.282237657817136), 'your3Empty': 100.7409679049545, 'my2FlipEnd': 426.0038716036725, 'yourOneTurnAwayEnd': -(14941.57827187486), 'your1PathExtensionEarly': -(16.184952449249998), 'my1PathExtensionEarly': -(5.418537432820195), 'yourLongestFuturePathEnd': -(2720.6950209179213), 'your3EmptyEarly': 12.211307841016161, 'your1PathExtension': -(230.14532454200307), 'futureBehindMid': -(3112.631587279232), 'my2EmptyMid': -(26.824843388866594), 'diff1Flip': -(282.85839231740124), 'your3EmptyEnd': 94.40983967401814, 'turnsAheadSquaredMid': 907.4912613246343, 'yourLongestFuturePathMid': -(3654.9970681162827), 'myTurnsAwaySquaredEarly': -(192.92112310242328), 'futureAheadMid': 192.53523307603783, 'diffLongestFuturePathSquaredMid': 677.2494035990866, 'my1FlipMid': -(339.6612844389652), 'diff3Flip': 210.30377364873016, 'yourLongestSafePathMid': -(1907.9664539692392), 'diff2EdgeEmptyEarly': -(1.7637401597026192), 'turnsAheadEarly': -(328.8465341099841), 'my4EmptyMid': -(90.58732036077039), 'yourLongestEvenPath': -(6917.7002030498315), 'myColsMid': -(2270.41722961637), 'my2PathExtension': 168.732577897204, 'yourTurnsAwayEnd': 4701.241110257703, 'my4Empty': -(248.88680575180058), 'my3PathExtensionEarly': 2.056857655448325, 'blockedYouMid': 335.178449318923, 'myLongestEvenPathEnd': 8130.473649138999, 'aheadEarly': -(933.8694281401578), 'my1EdgeEmptyMid': 0.6757876714926115, 'myLongestPathMid': -(1655.9116730284156), 'diffLongestPathEnd': 14816.649684450926, 'myTurnsAwaySquaredMid': -(579.645545607317), 'my1EmptyMid': -(25.409150564621132), 'myOpenPathFlex': -(616.982652744021), 'your7Empty': 0, 'diffLongestEvenPathSquaredEarly': 2.359935561213527, 'myLongestPathEarly': -(380.5528874752204), 'my2EdgeEmpty': 14.718444988927743, 'my2Flip': 449.27884655910134, 'amTurnsBehindEarly': 1737.7920578351152, 'my7Empty': 0, 'futureBehindEarly': 1718.4719741658969, 'diffLongestEvenPathEnd': 13091.333571174258, 'myTotal': 1513.0684777025122, 'your2EdgeEmptyMid': -(2.1938738945859058), 'diff2EdgeEmptyEnd': 50.771852509686134, 'blockedMyRightEnd': -(3422.8819875058675), 'diffPermMid': 411.29567877397955, 'your3FlipEnd': -(60.78931109056832), 'my3EdgeEmptyMid': -(7.538855463781753), 'my4FlipEarly': 1.2142973589563038, 'myLongestEvenPathMid': -(776.5687338173485), 'my3FlipEarly': 8.084082745627853, 'myClosedPathFlexMid': -(12.300758903086615), 'yourClosedPathFlexEarly': 4.52451009552248, 'blockedYourLeftEarly': 9.314315631162462, 'my3Flip': 185.692227097842, 'my4EdgeEmpty': -(22.58531058544378), 'diffLongestPermPathSquaredEnd': 5235.262428540669, 'yourColsEarly': 33.402137146930805, 'yourLongestPermPathMid': -(1755.9007331567302), 'diffLongestPathSquaredEarly': -(52.967875399819846), 'diffTotalEnd': 2746.4517540157462, 'your1EdgeEmptyEarly': 3.1688258739489044, 'my2FlipMid': -(16.802138846071408), 'diff3EdgeEmptyEnd': -(4.991886499510672), 'yourTurnsAway': 4158.32393019428, 'diff3EmptyEarly': -(10.9031880761523), 'amTurnsBehindMid': -(3012.1914986141783), 'my2EdgeEmptyEnd': 30.974492215742394, 'yourLongestPathEnd': -(2672.749095634069), 'onlyTurnAwayEarly': 0.0, 'myTurnsAwayEnd': -(11947.954982984564), 'diffLongestSafePath': 11257.402145835396, 'diffLongestPermPathSquared': 5566.010094194956, 'diffColsMid': 483.2899299480263, 'diff2FlipEarly': 45.913533748993565, 'my2EdgeEmptyMid': -(14.391354457212065), 'myOneTurnAwayEnd': 44285.591901934225, 'diff4EmptyMid': -(5.6883547203656475), 'myOneTurnAwayEarly': 0.0, 'myLongestPathSquaredMid': -(757.3497428197055), 'my5Empty': 0, 'diffTotal': 3075.1504574096693, 'yourTurnsAwaySquaredMid': 215.4137192910122, 'myOpenPathFlexEnd': -(546.726720227578), 'my3EdgeEmpty': -(2.31125426924224), 'yourLongestPathMid': -(2171.5597450927817), 'yourLongestFuturePathSquaredEarly': -(10.179146711228768), 'your4EmptyMid': -(58.30995134514935), 'your1EdgeEmptyMid': -(31.519147379426602), 'myLongestEvenPathSquaredEarly': -(16.122183596437484), 'your2EdgeEmptyEnd': -(2.7109179200954343), 'diff4FlipMid': 1.977175709406602, 'blockedYourRightEnd': 2063.2969708582277, 'diffLongestSafePathSquared': 4587.222523363114, 'diff3EmptyMid': -(25.35532443358534), 'yourLongestPermPathEnd': -(6166.61327166257), 'myOpenPathFlexMid': -(72.2512069803468), 'diff2EmptyEarly': -(8.386315885237682), 'myLongestPermPathMid': -(562.8971687887539), 'myLongestFuturePathEarly': -(414.67313858536903), 'diffLongestPathSquaredMid': 166.4744363019543, 'your4EdgeEmpty': 21.024576893951753, 'your2EmptyEnd': 250.1791732124023, 'diffLongestEvenPath': 14260.697731111328, 'my4EmptyEarly': -(41.10512485400647), 'yourLongestPathSquaredMid': -(1418.4923059094435), 'my3PathExtensionEnd': 54.081740407799586, 'myColsEarly': -(297.42119084510784), 'myLongestExtensionMid': -(270.33620053641215), 'myLongestPath': 10199.3843616466, 'blockedMyRight': -(4188.625382609519), 'yourCols': -(2259.5895090335), 'diff1EmptyEnd': 294.7236277559034, 'myColsEnd': 4644.7686753524185, 'diff2EmptyEnd': -(156.575761894587), 'diffLongestFuturePathSquaredEnd': 4628.776470219912, 'my3EdgeEmptyEarly': -(1.9955858046431552), 'yourPerm': -(1886.5101610701538), 'diff3EdgeEmptyEarly': -(3.4293499120616846), 'blockedYourLeft': 3955.5260645687863, 'diff4EdgeEmptyEnd': -(23.268027946594408), 'my4EdgeEmptyEarly': -(3.4484474204545297), 'diffTotalMid': 372.08448363952294, 'blockedMyRightEarly': 63.89872192939032, 'myLongestExtensionEarly': -(34.12025111014984), 'blockedYou': 6125.580204982193, 'diff1FlipMid': -(95.2149721223272), 'diffLongestEvenPathEarly': 50.75021541572506, 'futureBehindEnd': -(28752.025846883167), 'your3PathExtensionMid': -(95.67531047326716), 'my4Flip': 22.22078243257556, 'my1FlipEarly': 2.6548233074531176, 'yourLongestFuturePathEarly': -(105.84585898746855), 'myOneTurnAwayMid': 1390.429969100472, 'blockedYouEarly': -(47.362629895032995), 'aheadEnd': 19463.814151282284, 'turnsAheadSquared': 7361.016690190623, 'myCols': 2120.9860882242374, 'blockedMe': -(8362.443042262597), 'yourLongestEvenPathSquaredMid': -(1094.2687326113873), 'myLongestFuturePath': 9446.672303226993, 'your1EdgeEmptyEnd': 14.347137915211464, 'turnsAheadEnd': 16649.19609324228, 'amTurnsAhead': 20028.84572189983, 'myLongestPermPathSquaredEnd': 8430.293878497754, 'diffLongestSafePathSquaredEarly': -(22.96676351821334), 'your2EmptyMid': -(21.77840224171934), 'your3EdgeEmptyEarly': 2.289198722001954, 'blockedYourRight': 2145.3541404134107, 'diffLongestPathMid': 515.6480720643655, 'yourOneTurnAwayMid': -(2490.2642206282717), 'myPermEnd': 1734.9098453972117, 'yourOneTurnAway': -(10000000), 'my1EdgeEmptyEnd': 59.57693631679188, 'myLongestEvenPathSquaredEnd': 9166.56463427982, 'diff4EmptyEarly': -(26.640666289373417), 'amTurnsBehind': -(29834.079607049553), 'myLongestSafePathMid': -(1069.7960290771628), 'myTurnsAwaySquared': -(5498.170212478837), 'my2EdgeEmptyEarly': -(1.8688594362692281), 'yourLongestPermPathSquaredEnd': -(6739.403608789763), 'your2Empty': 233.56747555015596, 'turnsAheadSquaredEarly': -(35.83112104310647), 'diffLongestPathSquared': 5646.731693532875, 'myLongestFuturePathSquared': 17938.88736000665, 'diffLongestPermPathSquaredEarly': 14.312215834398335, 'blockedYourLeftMid': 217.74433423754385, 'my2EmptyEnd': 53.791100247587345, 'diff3Empty': -(169.57103305185134), 'my1EmptyEnd': 246.6900187739156, 'amTurnsAheadEnd': 19958.150384844554, 'yourLongestSafePathEarly': -(104.78167990574624), 'yourLongestPermPathSquaredMid': -(919.1475812060711), 'diffLongestFuturePathMid': 1728.749194551457, 'your4EdgeEmptyEnd': 17.934636795687176, 'diffLongestPermPathSquaredMid': 313.9194775976638, 'diff4FlipEnd': 23.391342024005723, 'yourLongestSafePathSquaredEarly': -(11.804342516977117), 'diffLongestPathEarly': -(446.637647917183), 'myTotalMid': -(397.9202473462986), 'your4FlipEarly': -(0.19024421283628212), 'yourLongestExtension': -(2860.4181374028503), 'my1PathExtensionEnd': 168.61728597477818, 'diffLongestFuturePathEarly': -(308.8272795979), 'myLongestSafePathEarly': -(290.8876416700407), 'your1EmptyEarly': 8.221366894593414, 'yourLongestFuturePathSquaredMid': -(3692.4248367533883), 'myLongestPathEnd': 12143.900588816838, 'yourTotalMid': -(770.0047309858242), 'turnsAheadMid': 1939.7245666572082, 'yourLongestEvenPathSquaredEnd': -(5915.581139693195), 'your4EmptyEnd': 152.14050432772436, 'myLongestSafePathSquared': 8628.315584537866, 'diff1FlipEarly': 101.96226522762575, 'your1Empty': -(130.39198030646088), 'my1PathExtensionMid': -(102.37434446433176), 'myLongestSafePathSquaredEarly': -(81.86411442803607), 'your3PathExtensionEarly': -(5.800990965847759), 'yourColsMid': -(2807.115176225486), 'myLongestPermPathEarly': 39.807589662388914, 'my1EdgeEmpty': 7.461596647735594, 'my3Empty': -(103.42948073724187), 'my1Flip': -(427.2046456394963), 'your2FlipEarly': -(29.038686832476653), 'diff4EdgeEmptyEarly': -(4.302753663493496), 'myLongestEvenPath': 7342.997528061498, 'diffLongestPermPathEnd': 14184.916730681807, 'yourLongestEvenPathMid': -(1887.0243450053538), 'your1EmptyEnd': -(92.78354606376489), 'my2FlipEarly': 40.66909296816344, 'behindMid': -(1933.7821806304128), 'diffColsEarly': -(209.25096900323118), 'your1PathExtensionEnd': -(173.51557968140128), 'your3PathExtensionEnd': -(125.1366046214846), 'yourLongestPathSquaredEarly': 52.62732974783529, 'yourLongestSafePathEnd': -(3180.335506852734), 'turnsAheadSquaredEnd': 6469.693355464642, 'my1Empty': 25.339804580156635, 'yourTurnsAwaySquaredEarly': -(694.3889714955675), 'diffLongestPermPathMid': 1193.0035643679787, 'my2Empty': 21.546682753424772, 'myLongestPermPathEnd': 8018.303459019255});
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
				var __iterable0__ = weights.py_keys ();
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
					return 10000000000;
				}
				else if (self.isWinner (state, self.otherPlayer (player))) {
					return -(10000000000);
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
			get findEvenPathLength () {return __get__ (this, function (self, board, player, row, col) {
				var farthestCol = -(1);
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (self.evenSpaces [i] [j] == player) {
						if (j > farthestCol) {
							var farthestCol = j;
						}
						if (j == 11) {
							return 11;
						}
						else if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var maxCol = self.findEvenPathLength (board, player, i, j);
							if (maxCol > farthestCol) {
								var farthestCol = maxCol;
							}
						}
					}
				}
				return farthestCol;
			});},
			get findLongestEvenPath () {return __get__ (this, function (self, board, player) {
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
					if (self.evenSpaces [i] [j] == player) {
						if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var newPath = self.findEvenPathLength (board, player, i, j) - j;
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
			get findSafePathLength () {return __get__ (this, function (self, board, player, row, col) {
				var farthestCol = -(1);
				var __iterable0__ = self.surroundingPlaces (row, col);
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (self.safeSpaces [i] [j] == player) {
						if (j > farthestCol) {
							var farthestCol = j;
						}
						if (j == 11) {
							return 11;
						}
						else if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var maxCol = self.findSafePathLength (board, player, i, j);
							if (maxCol > farthestCol) {
								var farthestCol = maxCol;
							}
						}
					}
				}
				return farthestCol;
			});},
			get findLongestSafePath () {return __get__ (this, function (self, board, player) {
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
					if (self.safeSpaces [i] [j] == player) {
						if (!(self.alreadyChecked [i] [j])) {
							self.alreadyChecked [i] [j] = true;
							var newPath = self.findSafePathLength (board, player, i, j) - j;
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
								self.leftEdges = self.leftEdges + leftEdges;
								self.rightEdges = self.rightEdges + rightEdges;
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
				var pathExtensionCount = function () {
					var __accu0__ = [];
					for (var _ = 0; _ < 3; _++) {
						__accu0__.append (0);
					}
					return __accu0__;
				} ();
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
					var pathExtension = futurePath - longestPath;
					if (pathExtension > 0) {
						leftFrontierMoves++;
						pathExtensionCount [min (pathExtension - 1, 2)]++;
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
					var pathExtension = futurePath - longestPath;
					if (pathExtension > 0) {
						rightFrontierMoves++;
						pathExtensionCount [min (pathExtension - 1, 2)]++;
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
							var pathExtension = futurePath - longestPath;
							if (pathExtension > 0) {
								leftFrontierMoves++;
								pathExtensionCount [min (pathExtension - 1, 2)]++;
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
							var pathExtension = futurePath - longestPath;
							if (pathExtension > 0) {
								rightFrontierMoves++;
								pathExtensionCount [min (pathExtension - 1, 2)]++;
								if (futurePath > longestFuturePath) {
									var longestFuturePath = futurePath;
								}
							}
						}
					}
				}
				return tuple ([longestFuturePath, leftFrontierMoves, rightFrontierMoves, pathExtensionCount]);
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
			get printBoard () {return __get__ (this, function (self, state) {
				var __left0__ = state;
				var board = __left0__ [0];
				var player = __left0__ [1];
				var header = ' ';
				for (var col = 0; col < 12; col++) {
					header += __mod__ ('   %c', chr (ord ('A') + col));
				}
				print (header);
				var rowNum = 1;
				var __iterable0__ = board;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var row = __iterable0__ [__index0__];
					var rowPrint = __mod__ ('%d', rowNum);
					rowNum++;
					var __iterable1__ = row;
					for (var __index1__ = 0; __index1__ < __iterable1__.length; __index1__++) {
						var col = __iterable1__ [__index1__];
						rowPrint += __mod__ ('   %c', col);
					}
					print (rowPrint);
				}
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
			get getFlipPotential () {return __get__ (this, function (self, row, col, board, player) {
				var neighbors = self.surroundingPlaces (row, col);
				var myFlipPotential = 0;
				var yourFlipPotential = 0;
				var otherPlayer = self.otherPlayer (player);
				var __iterable0__ = neighbors;
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var neighbor = __iterable0__ [__index0__];
					var __left0__ = neighbor;
					var i = __left0__ [0];
					var j = __left0__ [1];
					if (board [i] [j] == otherPlayer) {
						myFlipPotential++;
					}
					else if (board [i] [j] == player) {
						yourFlipPotential++;
					}
				}
				var flipPotential = tuple ([myFlipPotential, yourFlipPotential]);
				return flipPotential;
			});},
			get findLengthAfterFlip () {return __get__ (this, function (self, board, player, i, j) {
				var action = tuple ([i, j, true]);
				var newState = game.simulatedMove (tuple ([board, player]), action);
				var __left0__ = newState;
				var newBoard = __left0__ [0];
				var otherPlayer = __left0__ [1];
				return game.longestPath (newBoard, player);
			});},
			get isCorner () {return __get__ (this, function (self, i, j) {
				return (i == 0 || i == 7) && (j == 0 || j == 11);
			});},
			get isEdge () {return __get__ (this, function (self, i, j) {
				return i == 0 || i == 7;
			});},
			get smartFeaturesTDL () {return __get__ (this, function (self, board, player) {
				var featureNames = list (['diffLongestPermPathSquared', 'your8Empty', 'your5Empty', 'myLongestEvenPathSquared', 'yourLongestPath', 'futureAhead', 'your2PathExtension', 'my6Empty', 'diff4Flip', 'yourLongestPermPathSquared', 'my3PathExtension', 'yourClosedPathFlex', 'turnsAhead', 'my3EdgeEmpty', 'blockedMyLeft', 'diffLongestFuturePathSquared', 'ahead', 'myLongestPathSquared', 'yourLongestFuturePathSquared', 'myLongestExtension', 'myLongestPermPath', 'your1Flip', 'my8Empty', 'your4Flip', 'diffCols', 'diffLongestSafePath', 'diffLongestFuturePath', 'your2EdgeEmpty', 'yourLongestPathSquared', 'your6Empty', 'my1PathExtension', 'diff2Flip', 'diff2Empty', 'your2Flip', 'yourOpenPathFlex', 'diff1Empty', 'onlyTurnAway', 'diff4Empty', 'myTurnsAway', 'diffLongestPermPath', 'myLongestEvenPath', 'my2PathExtension', 'my4Empty', 'yourTurnsAwaySquared', 'myOpenPathFlex', 'my2Flip', 'my4EdgeEmpty', 'yourTurnsAway', 'my5Empty', 'diffTotal', 'diffLongestSafePathSquared', 'diffLongestEvenPath', 'yourCols', 'blockedYourLeft', 'myCols', 'blockedMe', 'myLongestFuturePath', 'amTurnsAhead', 'blockedYourRight', 'amTurnsBehind', 'myTurnsAwaySquared', 'myPerm', 'diffLongestPathSquared', 'myLongestFuturePathSquared', 'diff3Empty', 'myLongestSafePathSquared', 'my1EdgeEmpty', 'my3Empty', 'my1Flip', 'my1Empty', 'yourLongestFuturePath', 'my2Empty', 'myLongestSafePath', 'diff1EdgeEmpty', 'my7Empty', 'your4Empty', 'myLongestPermPathSquared', 'myOneTurnAway', 'behind', 'your3EdgeEmpty', 'your3PathExtension', 'diff3EdgeEmpty', 'your2Empty', 'yourLongestEvenPathSquared', 'diffPerm', 'your1EdgeEmpty', 'your3Empty', 'myClosedPathFlex', 'my3Flip', 'diff2EdgeEmpty', 'diffLongestEvenPathSquared', 'futureBehind', 'your1PathExtension', 'diff1Flip', 'diff3Flip', 'yourLongestEvenPath', 'yourLongestSafePathSquared', 'your7Empty', 'my2EdgeEmpty', 'yourLongestSafePath', 'diff4EdgeEmpty', 'diffLongestPath', 'your4EdgeEmpty', 'blockedYou', 'blockedMyRight', 'yourPerm', 'yourLongestPermPath', 'my4Flip', 'your3Flip', 'yourTotal', 'yourOneTurnAway', 'yourLongestExtension', 'myTotal', 'your1Empty', 'myLongestPath', 'turnsAheadSquared']);
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
				self.evenSpaces = function () {
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
				self.safeSpaces = function () {
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
						self.evenSpaces [i] [j] = player;
						self.safeSpaces [i] [j] = player;
						if (myCols [j] == 0) {
							myCols [j] = 1;
						}
					}
					else if (board [i] [j] == self.otherPlayer (player).upper ()) {
						features ['yourPerm']++;
						features ['yourTotal']++;
						self.permSpaces [i] [j] = self.otherPlayer (player);
						self.evenSpaces [i] [j] = self.otherPlayer (player);
						self.safeSpaces [i] [j] = self.otherPlayer (player);
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
							self.evenSpaces [i] [j] = player;
							self.safeSpaces [i] [j] = player;
						}
						else if (self.isEdge (i, j)) {
							if (numEmptyNeighbors == 1) {
								features ['my1EdgeEmpty']++;
							}
							else if (numEmptyNeighbors == 2) {
								features ['my2EdgeEmpty']++;
								self.evenSpaces [i] [j] = player;
								self.safeSpaces [i] [j] = player;
							}
							else if (numEmptyNeighbors == 3) {
								features ['my3EdgeEmpty']++;
							}
							else if (numEmptyNeighbors >= 4) {
								features ['my4EdgeEmpty']++;
								self.safeSpaces [i] [j] = player;
							}
						}
						else if (numEmptyNeighbors == 1) {
							features ['my1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['my2Empty']++;
							self.evenSpaces [i] [j] = player;
							self.safeSpaces [i] [j] = player;
						}
						else if (numEmptyNeighbors == 3) {
							features ['my3Empty']++;
						}
						else if (numEmptyNeighbors >= 4) {
							features ['my4Empty']++;
							self.safeSpaces [i] [j] = player;
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
							self.evenSpaces [i] [j] = self.otherPlayer (player);
							self.safeSpaces [i] [j] = self.otherPlayer (player);
						}
						else if (self.isEdge (i, j)) {
							if (numEmptyNeighbors == 1) {
								features ['your1EdgeEmpty']++;
							}
							else if (numEmptyNeighbors == 2) {
								features ['your2EdgeEmpty']++;
								self.evenSpaces [i] [j] = self.otherPlayer (player);
								self.safeSpaces [i] [j] = self.otherPlayer (player);
							}
							else if (numEmptyNeighbors == 3) {
								features ['your3EdgeEmpty']++;
							}
							else if (numEmptyNeighbors >= 4) {
								features ['your4EdgeEmpty']++;
								self.safeSpaces [i] [j] = self.otherPlayer (player);
							}
						}
						else if (numEmptyNeighbors == 1) {
							features ['your1Empty']++;
						}
						else if (numEmptyNeighbors == 2) {
							features ['your2Empty']++;
							self.evenSpaces [i] [j] = self.otherPlayer (player);
							self.safeSpaces [i] [j] = self.otherPlayer (player);
						}
						else if (numEmptyNeighbors == 3) {
							features ['your3Empty']++;
						}
						else if (numEmptyNeighbors >= 4) {
							features ['your4Empty']++;
							self.safeSpaces [i] [j] = self.otherPlayer (player);
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
				features ['diff1Empty'] = features ['my1Empty'] - features ['your1Empty'];
				features ['diff2Empty'] = features ['my2Empty'] - features ['your2Empty'];
				features ['diff3Empty'] = features ['my3Empty'] - features ['your3Empty'];
				features ['diff4Empty'] = features ['my4Empty'] - features ['your4Empty'];
				features ['diff1EdgeEmpty'] = features ['my1EdgeEmpty'] - features ['your1EdgeEmpty'];
				features ['diff2EdgeEmpty'] = features ['my2EdgeEmpty'] - features ['your2EdgeEmpty'];
				features ['diff3EdgeEmpty'] = features ['my3EdgeEmpty'] - features ['your3EdgeEmpty'];
				features ['diff4EdgeEmpty'] = features ['my4EdgeEmpty'] - features ['your4EdgeEmpty'];
				features ['diff1Flip'] = features ['my1Flip'] - features ['your1Flip'];
				features ['diff2Flip'] = features ['my2Flip'] - features ['your2Flip'];
				features ['diff3Flip'] = features ['my3Flip'] - features ['your3Flip'];
				features ['diff4Flip'] = features ['my4Flip'] - features ['your4Flip'];
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
				var numMyCols = sum (myCols);
				var numYourCols = sum (yourCols);
				features ['myCols'] = numMyCols / 12.0;
				features ['yourCols'] = numYourCols / 12.0;
				features ['diffCols'] = (numMyCols - numYourCols) / 12.0;
				var myLongestPermPath = self.findLongestPermPath (board, player);
				features ['myLongestPermPath'] = myLongestPermPath / 12.0;
				features ['myLongestPermPathSquared'] = Math.pow (myLongestPermPath, 2) / 144.0;
				var myLongestEvenPath = self.findLongestEvenPath (board, player);
				features ['myLongestEvenPath'] = myLongestEvenPath / 12.0;
				features ['myLongestEvenPathSquared'] = Math.pow (myLongestEvenPath, 2) / 144.0;
				var myLongestSafePath = self.findLongestSafePath (board, player);
				features ['myLongestSafePath'] = myLongestSafePath / 12.0;
				features ['myLongestSafePathSquared'] = Math.pow (myLongestSafePath, 2) / 144.0;
				var yourLongestPermPath = self.findLongestPermPath (board, self.otherPlayer (player));
				features ['yourLongestPermPath'] = yourLongestPermPath / 12.0;
				features ['yourLongestPermPathSquared'] = Math.pow (yourLongestPermPath, 2) / 144.0;
				var yourLongestEvenPath = self.findLongestEvenPath (board, self.otherPlayer (player));
				features ['yourLongestEvenPath'] = yourLongestEvenPath / 12.0;
				features ['yourLongestEvenPathSquared'] = Math.pow (yourLongestEvenPath, 2) / 144.0;
				var yourLongestSafePath = self.findLongestSafePath (board, self.otherPlayer (player));
				features ['yourLongestSafePath'] = yourLongestSafePath / 12.0;
				features ['yourLongestSafePathSquared'] = Math.pow (yourLongestSafePath, 2) / 144.0;
				var diffLongestPermPath = myLongestPermPath - yourLongestPermPath;
				var diffLongestEvenPath = myLongestEvenPath - yourLongestEvenPath;
				var diffLongestSafePath = myLongestSafePath - yourLongestSafePath;
				features ['diffLongestPermPath'] = diffLongestPermPath / 12.0;
				features ['diffLongestEvenPath'] = diffLongestEvenPath / 12.0;
				features ['diffLongestSafePath'] = diffLongestSafePath / 12.0;
				features ['diffLongestPermPathSquared'] = (diffLongestPermPath * abs (diffLongestPermPath)) / 144.0;
				features ['diffLongestEvenPathSquared'] = (diffLongestEvenPath * abs (diffLongestEvenPath)) / 144.0;
				features ['diffLongestSafePathSquared'] = (diffLongestSafePath * abs (diffLongestSafePath)) / 144.0;
				var myLongestPath = self.findLongestPathEdges (board, player);
				features ['myLongestPath'] = myLongestPath / 12.0;
				features ['myLongestPathSquared'] = Math.pow (myLongestPath, 2) / 144.0;
				var __left0__ = self.findLongestFuturePath (board, player, myLongestPath);
				var myLongestFuturePath = __left0__ [0];
				var myLeftFrontierFlex = __left0__ [1];
				var myRightFrontierFlex = __left0__ [2];
				var myPathExtensionCount = __left0__ [3];
				var myPathFlex = myLeftFrontierFlex + myRightFrontierFlex;
				features ['myLongestFuturePath'] = myLongestFuturePath / 12.0;
				features ['myLongestFuturePathSquared'] = Math.pow (myLongestFuturePath, 2) / 144.0;
				var myOneTurnAway = myLongestFuturePath == 12;
				features ['myOneTurnAway'] = myOneTurnAway;
				var myPathOnLeftEdge = len (self.leftEdges) > 0 && self.leftEdges [0] [1] == 0;
				var myPathOnRightEdge = len (self.rightEdges) > 0 && self.rightEdges [0] [1] == 11;
				features ['blockedMyLeft'] = false;
				features ['blockedMyRight'] = false;
				if (myLongestPath <= 1 || myLongestPath == 12) {
					var blockedMe = false;
				}
				else if (myLeftFrontierFlex == 0 && len (self.leftEdges) > 0 && !(myPathOnLeftEdge)) {
					var blockedMe = true;
					features ['blockedMyLeft'] = true;
				}
				else if (myRightFrontierFlex == 0 && len (self.rightEdges) > 0 && !(myPathOnRightEdge)) {
					var blockedMe = true;
					features ['blockedMyRight'] = true;
				}
				else {
					var blockedMe = false;
				}
				features ['blockedMe'] = blockedMe;
				var myTurnsAway = (12.0 - myLongestFuturePath) + 2.0 * (features ['blockedMyLeft'] + features ['blockedMyRight']);
				features ['myTurnsAway'] = myTurnsAway / 12.0;
				features ['myTurnsAwaySquared'] = Math.pow (myTurnsAway, 2) / 144.0;
				if ((myPathOnLeftEdge || myPathOnRightEdge) && myLongestPath != 12) {
					features ['myOpenPathFlex'] = 0;
					features ['myClosedPathFlex'] = ((myLongestPath / 12.0) * myPathFlex) / 96.0;
				}
				else if (myLongestPath != 12) {
					features ['myOpenPathFlex'] = ((myLongestPath / 12.0) * myPathFlex) / 96.0;
					features ['myClosedPathFlex'] = 0;
				}
				else {
					features ['myOpenPathFlex'] = 0;
					features ['myClosedPathFlex'] = 0;
				}
				features ['my1PathExtension'] = (((myLongestPath + 1) / 12.0) * myPathExtensionCount [0]) / 96.0;
				features ['my2PathExtension'] = (((myLongestPath + 2) / 12.0) * myPathExtensionCount [1]) / 96.0;
				features ['my3PathExtension'] = ((myLongestFuturePath / 12.0) * myPathExtensionCount [2]) / 96.0;
				features ['myLongestExtension'] = (myLongestFuturePath - myLongestPath) / 12.0;
				var yourLongestPath = self.findLongestPathEdges (board, self.otherPlayer (player));
				features ['yourLongestPath'] = yourLongestPath / 12.0;
				features ['yourLongestPathSquared'] = Math.pow (yourLongestPath, 2) / 144.0;
				var __left0__ = self.findLongestFuturePath (board, self.otherPlayer (player), yourLongestPath);
				var yourLongestFuturePath = __left0__ [0];
				var yourLeftFrontierFlex = __left0__ [1];
				var yourRightFrontierFlex = __left0__ [2];
				var yourPathExtensionCount = __left0__ [3];
				var yourPathFlex = yourLeftFrontierFlex + yourRightFrontierFlex;
				features ['yourLongestFuturePath'] = yourLongestFuturePath / 12.0;
				features ['yourLongestFuturePathSquared'] = Math.pow (yourLongestFuturePath, 2) / 144.0;
				var yourOneTurnAway = yourLongestFuturePath == 12;
				features ['yourOneTurnAway'] = yourOneTurnAway;
				var yourPathOnLeftEdge = len (self.leftEdges) > 0 && self.leftEdges [0] [1] == 0;
				var yourPathOnRightEdge = len (self.rightEdges) > 0 && self.rightEdges [0] [1] == 11;
				features ['blockedYourLeft'] = false;
				features ['blockedYourRight'] = false;
				if (yourLongestPath <= 1 || yourLongestPath == 12) {
					var blockedYou = false;
				}
				else if (yourLeftFrontierFlex == 0 && len (self.leftEdges) > 0 && !(yourPathOnLeftEdge)) {
					var blockedYou = true;
					features ['blockedYourLeft'] = true;
				}
				else if (yourRightFrontierFlex == 0 && len (self.rightEdges) > 0 && !(yourPathOnRightEdge)) {
					var blockedYou = true;
					features ['blockedYourRight'] = true;
				}
				else {
					var blockedYou = false;
				}
				features ['blockedYou'] = blockedYou;
				var yourTurnsAway = (12.0 - yourLongestFuturePath) + 2.0 * (features ['blockedYourLeft'] + features ['blockedYourRight']);
				features ['yourTurnsAway'] = yourTurnsAway / 12.0;
				features ['yourTurnsAwaySquared'] = Math.pow (yourTurnsAway, 2) / 144.0;
				if ((yourPathOnLeftEdge || yourPathOnRightEdge) && yourLongestPath != 12) {
					features ['yourOpenPathFlex'] = 0;
					features ['yourClosedPathFlex'] = ((yourLongestPath / 12.0) * yourPathFlex) / 96.0;
				}
				else if (yourLongestPath != 12) {
					features ['yourOpenPathFlex'] = ((yourLongestPath / 12.0) * yourPathFlex) / 96.0;
					features ['yourClosedPathFlex'] = 0;
				}
				else {
					features ['yourOpenPathFlex'] = 0;
					features ['yourClosedPathFlex'] = 0;
				}
				features ['your1PathExtension'] = (((yourLongestPath + 1) / 12.0) * yourPathExtensionCount [0]) / 96.0;
				features ['your2PathExtension'] = (((yourLongestPath + 2) / 12.0) * yourPathExtensionCount [1]) / 96.0;
				features ['your3PathExtension'] = ((yourLongestFuturePath / 12.0) * yourPathExtensionCount [2]) / 96.0;
				features ['yourLongestExtension'] = (yourLongestFuturePath - yourLongestPath) / 12.0;
				var diffLongestPath = myLongestPath - yourLongestPath;
				features ['diffLongestPath'] = diffLongestPath / 12.0;
				features ['diffLongestPathSquared'] = (diffLongestPath * abs (diffLongestPath)) / 144.0;
				var diffLongestFuturePath = myLongestFuturePath - yourLongestFuturePath;
				features ['diffLongestFuturePath'] = diffLongestFuturePath / 12.0;
				features ['diffLongestFuturePathSquared'] = (diffLongestFuturePath * abs (diffLongestFuturePath)) / 144.0;
				features ['ahead'] = myLongestPath > yourLongestPath;
				features ['behind'] = myLongestPath < yourLongestPath;
				features ['futureAhead'] = myLongestFuturePath > yourLongestFuturePath;
				features ['futureBehind'] = myLongestFuturePath < yourLongestFuturePath;
				features ['onlyTurnAway'] = myOneTurnAway && !(yourOneTurnAway);
				var turnsAhead = yourTurnsAway - myTurnsAway;
				features ['turnsAhead'] = turnsAhead / 12.0;
				features ['turnsAheadSquared'] = (turnsAhead * abs (turnsAhead)) / 144.0;
				features ['amTurnsAhead'] = turnsAhead > 0;
				features ['amTurnsBehind'] = turnsAhead < 0;
				var maxPath = max (myLongestPath, yourLongestPath);
				var early = false;
				var mid = false;
				var end = false;
				if (maxPath <= 4) {
					var early = true;
				}
				else if (maxPath <= 8) {
					var mid = true;
				}
				else {
					var end = true;
				}
				var __iterable0__ = features.py_items ();
				for (var __index0__ = 0; __index0__ < __iterable0__.length; __index0__++) {
					var __left0__ = __iterable0__ [__index0__];
					var featureName = __left0__ [0];
					var featureValue = __left0__ [1];
					var earlyFeature = featureName + 'Early';
					features [earlyFeature] = featureValue * early;
					var midFeature = featureName + 'Mid';
					features [midFeature] = featureValue * mid;
					var endFeature = featureName + 'End';
					features [endFeature] = featureValue * end;
				}
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
				document.getElementById ('modalInformation').innerHTML = '<h2>Player 1</h2><br><select class="soflow" id="player1"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Features</option><option>PAI Advanced Features</option><option>PAI TDL</option><option>PAI Minimax</option><option>PAI Beam Minimax</option><option>PAI Advanced Beam Minimax</option><option>PAI TDL Beam Minimax</option><option>PAI Expectimax</option><option>PAI MCS</option><option>PAI MCTS</option></select><input type="text" style="display: inline;" id="player1name" value="Player 1"><br><h2>Player 2</h2><br><select class="soflow" id="player2"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Features</option><option>PAI Advanced Features</option><option>PAI TDL</option><option>PAI Minimax</option><option>PAI Beam Minimax</option><option>PAI Advanced Beam Minimax</option><option>PAI TDL Beam Minimax</option><option>PAI Expectimax</option><option>PAI MCS</option><option>PAI MCTS</option></select><input type="text" style="display: inline;" id="player2name" value="Player 2"><br><a href="#" onclick="closeModal(); pathwayzGame.gameManager.setPlayers();">Start Game</a></div>';
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
