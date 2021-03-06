import random
import math

trainingWeights = {}

class Node:
    def __init__(self,curState,children,utility,visits,parent,action):
        self.action = action
        self.state = curState
        self.children = children
        self.utility = utility
        self.visits = visits
        self.parent = parent

def select (node):
    if node.visits == 0 or len(node.children) == 0:
        return node
    for i in range(len(node.children)):
          if node.children[i].visits == 0:
            return node.children[i]
    result = random.choice(node.children)
    score = selectfn(result)
    for i in range(len(node.children)):
        newNode = node.children[i]
        if newNode != result:
            newScore = selectfn(newNode)
            if newScore > score:
                score = newScore
                result = newNode
    return select(result)

def expand (game, node):
    # Collect legal moves and successor states
    state = node.state
    board, player = state
    sortedChildren = []
    for move in game.actions(state):
        newState = game.simulatedMove(state, move)
        newBoard, newPlayer = newState
        newNode = Node(newState, [], evaluationFunction(game, newBoard, player), 0, node, move)
        sortedChildren.append(newNode)
    sortedChildren = sorted(sortedChildren, key=lambda score: score.utility, reverse=True)

    node.children = sortedChildren[:10]

    return node

def selectfn(node):
    return node.utility/node.visits+math.sqrt(2*math.log(node.parent.visits)/node.visits)

def backpropagate(node,score):
    node.visits += 1
    node.utility = node.utility+score
    if node.parent:
        backpropagate(node.parent,score)

def MCTSdepthCharge(game,node,originalPlayer):
    state = node.state
    if game.isEnd(state):
        if game.isWinner(state,state[1]):
            if originalPlayer:
                backpropagate(node,1)
                return
            else:
                backpropagate(node,0)
                return
        elif (game.isWinner(state,game.otherPlayer(state[1]))):
            if originalPlayer:
                backpropagate(node,0)
                return
            else:
                backpropagate(node,1)
                return
    moves = game.actions(state)
    rand = random.choice(moves)
    newState = game.simulatedMove(state, rand)
    for child in node.children:
        if child.state == newState:
            MCTSdepthCharge(game, child, not originalPlayer)
            return
    newNode = Node(newState,[],0.0,0.0,node,rand)
    node.children.append(newNode)
    MCTSdepthCharge(game, newNode, not originalPlayer)

def monteCarloTreeSearch(game,state):
    rootNode = Node(state,[],0.0,0.0,None,None)
    count = 200000
    node = rootNode
    for action in game.actions(state):
        if game.isWinner(game.simulatedMove(state,action),state[1]):
            return action
    for i in range(count):
        node = select(node)
        node = expand(game,node)
        for child in node.children:
            MCTSdepthCharge(game, child, False)
    move = sorted(rootNode.children, key=lambda c: c.utility/c.visits, reverse=True)[0].action
    return move

def monteCarloSearch(game, state):
    board, player = state
    scoredMoves = []
    moves = shuffle(game.actions(state))
    for move in moves:
        newBoard, newPlayer = game.simulatedMove(state, move)
        score = evaluationFunction(game, newBoard, player)
        scoredMoves.append((move, score))
    scoredMoves = sorted(scoredMoves, key=lambda scoredMove: scoredMove[1], reverse=True)
    # TODO: try expanding 30
    # TODO: prune all useless permanent moves (no neigbors)
    children = scoredMoves[:5]
    count = 100
    childrenScores = []
    for i in range(len(children)):
        move = children[i]
        monteScore = 0
        newState = game.simulatedMove(state,move[0])
        for j in range(count):
            monteScore += depthCharge(game, newState, False)
        monteScore = float(monteScore) / count
        childrenScores.append((move, monteScore))
    childrenScores = sorted(childrenScores, key=lambda child: child[1], reverse=True)
    bestMove, _ = childrenScores[0]
    return bestMove[0]

def depthCharge(game, state, originalPlayer):
    #print("Charge")
    board, player = state
    if game.isEnd(state):
        if originalPlayer:
            return evaluationFunction(game, board, player)
        else:
            return -evaluationFunction(game, board, game.otherPlayer(player))
    moves = game.actions(state)
    nextMove = random.choice(moves)
    newState = game.simulatedMove(state, nextMove)
    return depthCharge(game, newState, not originalPlayer)

def randomMove(game, state):
    # Taking in a game and state, returns a random valid move
    return random.choice(game.actions(state))

def baselineMove(game, state):
    _, player = state
    bestPath = 0
    options = []
    actions = game.actions(state)
    for action in actions:
        newState = game.simulatedMove(state, action)
        newBoard, _ = newState
        newPathLength = game.longestPath(newBoard, player)
        if newPathLength > bestPath:
            bestPath = newPathLength
            options = [action]
        elif newPathLength == bestPath:
            options.append(action)
    if len(options) == 0:
        return randomMove(game, state)
    return random.choice(options)

def advancedBaselineMove(game, state):
    _, player = state
    bestScore = 0
    options = []
    actions = game.actions(state)
    for action in actions:
        newState = game.simulatedMove(state, action)
        newBoard, _ = newState
        newScore = game.longestPath(newBoard, player) - 0.4 * game.longestPath(newBoard, game.otherPlayer(player))
        if newScore > bestScore:
            bestScore = newScore
            options = [action]
        elif newScore == bestScore:
            options.append(action)
    if len(options) == 0:
        return randomMove(game, state)
    return random.choice(options)

def featuresMove(game, state):
    _, player = state
    bestScore = 0
    options = []
    actions = game.actions(state)
    for action in actions:
        newState = game.simulatedMove(state, action)
        newBoard, _ = newState
        newScore = evaluationFunction(game, newBoard, player)
        if newScore > bestScore:
            bestScore = newScore
            options = [action]
        elif newScore == bestScore:
            options.append(action)
    if len(options) == 0:
        return randomMove(game, state)
    return random.choice(options)

def smartFeaturesMove(game, state):
    _, player = state
    bestScore = 0
    options = []
    actions = game.actions(state)
    for action in actions:
        newState = game.simulatedMove(state, action)
        newBoard, _ = newState
        newScore = smartEvaluationFunction(game, newBoard, player)
        if newScore > bestScore:
            bestScore = newScore
            options = [action]
        elif newScore == bestScore:
            options.append(action)
    if len(options) == 0:
        return randomMove(game, state)
    return random.choice(options)

def TDLfeaturesMove(game, state):
    _, player = state
    bestScore = -float("inf")
    options = []
    actions = game.actions(state)
    for action in actions:
        newState = game.simulatedMove(state, action)
        newBoard, _ = newState
        newScore = TDLevaluationFunction(game, newBoard, player)
        #print(newScore)
        if newScore > bestScore:
            bestScore = newScore
            options = [action]
        elif newScore == bestScore:
            options.append(action)
    if len(options) == 0:
        # print("hello...")
        return randomMove(game, state)
    return random.choice(options)

def value(game, state, depth, alpha, beta, originalPlayer):
    board, player = state
    if game.isEnd(state) or depth == 0:
        if originalPlayer:
            return evaluationFunction(game, board, player)
        else:
            return evaluationFunction(game, board, game.otherPlayer(player))
    elif originalPlayer:
        highestScore = -float('inf')
        for action in game.actions(state):
            score = value(game, game.simulatedMove(state, action), depth-1, alpha, beta, False)
            highestScore = MAX([highestScore, score])
            alpha = MAX([alpha, highestScore])
            if beta <= alpha:
                break
        return highestScore
    else:
        lowestScore = float('inf')
        for action in game.actions(state):
            score = value(game, game.simulatedMove(state, action), depth-1, alpha, beta, True)
            lowestScore = MIN([lowestScore, score])
            beta = MIN([beta, lowestScore])
            if beta <= alpha:
                break
        return lowestScore

def MAX(array):
    currMax = -float('inf')
    for x in array:
        if x > currMax:
            currMax = x
    return currMax

def MIN(array):
    currMin = float('inf')
    for x in array:
        if x < currMin:
            currMin = x
    return currMin

def minimax(game, state):
    # Collect legal moves and successor states
    board, player = state
    tempBoard = [row[:] for row in board]
    legalMoves = game.actions(state)
    scores = [value(game, game.simulatedMove((tempBoard, player), action), 1, -float('inf'), float('inf'), False) for action in legalMoves]
    bestScore = MAX(scores)
    bestIndices = [index for index in range(len(scores)) if scores[index] == bestScore]
    chosenIndex = random.choice(bestIndices) # Pick randomly among the best
    return legalMoves[chosenIndex]

def advancedMinimax(game, state):
    # Collect legal moves and successor states
    board, player = state
    tempBoard = [row[:] for row in board]
    legalMoves = game.actions(state)
    piecesPlayed = 96 - 0.5 * len(legalMoves)
    depth = int(piecesPlayed / 30)
    print(depth)
    scores = [value(game, game.simulatedMove((tempBoard, player), action), depth, -float('inf'), float('inf'), False) for action in legalMoves]
    bestScore = MAX(scores)
    bestIndices = [index for index in range(len(scores)) if scores[index] == bestScore]
    chosenIndex = random.choice(bestIndices) # Pick randomly among the best
    return legalMoves[chosenIndex]

def shuffle(array):
    currentIndex = len(array)
    while 0 != currentIndex:
        randomIndex = int(random.random() * currentIndex)
        currentIndex -= 1
        tempValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = tempValue
    return array

def oneMoveAway(game, board, player):
    actions = game.actions((board, player))
    winningActions = []
    for action in actions:
        if game.isWinner(game.simulatedMove((board, player), action), player):
            return True
    return False

def beamScores(game, state, depth, beamWidth, evalFunction):
    board, player = state
    if game.isEnd(state) or depth == 0:
        return [(evalFunction(game, board, player), None, state)]
    actions = shuffle(game.actions(state))
    numTopScores = beamWidth[depth-1]
    if numTopScores == None: numTopScores = len(actions)
    topScores = [(-float('inf'), None, None) for i in range(numTopScores)]
    newStates = []
    for action in actions:
        newBoard, newPlayer = game.simulatedMove(state, action)
        newScore = evalFunction(game, newBoard, player)
        minScore = sorted(topScores, key=lambda score: score[0])[0]
        if newScore > minScore[0]:
            topScores.remove(minScore)
            topScores.append((newScore, action, (newBoard, newPlayer)))
    newTopScores = []
    for score, action, newState in topScores:
        _, _, lastState = sorted(beamScores(game, newState, depth-1, beamWidth, evalFunction), key=lambda score: score[0], reverse=True)[0]
        newTopScores.append((evalFunction(game, lastState[0], player), action, lastState))
    return newTopScores

def beamMinimax(game, state):
    board, player = state
    if oneMoveAway(game, board, game.otherPlayer(player)):
        depth = 2
        beamWidth = [None, None]
    else:
        depth = 3
        beamWidth = [1, 5, 10]
    scores = beamScores(game, state, depth, beamWidth, evaluationFunction)
    _, bestMove, _ = sorted(scores, key=lambda score: score[0], reverse=True)[0]
    return bestMove

def beamMinimaxMoreFeatures(game, state):
    board, player = state
    if oneMoveAway(game, board, game.otherPlayer(player)):
        depth = 2
        beamWidth = [None, None]
    else:
        depth = 3
        beamWidth = [1, 5, 10]
    scores = beamScores(game, state, depth, beamWidth, smartEvaluationFunction)
    _, bestMove, _ = sorted(scores, key=lambda score: score[0], reverse=True)[0]
    return bestMove

def beamMinimaxTDL(game, state):
    board, player = state
    if oneMoveAway(game, board, game.otherPlayer(player)):
        depth = 2
        beamWidth = [None, None]
    # ELSEIF NO WAY TO EXTEND LONGEST PATH...
    else:
        depth = 3
        beamWidth = [1, 5, 10]
    scores = beamScores(game, state, depth, beamWidth, TDLevaluationFunction)
    _, bestMove, _ = sorted(scores, key=lambda score: score[0], reverse=True)[0]
    return bestMove

def AVG(scores):
    scores = sorted(scores)
    weightedTotal = 0
    """
    for i in range(len(scores)):
        weightedTotal += scores[i] / (2 ^ (i+1))
    """
    for i in range(min(5, len(scores))):
        weightedTotal += scores[i] / (2 ^ (i+1))
    return weightedTotal

def valueExpectimax(game, state, depth, originalPlayer):
    board, player = state
    if game.isEnd(state) or depth == 0:
        if originalPlayer:
            return TDLevaluationFunction(game, board, player)
        else:
            return TDLevaluationFunction(game, board, game.otherPlayer(player))
    elif originalPlayer:
        highestScore = -float('inf')
        for action in game.actions(state):
            score = valueExpectimax(game, game.simulatedMove(state, action), depth-1, False)
            highestScore = MAX([highestScore, score])
        return highestScore
    else:
        scores = []
        for action in game.actions(state):
            score = valueExpectimax(game, game.simulatedMove(state, action), depth-1, True)
            scores.append(score)
        sortedScores = sorted(scores, reverse=True)
        #print(sortedScores)
        expectedScore = 0
        for i in range(min(5, len(sortedScores))):
            expectedScore += sortedScores[i]
        expectedScore = expectedScore / 5.0
        return expectedScore

def advancedExpectimax(game, state):
    # Collect legal moves and successor states
    board, player = state
    if oneMoveAway(game, board, game.otherPlayer(player)):
        return beamMinimax(game, state)
    tempBoard = [row[:] for row in board]
    legalMoves = game.actions(state)
    piecesPlayed = 96 - 0.5 * len(legalMoves)
    depth = int(piecesPlayed / 20)
    #depth = 2
    #print(depth)
    scores = [valueExpectimax(game, game.simulatedMove((tempBoard, player), action), depth, False) for action in legalMoves]
    bestScore = MAX(scores)
    bestIndices = [index for index in range(len(scores)) if scores[index] == bestScore]
    chosenIndex = random.choice(bestIndices) # Pick randomly among the best
    return legalMoves[chosenIndex]

def featureExtractor(game, board, player):
    # Extracts and returns features as a list
    myLongestPath = game.longestPath(board, player)
    yourLongestPath = game.longestPath(board, game.otherPlayer(player))
    myNumPermanents, yourNumPermanents, myNum1EmptyNeighbor, yourNum1EmptyNeighbor, myNum2EmptyNeighbor, yourNum2EmptyNeighbor, differenceNumPieces = game.countPieces(board, player)
    return [myLongestPath, yourLongestPath, myNumPermanents, yourNumPermanents, myNum1EmptyNeighbor, yourNum1EmptyNeighbor, myNum2EmptyNeighbor, yourNum2EmptyNeighbor, differenceNumPieces]

def evaluationFunction(game, board, player):
    features = featureExtractor(game, board, player)
    #weights = [20,-8,3,-6,-0.5,0.5,0.5,-0.5,2]
    weights = [20,-8,3,-6,-0.2,0.2,0.1,-0.1,1]
    #weights = [20,-8,2,-2,0,0,0,0,0]
    results = ([i*j for (i, j) in zip(features, weights)])
    if game.isEnd((board,player)):
        return game.utility((board,player)) + sum(results)
    return sum(results)

def initSmartFeatureWeights():
    weights = dict(float)
    weights['myLongestPath'] = 20
    weights['yourLongestPath'] = -8
    weights['myCols'] = 2
    weights['yourCols'] = -2
    weights['myPerm'] = 3
    weights['yourPerm'] = -6
    weights['myTotal'] = 0.5
    weights['yourTotal'] = -0.5
    weights['my1Empty'] = -0.1
    weights['your1Empty'] = 0.1
    weights['my2Empty'] = 0.2
    weights['your2Empty'] = -0.2
    weights['my3Empty'] = 0
    weights['your3Empty'] = 0
    weights['my4Empty'] = 0
    weights['your4Empty'] = 0
    weights['my5Empty'] = 0
    weights['your5Empty'] = 0
    weights['my6Empty'] = 0
    weights['your6Empty'] = 0
    weights['my7Empty'] = 0
    weights['your7Empty'] = 0
    weights['my8Empty'] = 0
    weights['your8Empty'] = 0
    weights['my1Flip'] = 0
    weights['your1Flip'] = 0
    weights['my2Flip'] = 0
    weights['your2Flip'] = 0
    weights['my3Flip'] = 0.01
    weights['your3Flip'] = -0.01
    weights['my4Flip'] = 0.01
    weights['your4Flip'] = -0.01
    weights['my5Flip'] = 0.01
    weights['your5Flip'] = -0.01
    weights['my6Flip'] = 0.01
    weights['your6Flip'] = -0.01
    weights['my7Flip'] = 0.01
    weights['your7Flip'] = -0.01
    weights['my8Flip'] = 0.01
    weights['your8Flip'] = -0.01
    return weights

def initOpponentWeights():
    #weights = dict(float)
    weights = {"your2Flip": 0.7822916666666648, "myPerm": 6.375000000000007, "diffPerm": 5.657291666666555, "my2Flip": -0.43645833333333245, "your1Flip": 0.5760416666666688, "your2Empty": -0.8906250000000077, "my8Empty": -0.047916666666666705, "your4Flip": -0.09791666666666667, "my3Flip": 0.0500000000000001, "your8Flip": -0.1, "your5Empty": 0.220833333333333, "your8Empty": 0.09479166666666669, "yourCols": -4.266666666666366, "your3Empty": -0.13125, "diffLongestPath": 91.69166666666835, "yourPerm": -4.282291666666636, "my8Flip": 0.1, "my5Empty": -0.005208333333333049, "myTotal": 6.836458333333379, "diffTotal": 9.201041666666528, "my4Empty": 0.8666666666666678, "yourLongestPath": -34.5416666666668, "my4Flip": 0.09895833333333334, "your6Flip": -0.1, "your1Empty": -0.03229166666666664, "your7Empty": 0.06979166666666668, "my3Empty": 0.596875000000004, "my1Flip": -1.504166666666667, "my6Flip": 0.1, "myLongestPath": 57.150000000000546, "myCols": 26.93333333333583, "your6Empty": 0.055208333333333366, "your5Flip": -0.09687500000000002, "my6Empty": 0.0697916666666667, "my7Flip": 0.1, "my7Empty": -0.05000000000000005, "your4Empty": -0.06874999999999995, "your7Flip": -0.1, "my5Flip": 0.1, "yourTotal": -2.364583333333319, "your3Flip": -0.07708333333333331, "my1Empty": 0.35937499999999944, "my2Empty": 1.27187500000002}
    return weights

def initSmartOpponentWeights():
    #weights = dict(float)
    return trainingWeights

def smartEvaluationFunction(game, board, player):
    features = game.smartFeatures(board, player)
    weights = initSmartFeatureWeights()
    value = sum([features[k] * weights[k] for k in features.keys()])
    if game.isEnd((board, player)):
        return game.utility((board, player)) + value
    return value

def TDLevaluationFunction(game, board, player):
    #features = game.TDLfeatures(board, player)
    features = game.smartFeaturesTDL(board, player)
    # print(features)
    # print(len(features))
    #weights = initOpponentWeights()
    weights = trainingWeights
    value = sum([features[k] * weights[k] for k in weights.keys()])
    if game.isEnd((board, player)):
        return game.utility((board, player)) + value
    return value

class PathwayzGame:
    def __init__(self):
        pass

    def startState(self):
        # Returns the start state, namely empty board and player 'w'
        board = [['-' for i in range(12)] for j in range(8)]
        startingPlayer = 'w'
        return (board, startingPlayer)

    def isEnd(self, state):
        # Takes in a state and returns true if the game is over, either by one
        # player winning or the board being full
        _, player = state
        return self.isWinner(state, player) \
            or self.isWinner(state, self.otherPlayer(player)) \
            or self.fullBoard(state)

    def fullBoard(self, state):
        # Takes in a state and returns true if the board is full
        board, player = state
        for i in range(8):
            for j in range(12):
                if board[i][j] == "-":
                    return False
        return True

    def isWinner(self, state, player):
        # Takes in a state and player and returns true if player is the winner
        board, _ = state
        return self.longestPath(board, player, checkWinner = True) == 12

    def utility(self, state):
        # Takes in a state and returns 1e+6 if player is winner, -1e+6 if player
        # is loser, or 0 otherwise
        _, player = state
        if self.isWinner(state, player):
            return 10000000000
        elif self.isWinner(state, self.otherPlayer(player)):
            return -10000000000
        else:
            return 0

    def actions(self, state):
        # Returns all valid moves for the given state
        actions = []
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if self.emptyPlace(state, i, j):
                actions.append((i,j,True))
                actions.append((i,j,False))
        return actions

    def succ(self, state, action):
        # Takes in a state and action and returns the successive state
        board, player = state
        row, col, permanent = action
        if not (row < 8 and row >= 0 and col < 12 and col >= 0):
            raise Exception('Row, column out of bounds.')
        elif not self.emptyPlace(state, row, col):
            raise Exception('Position is already played.')
        elif permanent:
            board[row][col] = self.otherPlayer(player).upper()
            self.flipPieces(board, row, col)
            return (board, self.otherPlayer(player))
        else:
            board[row][col] = player
            return (board, self.otherPlayer(player))

    def emptyPlace(self, state, row, col):
        # Returns true if the board is empty at row, col
        board, _ = state
        return board[row][col] == '-'

    def player(self, state):
        # Returns the player of the state
        return state[1]

    def otherPlayer(self, player):
        # Returns the other player
        if player == 'w': return 'b'
        elif player == 'b': return 'w'
        else: raise Exception('Not valid player')

    def flipPieces(self, board, row, col):
        # Takes in a board, and the row and col of a permanent piece
        # Flips the available pieces around the permanent piece in the board
        for i, j in self.surroundingPlaces(row, col):
            if board[i][j] == 'b' or board[i][j] == 'w':
                board[i][j] = self.otherPlayer(board[i][j])

    def surroundingPlaces(self, row, col):
        # Takes in a row and col and returns the coordinates of the surrounding
        # squares
        rows = [i for i in range(row - 1, row + 2) if i >= 0 and i < 8]
        cols = [j for j in range(col - 1, col + 2) if j >= 0 and j < 12]
        return [(i, j) for i in rows for j in cols]

    def findPathLength(self, board, player, row, col):
        # Checks for the longest path (in terms of columns) from the left
        farthestCol = -1
        for i, j in self.surroundingPlaces(row, col):
            if board[i][j].lower() == player:
                if j > farthestCol:
                    farthestCol = j
                if j == 11:
                    return 11
                elif not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    maxCol = self.findPathLength(board, player, i, j)
                    if maxCol > farthestCol:
                        farthestCol = maxCol
        return farthestCol

    def longestPath(self, board, player, checkWinner = False):
        # Takes in a board and player and returns the longest contiguous
        # path (in terms of length of columns traversed) by the player
        self.alreadyChecked = [[False for i in range(12)] for j in range(8)]
        longestPath = -1
        for i,j in [(i, j) for j in (range(12) if not checkWinner else range(0)) for i in range(8)]:
            if (board[i][j].lower() == player):
                if not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    newPath = self.findPathLength(board, player, i, j) - j
                    if newPath > longestPath:
                        longestPath = newPath
            # Complete path
            if longestPath == 11:
                return 12
        return longestPath + 1

    # def simulatedMove(self, state, action):
    #     board, player = state
    #     tempBoard = [row[:] for row in board]
    #     return self.succ((tempBoard, player), action)

    # def countPieces(self, board, player):
    #     myNumPermanents = 0
    #     yourNumPermanents = 0
    #     myNum1EmptyNeighbor = 0
    #     yourNum1EmptyNeighbor = 0
    #     myNum2EmptyNeighbor = 0
    #     yourNum2EmptyNeighbor = 0
    #     myNumPieces = 0
    #     yourNumPieces = 0
    #     for i,j in [(i, j) for j in range(12) for i in range(8)]:
    #         if board[i][j] == player.upper():
    #             myNumPermanents += 1
    #             myNumPieces += 1
    #         elif board[i][j] == self.otherPlayer(player).upper():
    #             yourNumPermanents += 1
    #             yourNumPieces += 1
    #         elif board[i][j] == player:
    #             myNumPieces += 1
    #             numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
    #             if numEmptyNeighbors == 0:
    #                 myNumPermanents += 1
    #             elif numEmptyNeighbors == 1:
    #                 myNum1EmptyNeighbor += 1
    #             elif numEmptyNeighbors == 2:
    #                 myNum2EmptyNeighbor += 1
    #         elif board[i][j] == self.otherPlayer(player):
    #             yourNumPieces += 1
    #             numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
    #             if numEmptyNeighbors == 0:
    #                 yourNumPermanents += 1
    #             elif numEmptyNeighbors == 1:
    #                 yourNum1EmptyNeighbor += 1
    #             elif numEmptyNeighbors == 2:
    #                 yourNum2EmptyNeighbor += 1
    #     return (myNumPermanents, yourNumPermanents, myNum1EmptyNeighbor, yourNum1EmptyNeighbor, myNum2EmptyNeighbor, yourNum2EmptyNeighbor, myNumPieces-yourNumPieces)

    # def getNumEmptyNeighbors(self, row, col, board):
    #     neighbors = self.surroundingPlaces(row, col)
    #     numEmptyNeighbors = 0
    #     for neighbor in neighbors:
    #         i, j = neighbor
    #         if board[i][j] == '-':
    #             numEmptyNeighbors += 1
    #     return numEmptyNeighbors

    # def getFlipPotential(self, row, col, board, player):
    #     neighbors = self.surroundingPlaces(row, col)
    #     flipPotential = 0
    #     otherPlayer = self.otherPlayer(player)
    #     for neighbor in neighbors:
    #         i, j = neighbor
    #         if board[i][j] == otherPlayer:
    #             flipPotential += 1
    #         elif board[i][j] == player:
    #             flipPotential -= 1
    #     return flipPotential

    def smartFeatures(self, board, player):
        featureNames = ['myLongestPath','yourLongestPath','myCols','yourCols','myPerm','yourPerm','myTotal','yourTotal','my1Empty','your1Empty','my2Empty','your2Empty','my3Empty','your3Empty','my4Empty','your4Empty','my5Empty','your5Empty','my6Empty','your6Empty','my7Empty','your7Empty','my8Empty','your8Empty','my1Flip','your1Flip','my2Flip','your2Flip','my3Flip','your3Flip','my4Flip','your4Flip','my5Flip','your5Flip','my6Flip','your6Flip','my7Flip','your7Flip','my8Flip','your8Flip']
        features = {feature:0 for feature in featureNames}
        myCols = [0 for _ in range(12)]
        yourCols = [0 for _ in range(12)]
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if board[i][j] == player.upper():
                features['myPerm'] += 1
                features['myTotal'] += 1
                if myCols[j] == 0:
                    myCols[j] = 1
            elif board[i][j] == self.otherPlayer(player).upper():
                features['yourPerm'] += 1
                features['yourTotal'] += 1
                if yourCols[j] == 0:
                    yourCols[j] = 1
            elif board[i][j] == player:
                features['myTotal'] += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    features['myPerm'] += 1
                elif numEmptyNeighbors == 1:
                    features['my1Empty'] += 1
                elif numEmptyNeighbors == 2:
                    features['my2Empty'] += 1
                elif numEmptyNeighbors == 3:
                    features['my3Empty'] += 1
                elif numEmptyNeighbors == 4:
                    features['my4Empty'] += 1
                elif numEmptyNeighbors == 5:
                    features['my5Empty'] += 1
                elif numEmptyNeighbors == 6:
                    features['my5Empty'] += 1
                elif numEmptyNeighbors == 7:
                    features['my7Empty'] += 1
                elif numEmptyNeighbors == 8:
                    features['my8Empty'] += 1
                if myCols[j] == 0:
                    myCols[j] = 1
            elif board[i][j] == self.otherPlayer(player):
                features['yourTotal'] += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    features['yourPerm'] += 1
                elif numEmptyNeighbors == 1:
                    features['your1Empty'] += 1
                elif numEmptyNeighbors == 2:
                    features['your2Empty'] += 1
                elif numEmptyNeighbors == 3:
                    features['your3Empty'] += 1
                elif numEmptyNeighbors == 4:
                    features['your4Empty'] += 1
                elif numEmptyNeighbors == 5:
                    features['your5Empty'] += 1
                elif numEmptyNeighbors == 6:
                    features['your6Empty'] += 1
                elif numEmptyNeighbors == 7:
                    features['your7Empty'] += 1
                elif numEmptyNeighbors == 8:
                    features['your8Empty'] += 1
                if yourCols[j] == 0:
                    yourCols[j] = 1
        features = {k:v/96.0 for k, v in features.items()}
        features['myCols'] = sum(myCols)/12.0
        features['yourCols'] = sum(yourCols)/12.0
        features['myLongestPath'] = game.longestPath(board, player) / 12.0
        features['yourLongestPath'] = game.longestPath(board, game.otherPlayer(player)) / 12.0
        return features

    def TDLfeatures(self, board, player):
        featureNames = ['myLongestPath','yourLongestPath','diffLongestPath', 'myCols','yourCols','myPerm','yourPerm','diffPerm', 'myTotal','yourTotal','diffTotal', 'my1Empty','your1Empty','my2Empty','your2Empty','my3Empty','your3Empty','my4Empty','your4Empty','my5Empty','your5Empty','my6Empty','your6Empty','my7Empty','your7Empty','my8Empty','your8Empty','my1Flip','your1Flip','my2Flip','your2Flip','my3Flip','your3Flip','my4Flip','your4Flip','my5Flip','your5Flip','my6Flip','your6Flip','my7Flip','your7Flip','my8Flip','your8Flip']
        features = {feature:0 for feature in featureNames}
        myCols = [0 for _ in range(12)]
        yourCols = [0 for _ in range(12)]
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if board[i][j] == player.upper():
                features['myPerm'] += 1
                features['myTotal'] += 1
                if myCols[j] == 0:
                    myCols[j] = 1
            elif board[i][j] == self.otherPlayer(player).upper():
                features['yourPerm'] += 1
                features['yourTotal'] += 1
                if yourCols[j] == 0:
                    yourCols[j] = 1
            elif board[i][j] == player:
                features['myTotal'] += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    features['myPerm'] += 1
                elif numEmptyNeighbors == 1:
                    features['my1Empty'] += 1
                elif numEmptyNeighbors == 2:
                    features['my2Empty'] += 1
                elif numEmptyNeighbors == 3:
                    features['my3Empty'] += 1
                elif numEmptyNeighbors == 4:
                    features['my4Empty'] += 1
                elif numEmptyNeighbors == 5:
                    features['my5Empty'] += 1
                elif numEmptyNeighbors == 6:
                    features['my6Empty'] += 1
                elif numEmptyNeighbors == 7:
                    features['my7Empty'] += 1
                elif numEmptyNeighbors == 8:
                    features['my8Empty'] += 1
                if myCols[j] == 0:
                    myCols[j] = 1
            elif board[i][j] == self.otherPlayer(player):
                features['yourTotal'] += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    features['yourPerm'] += 1
                elif numEmptyNeighbors == 1:
                    features['your1Empty'] += 1
                elif numEmptyNeighbors == 2:
                    features['your2Empty'] += 1
                elif numEmptyNeighbors == 3:
                    features['your3Empty'] += 1
                elif numEmptyNeighbors == 4:
                    features['your4Empty'] += 1
                elif numEmptyNeighbors == 5:
                    features['your5Empty'] += 1
                elif numEmptyNeighbors == 6:
                    features['your6Empty'] += 1
                elif numEmptyNeighbors == 7:
                    features['your7Empty'] += 1
                elif numEmptyNeighbors == 8:
                    features['your8Empty'] += 1
                if yourCols[j] == 0:
                    yourCols[j] = 1
            elif board[i][j] == '-':
                flipPotential = self.getFlipPotential(i, j, board, player)
                if flipPotential > 0:
                    if flipPotential == 1:
                        features['my1Flip'] += 1
                    elif flipPotential == 2:
                        features['my2Flip'] += 1
                    elif flipPotential == 3:
                        features['my3Flip'] += 1
                    elif flipPotential == 4:
                        features['my4Flip'] += 1
                    elif flipPotential == 5:
                        features['my5Flip'] += 1
                    elif flipPotential == 6:
                        features['my6Flip'] += 1
                    elif flipPotential == 7:
                        features['my7Flip'] += 1
                    elif flipPotential == 8:
                        features['my8Flip'] += 1
                elif flipPotential < 0:
                    if flipPotential == -1:
                        features['your1Flip'] += 1
                    elif flipPotential == -2:
                        features['your2Flip'] += 1
                    elif flipPotential == -3:
                        features['your3Flip'] += 1
                    elif flipPotential == -4:
                        features['your4Flip'] += 1
                    elif flipPotential == -5:
                        features['your5Flip'] += 1
                    elif flipPotential == -6:
                        features['your6Flip'] += 1
                    elif flipPotential == -7:
                        features['your7Flip'] += 1
                    elif flipPotential == -8:
                        features['your8Flip'] += 1
        features['diffPerm'] = features['myPerm'] - features['yourPerm']
        features['diffTotal'] = features['myTotal'] - features['yourTotal']
        features = {k:v/96.0 for k, v in features.items()}
        features['myCols'] = sum(myCols)/12.0
        features['yourCols'] = sum(yourCols)/12.0
        myLongestPath = game.longestPath(board, player)
        yourLongestPath = game.longestPath(board, game.otherPlayer(player))
        features['myLongestPath'] = myLongestPath / 12.0
        features['yourLongestPath'] = yourLongestPath / 12.0
        features['diffLongestPath'] = (myLongestPath - yourLongestPath) / 12.0
        # ADD FEATURE FOR NUM PLACES TO FLIP PATH (+1?) / LONGESTPATH + 1
        # ADD FEATURE FOR LONGEST PATH AFTER FLIP
        return features

    def findPermPathLength(self, board, player, row, col):
        # Checks for the longest path (in terms of columns) from the left
        farthestCol = -1
        for i, j in self.surroundingPlaces(row, col):
            if self.permSpaces[i][j] == player:
                if j > farthestCol:
                    farthestCol = j
                if j == 11:
                    return 11
                elif not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    maxCol = self.findPermPathLength(board, player, i, j)
                    if maxCol > farthestCol:
                        farthestCol = maxCol
        return farthestCol

    def findLongestPermPath(self, board, player):
        # Takes in a board and player and returns the longest contiguous
        # path (in terms of length of columns traversed) by the player
        self.alreadyChecked = [[False for i in range(12)] for j in range(8)]
        longestPath = -1
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if self.permSpaces[i][j] == player:
                if not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    newPath = self.findPermPathLength(board, player, i, j) - j
                    if newPath > longestPath:
                        longestPath = newPath
            # Complete path
            if longestPath == 11:
                return 12
        return longestPath + 1

    def findEvenPathLength(self, board, player, row, col):
        # Checks for the longest path (in terms of columns) from the left
        farthestCol = -1
        for i, j in self.surroundingPlaces(row, col):
            if self.evenSpaces[i][j] == player:
                if j > farthestCol:
                    farthestCol = j
                if j == 11:
                    return 11
                elif not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    maxCol = self.findEvenPathLength(board, player, i, j)
                    if maxCol > farthestCol:
                        farthestCol = maxCol
        return farthestCol

    def findLongestEvenPath(self, board, player):
        # Takes in a board and player and returns the longest contiguous
        # path (in terms of length of columns traversed) by the player
        self.alreadyChecked = [[False for i in range(12)] for j in range(8)]
        longestPath = -1
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if self.evenSpaces[i][j] == player:
                if not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    newPath = self.findEvenPathLength(board, player, i, j) - j
                    if newPath > longestPath:
                        longestPath = newPath
            # Complete path
            if longestPath == 11:
                return 12
        return longestPath + 1

    def findSafePathLength(self, board, player, row, col):
        # Checks for the longest path (in terms of columns) from the left
        farthestCol = -1
        for i, j in self.surroundingPlaces(row, col):
            if self.safeSpaces[i][j] == player:
                if j > farthestCol:
                    farthestCol = j
                if j == 11:
                    return 11
                elif not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    maxCol = self.findSafePathLength(board, player, i, j)
                    if maxCol > farthestCol:
                        farthestCol = maxCol
        return farthestCol

    def findLongestSafePath(self, board, player):
        # Takes in a board and player and returns the longest contiguous
        # path (in terms of length of columns traversed) by the player
        self.alreadyChecked = [[False for i in range(12)] for j in range(8)]
        longestPath = -1
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if self.safeSpaces[i][j] == player:
                if not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    newPath = self.findSafePathLength(board, player, i, j) - j
                    if newPath > longestPath:
                        longestPath = newPath
            # Complete path
            if longestPath == 11:
                return 12
        return longestPath + 1

    def findPathLengthEdges(self, board, player, row, col, leftEdge, leftEdges, rightEdges):
        # Checks for the longest path (in terms of columns) from the left
        farthestCol = -1
        for i, j in self.surroundingPlaces(row, col):
            if board[i][j].lower() == player:
                if j < leftEdge:
                    leftEdge = j
                    leftEdges.append((i,j))
                elif j == leftEdge:
                    leftEdges.append((i,j))
                if j == farthestCol:
                    rightEdges.append((i,j))
                elif j > farthestCol:
                    farthestCol = j
                    rightEdges = [(i,j)]
                if j == 11:
                    return (11, leftEdges, rightEdges)
                elif not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    maxCol, newLeftEdges, newRightEdges = self.findPathLengthEdges(board, player, i, j, leftEdge, leftEdges, rightEdges)
                    if maxCol >= farthestCol:
                        farthestCol = maxCol
                        leftEdges = newLeftEdges
                        rightEdges = newRightEdges
        return (farthestCol, leftEdges, rightEdges)

    def findLongestPathEdges(self, board, player):
        # Takes in a board and player and returns the longest contiguous
        # path (in terms of length of columns traversed) by the player
        self.alreadyChecked = [[False for i in range(12)] for j in range(8)]
        self.leftEdges = []
        self.rightEdges = []
        longestPath = -1
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if (board[i][j].lower() == player):
                if not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    leftEdge = j
                    leftEdges = [(i,j)]
                    rightEdges = [(i,j)]
                    rightEdge, leftEdges, rightEdges = self.findPathLengthEdges(board, player, i, j, leftEdge, leftEdges, rightEdges)
                    if rightEdge - leftEdge > longestPath:
                        longestPath = rightEdge - leftEdge
                        self.leftEdges = leftEdges
                        self.rightEdges = rightEdges
                    elif rightEdge - leftEdge == longestPath:
                       self.leftEdges = self.leftEdges + leftEdges
                       self.rightEdges = self.rightEdges + rightEdges
            # Complete path
            if longestPath == 11:
                return 12
        return longestPath + 1

    def findFrontierMoves(self, board, player):
        frontierSpacesChecked = [[False for i in range(12)] for j in range(8)]
        leftFrontierPlaces = []
        rightFrontierPlaces = []
        leftFrontierFlips = []
        rightFrontierFlips = []
        for i,j in self.leftEdges:
            for row,col in self.surroundingPlaces(i,j):
                if not frontierSpacesChecked[row][col]:
                    frontierSpacesChecked[row][col] = True
                    if board[row][col] == '-':
                        leftFrontierPlaces.append((row,col))
                    elif board[row][col] == self.otherPlayer(player):
                        # must be regular piece
                        leftFrontierFlips.append((row,col))
        for i,j in self.rightEdges:
            for row,col in self.surroundingPlaces(i,j):
                if not frontierSpacesChecked[row][col]:
                    frontierSpacesChecked[row][col] = True
                    if board[row][col] == '-':
                        rightFrontierPlaces.append((row,col))
                    elif board[row][col] == self.otherPlayer(player):
                        # must be regular piece
                        rightFrontierFlips.append((row,col))
        return (leftFrontierPlaces, rightFrontierPlaces, leftFrontierFlips, rightFrontierFlips)

    def findPathFromSquare(self, board, player, row, col):
        for i, j in self.surroundingPlaces(row, col):
            if not self.alreadyChecked[i][j]:
                self.alreadyChecked[i][j] = True
                if board[i][j].lower() == player:
                    if j > self.rightCol:
                        self.rightCol = j
                    if j < self.leftCol:
                        self.leftCol = j
                    self.findPathFromSquare(board, player, i, j)

    def findLongestFuturePath(self, board, player, longestPath):
        longestFuturePath = longestPath
        #numPathMoves = 0
        leftFrontierMoves = 0
        rightFrontierMoves = 0
        leftFrontierPlaces, rightFrontierPlaces, leftFrontierFlips, rightFrontierFlips = self.findFrontierMoves(board, player)
        pathExtensionCount = [0 for _ in range(3)]

        for frontier in leftFrontierPlaces:
            self.alreadyChecked = [[False for x in range(12)] for y in range(8)]
            i, j = frontier
            self.leftCol = j
            self.rightCol = j
            self.findPathFromSquare(board, player, i, j)
            futurePath = self.rightCol - self.leftCol + 1
            pathExtension = futurePath - longestPath
            if pathExtension > 0:
                #numPathMoves += 1
                leftFrontierMoves += 1
                pathExtensionCount[min(pathExtension - 1, 2)] += 1
                if futurePath > longestFuturePath:
                    longestFuturePath = futurePath

        for frontier in rightFrontierPlaces:
            self.alreadyChecked = [[False for x in range(12)] for y in range(8)]
            i, j = frontier
            self.leftCol = j
            self.rightCol = j
            self.findPathFromSquare(board, player, i, j)
            futurePath = self.rightCol - self.leftCol + 1
            pathExtension = futurePath - longestPath
            if pathExtension > 0:
                #numPathMoves += 1
                rightFrontierMoves += 1
                pathExtensionCount[min(pathExtension - 1, 2)] += 1
                if futurePath > longestFuturePath:
                    longestFuturePath = futurePath

        alreadyFlipped = [[False for x in range(12)] for y in range(8)]

        for frontier in leftFrontierFlips:
            i, j = frontier
            for row,col  in self.surroundingPlaces(i, j):
                if board[row][col] == '-' and not alreadyFlipped[row][col]:
                    alreadyFlipped[row][col] = True
                    action = (row, col, True)
                    newState = game.simulatedMove((board, player), action)
                    newBoard, otherPlayer = newState
                    self.alreadyChecked = [[False for x in range(12)] for y in range(8)]
                    self.leftCol = j
                    self.rightCol = j
                    self.findPathFromSquare(newBoard, player, i, j)
                    futurePath = self.rightCol - self.leftCol + 1
                    pathExtension = futurePath - longestPath
                    if pathExtension > 0:
                        leftFrontierMoves += 1
                        pathExtensionCount[min(pathExtension - 1, 2)] += 1
                        if futurePath > longestFuturePath:
                            longestFuturePath = futurePath

        for frontier in rightFrontierFlips:
            i, j = frontier
            for row,col  in self.surroundingPlaces(i, j):
                if board[row][col] == '-' and not alreadyFlipped[row][col]:
                    alreadyFlipped[row][col] = True
                    action = (row, col, True)
                    newState = game.simulatedMove((board, player), action)
                    newBoard, otherPlayer = newState
                    self.alreadyChecked = [[False for x in range(12)] for y in range(8)]
                    self.leftCol = j
                    self.rightCol = j
                    self.findPathFromSquare(newBoard, player, i, j)
                    futurePath = self.rightCol - self.leftCol + 1
                    pathExtension = futurePath - longestPath
                    if pathExtension > 0:
                        rightFrontierMoves += 1
                        pathExtensionCount[min(pathExtension - 1, 2)] += 1
                        if futurePath > longestFuturePath:
                            longestFuturePath = futurePath

        return (longestFuturePath, leftFrontierMoves, rightFrontierMoves, pathExtensionCount)

    def simulatedMove(self, state, action):
        # Simulates a move with a temporary board
        board, player = state
        tempBoard = [row[:] for row in board]
        return self.succ((tempBoard, player), action)

    def getNumEmptyNeighbors(self, row, col, board):
        # Given a row, col, and board, returns the number of empty neighbors
        neighbors = self.surroundingPlaces(row, col)
        numEmptyNeighbors = 0
        for neighbor in neighbors:
            i, j = neighbor
            if board[i][j] == '-':
                numEmptyNeighbors += 1
        return numEmptyNeighbors

    def printBoard(self, state):
         # Prints out board in console
         board, player = state
         header = ' '
         for col in range(12):
             header += '   %c' % chr(ord('A')+col)
         print(header)
         rowNum = 1
         for row in board:
             rowPrint = '%d' % rowNum
             rowNum += 1
             for col in row:
                 rowPrint += '   %c' % col
             print(rowPrint)

    def countPieces(self, board, player):
        myNumPermanents = 0
        yourNumPermanents = 0
        myNum1EmptyNeighbor = 0
        yourNum1EmptyNeighbor = 0
        myNum2EmptyNeighbor = 0
        yourNum2EmptyNeighbor = 0
        myNumPieces = 0
        yourNumPieces = 0
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if board[i][j] == player.upper():
                myNumPermanents += 1
                myNumPieces += 1
            elif board[i][j] == self.otherPlayer(player).upper():
                yourNumPermanents += 1
                yourNumPieces += 1
            elif board[i][j] == player:
                myNumPieces += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    myNumPermanents += 1
                elif numEmptyNeighbors == 1:
                    myNum1EmptyNeighbor += 1
                elif numEmptyNeighbors == 2:
                    myNum2EmptyNeighbor += 1
            elif board[i][j] == self.otherPlayer(player):
                yourNumPieces += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    yourNumPermanents += 1
                elif numEmptyNeighbors == 1:
                    yourNum1EmptyNeighbor += 1
                elif numEmptyNeighbors == 2:
                    yourNum2EmptyNeighbor += 1
        return (myNumPermanents, yourNumPermanents, myNum1EmptyNeighbor, yourNum1EmptyNeighbor, myNum2EmptyNeighbor, yourNum2EmptyNeighbor, myNumPieces-yourNumPieces)

    def getFlipPotential(self, row, col, board, player):
        neighbors = self.surroundingPlaces(row, col)
        myFlipPotential = 0
        yourFlipPotential = 0
        #flipPotential = 0
        otherPlayer = self.otherPlayer(player)
        for neighbor in neighbors:
            i, j = neighbor
            if board[i][j] == otherPlayer:
                myFlipPotential += 1
                #flipPotential += 1
            elif board[i][j] == player:
                yourFlipPotential += 1
                #flipPotential -= 1
        flipPotential = (myFlipPotential, yourFlipPotential)
        return flipPotential

    def findLengthAfterFlip(self, board, player, i, j):
        action = (i, j, True)
        newState = game.simulatedMove((board, player), action)
        newBoard, otherPlayer = newState
        return game.longestPath(newBoard, player)

    def isCorner(self, i, j):
        return ((i == 0 or i == 7) and (j == 0 or j == 11))

    def isEdge(self, i, j):
        return (i == 0 or i == 7)


    def smartFeaturesTDL(self, board, player):
        featureNames = ['diffLongestPermPathSquared', 'your8Empty', 'your5Empty', 'myLongestEvenPathSquared', 'yourLongestPath', 'futureAhead', 'your2PathExtension', 'my6Empty', 'diff4Flip', 'yourLongestPermPathSquared', 'my3PathExtension', 'yourClosedPathFlex', 'turnsAhead', 'my3EdgeEmpty', 'blockedMyLeft', 'diffLongestFuturePathSquared', 'ahead', 'myLongestPathSquared', 'yourLongestFuturePathSquared', 'myLongestExtension', 'myLongestPermPath', 'your1Flip', 'my8Empty', 'your4Flip', 'diffCols', 'diffLongestSafePath', 'diffLongestFuturePath', 'your2EdgeEmpty', 'yourLongestPathSquared', 'your6Empty', 'my1PathExtension', 'diff2Flip', 'diff2Empty', 'your2Flip', 'yourOpenPathFlex', 'diff1Empty', 'onlyTurnAway', 'diff4Empty', 'myTurnsAway', 'diffLongestPermPath', 'myLongestEvenPath', 'my2PathExtension', 'my4Empty', 'yourTurnsAwaySquared', 'myOpenPathFlex', 'my2Flip', 'my4EdgeEmpty', 'yourTurnsAway', 'my5Empty', 'diffTotal', 'diffLongestSafePathSquared', 'diffLongestEvenPath', 'yourCols', 'blockedYourLeft', 'myCols', 'blockedMe', 'myLongestFuturePath', 'amTurnsAhead', 'blockedYourRight', 'amTurnsBehind', 'myTurnsAwaySquared', 'myPerm', 'diffLongestPathSquared', 'myLongestFuturePathSquared', 'diff3Empty', 'myLongestSafePathSquared', 'my1EdgeEmpty', 'my3Empty', 'my1Flip', 'my1Empty', 'yourLongestFuturePath', 'my2Empty', 'myLongestSafePath', 'diff1EdgeEmpty', 'my7Empty', 'your4Empty', 'myLongestPermPathSquared', 'myOneTurnAway', 'behind', 'your3EdgeEmpty', 'your3PathExtension', 'diff3EdgeEmpty', 'your2Empty', 'yourLongestEvenPathSquared', 'diffPerm', 'your1EdgeEmpty', 'your3Empty', 'myClosedPathFlex', 'my3Flip', 'diff2EdgeEmpty', 'diffLongestEvenPathSquared', 'futureBehind', 'your1PathExtension', 'diff1Flip', 'diff3Flip', 'yourLongestEvenPath', 'yourLongestSafePathSquared', 'your7Empty', 'my2EdgeEmpty', 'yourLongestSafePath', 'diff4EdgeEmpty', 'diffLongestPath', 'your4EdgeEmpty', 'blockedYou', 'blockedMyRight', 'yourPerm', 'yourLongestPermPath', 'my4Flip', 'your3Flip', 'yourTotal', 'yourOneTurnAway', 'yourLongestExtension', 'myTotal', 'your1Empty', 'myLongestPath', 'turnsAheadSquared']
        features = {feature:0 for feature in featureNames}
        # features = []
        myCols = [0 for _ in range(12)]
        yourCols = [0 for _ in range(12)]
        self.permSpaces = [['-' for i in range(12)] for j in range(8)]
        self.evenSpaces = [['-' for i in range(12)] for j in range(8)]
        self.safeSpaces = [['-' for i in range(12)] for j in range(8)]
        #myLongestPath = self.longestPath(board, player)
        #yourLongestPath = self.longestPath(board, self.otherPlayer(player))
        #myFlipPath = myLongestPath
        #yourFlipPath = yourLongestPath
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if board[i][j] == player.upper():
                features['myPerm'] += 1
                features['myTotal'] += 1
                self.permSpaces[i][j] = player
                self.evenSpaces[i][j] = player
                self.safeSpaces[i][j] = player
                if myCols[j] == 0:
                    myCols[j] = 1
            elif board[i][j] == self.otherPlayer(player).upper():
                features['yourPerm'] += 1
                features['yourTotal'] += 1
                self.permSpaces[i][j] = self.otherPlayer(player)
                self.evenSpaces[i][j] = self.otherPlayer(player)
                self.safeSpaces[i][j] = self.otherPlayer(player)
                if yourCols[j] == 0:
                    yourCols[j] = 1
            elif board[i][j] == player:
                features['myTotal'] += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    features['myPerm'] += 1
                    self.permSpaces[i][j] = player
                    self.evenSpaces[i][j] = player
                    self.safeSpaces[i][j] = player
                    """
                    elif self.isCorner(i, j):
                    if numEmptyNeighbors == 1:
                        features['my1CornerEmpty'] += 1
                    elif numEmptyNeighbors == 2:
                        features['my2CornerEmpty'] += 1
                    elif numEmptyNeighbors == 3:
                        features['my3CornerEmpty'] += 1
                    """
                elif self.isEdge(i, j):
                    if numEmptyNeighbors == 1:
                        features['my1EdgeEmpty'] += 1
                    elif numEmptyNeighbors == 2:
                        features['my2EdgeEmpty'] += 1
                        self.evenSpaces[i][j] = player
                        self.safeSpaces[i][j] = player
                    elif numEmptyNeighbors == 3:
                        features['my3EdgeEmpty'] += 1
                    elif numEmptyNeighbors >= 4:
                        features['my4EdgeEmpty'] += 1
                        self.safeSpaces[i][j] = player
                else:
                    if numEmptyNeighbors == 1:
                        features['my1Empty'] += 1
                    elif numEmptyNeighbors == 2:
                        features['my2Empty'] += 1
                        self.evenSpaces[i][j] = player
                        self.safeSpaces[i][j] = player
                    elif numEmptyNeighbors == 3:
                        features['my3Empty'] += 1
                    elif numEmptyNeighbors >= 4:
                        features['my4Empty'] += 1
                        self.safeSpaces[i][j] = player
                if myCols[j] == 0:
                    myCols[j] = 1
            elif board[i][j] == self.otherPlayer(player):
                features['yourTotal'] += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    features['yourPerm'] += 1
                    self.permSpaces[i][j] = self.otherPlayer(player)
                    self.evenSpaces[i][j] = self.otherPlayer(player)
                    self.safeSpaces[i][j] = self.otherPlayer(player)
                    """
                    elif self.isCorner(i, j):
                    if numEmptyNeighbors == 1:
                        features['your1CornerEmpty'] += 1
                    elif numEmptyNeighbors == 2:
                        features['your2CornerEmpty'] += 1
                    elif numEmptyNeighbors == 3:
                        features['your3CornerEmpty'] += 1
                    """
                elif self.isEdge(i, j):
                    if numEmptyNeighbors == 1:
                        features['your1EdgeEmpty'] += 1
                    elif numEmptyNeighbors == 2:
                        features['your2EdgeEmpty'] += 1
                        self.evenSpaces[i][j] = self.otherPlayer(player)
                        self.safeSpaces[i][j] = self.otherPlayer(player)
                    elif numEmptyNeighbors == 3:
                        features['your3EdgeEmpty'] += 1
                    elif numEmptyNeighbors >= 4:
                        features['your4EdgeEmpty'] += 1
                        self.safeSpaces[i][j] = self.otherPlayer(player)
                else:
                    if numEmptyNeighbors == 1:
                        features['your1Empty'] += 1
                    elif numEmptyNeighbors == 2:
                        features['your2Empty'] += 1
                        self.evenSpaces[i][j] = self.otherPlayer(player)
                        self.safeSpaces[i][j] = self.otherPlayer(player)
                    elif numEmptyNeighbors == 3:
                        features['your3Empty'] += 1
                    elif numEmptyNeighbors >= 4:
                        features['your4Empty'] += 1
                        self.safeSpaces[i][j] = self.otherPlayer(player)
                if yourCols[j] == 0:
                    yourCols[j] = 1
            elif board[i][j] == '-':
                myFlip, yourFlip = self.getFlipPotential(i, j, board, player)
                """
                if myFlip > 0:
                    lengthAfterFlip = self.findLengthAfterFlip(board, player, i, j)
                    if lengthAfterFlip > myFlipPath:
                        myFlipPath = lengthAfterFlip
                if yourFlip > 0:
                    lengthAfterFlip = self.findLengthAfterFlip(board, self.otherPlayer(player), i, j)
                    if lengthAfterFlip > yourFlipPath:
                        yourFlipPath = lengthAfterFlip
                """
                flipPotential = myFlip - yourFlip
                if flipPotential > 0:
                    if flipPotential == 1:
                        features['my1Flip'] += 1
                    elif flipPotential == 2:
                        features['my2Flip'] += 1
                    elif flipPotential == 3:
                        features['my3Flip'] += 1
                    elif flipPotential >= 4:
                        features['my4Flip'] += 1
                elif flipPotential < 0:
                    if flipPotential == -1:
                        features['your1Flip'] += 1
                    elif flipPotential == -2:
                        features['your2Flip'] += 1
                    elif flipPotential == -3:
                        features['your3Flip'] += 1
                    elif flipPotential <= -4:
                        features['your4Flip'] += 1
        features['diffPerm'] = features['myPerm'] - features['yourPerm']
        features['diffTotal'] = features['myTotal'] - features['yourTotal']
        features['diff1Empty'] = features['my1Empty'] - features['your1Empty']
        features['diff2Empty'] = features['my2Empty'] - features['your2Empty']
        features['diff3Empty'] = features['my3Empty'] - features['your3Empty']
        features['diff4Empty'] = features['my4Empty'] - features['your4Empty']
        features['diff1EdgeEmpty'] = features['my1EdgeEmpty'] - features['your1EdgeEmpty']
        features['diff2EdgeEmpty'] = features['my2EdgeEmpty'] - features['your2EdgeEmpty']
        features['diff3EdgeEmpty'] = features['my3EdgeEmpty'] - features['your3EdgeEmpty']
        features['diff4EdgeEmpty'] = features['my4EdgeEmpty'] - features['your4EdgeEmpty']
        features['diff1Flip'] = features['my1Flip'] - features['your1Flip']
        features['diff2Flip'] = features['my2Flip'] - features['your2Flip']
        features['diff3Flip'] = features['my3Flip'] - features['your3Flip']
        features['diff4Flip'] = features['my4Flip'] - features['your4Flip']
        features = {k:v/96.0 for k, v in features.items()}

        numMyCols = sum(myCols)
        numYourCols = sum(yourCols)
        features['myCols'] = numMyCols / 12.0
        features['yourCols'] = numYourCols / 12.0
        features['diffCols'] = (numMyCols - numYourCols) / 12.0

        myLongestPermPath = self.findLongestPermPath(board, player)
        features['myLongestPermPath'] = myLongestPermPath / 12.0
        features['myLongestPermPathSquared'] = (myLongestPermPath**2) / 144.0
        myLongestEvenPath = self.findLongestEvenPath(board, player)
        features['myLongestEvenPath'] = myLongestEvenPath / 12.0
        features['myLongestEvenPathSquared'] = (myLongestEvenPath**2) / 144.0
        myLongestSafePath = self.findLongestSafePath(board, player)
        features['myLongestSafePath'] = myLongestSafePath / 12.0
        features['myLongestSafePathSquared'] = (myLongestSafePath**2) / 144.0

        yourLongestPermPath = self.findLongestPermPath(board, self.otherPlayer(player))
        features['yourLongestPermPath'] = yourLongestPermPath / 12.0
        features['yourLongestPermPathSquared'] = (yourLongestPermPath**2) / 144.0
        yourLongestEvenPath = self.findLongestEvenPath(board, self.otherPlayer(player))
        features['yourLongestEvenPath'] = yourLongestEvenPath / 12.0
        features['yourLongestEvenPathSquared'] = (yourLongestEvenPath**2) / 144.0
        yourLongestSafePath = self.findLongestSafePath(board, self.otherPlayer(player))
        features['yourLongestSafePath'] = yourLongestSafePath / 12.0
        features['yourLongestSafePathSquared'] = (yourLongestSafePath**2) / 144.0

        diffLongestPermPath = myLongestPermPath - yourLongestPermPath
        diffLongestEvenPath = myLongestEvenPath - yourLongestEvenPath
        diffLongestSafePath = myLongestSafePath - yourLongestSafePath

        features['diffLongestPermPath'] = diffLongestPermPath / 12.0
        features['diffLongestEvenPath'] = diffLongestEvenPath / 12.0
        features['diffLongestSafePath'] = diffLongestSafePath / 12.0
        features['diffLongestPermPathSquared'] = diffLongestPermPath * abs(diffLongestPermPath) / 144.0
        features['diffLongestEvenPathSquared'] = diffLongestEvenPath * abs(diffLongestEvenPath) / 144.0
        features['diffLongestSafePathSquared'] = diffLongestSafePath * abs(diffLongestSafePath) / 144.0



        myLongestPath = self.findLongestPathEdges(board, player)
        features['myLongestPath'] = myLongestPath / 12.0
        features['myLongestPathSquared'] = myLongestPath**2 / 144.0
        myLongestFuturePath, myLeftFrontierFlex, myRightFrontierFlex, myPathExtensionCount = self.findLongestFuturePath(board, player, myLongestPath)
        myPathFlex = myLeftFrontierFlex + myRightFrontierFlex
        features['myLongestFuturePath'] = myLongestFuturePath / 12.0
        features['myLongestFuturePathSquared'] = myLongestFuturePath**2 / 144.0
        myOneTurnAway = (myLongestFuturePath == 12)
        features['myOneTurnAway'] = myOneTurnAway
        myPathOnLeftEdge = len(self.leftEdges) > 0 and self.leftEdges[0][1] == 0
        myPathOnRightEdge = len(self.rightEdges) > 0 and self.rightEdges[0][1] == 11
        features['blockedMyLeft'] = False
        features['blockedMyRight'] = False
        if myLongestPath <= 1 or myLongestPath == 12:
            blockedMe = False
        elif myLeftFrontierFlex == 0 and len(self.leftEdges) > 0 and not myPathOnLeftEdge:
            blockedMe = True
            features['blockedMyLeft'] = True
        elif myRightFrontierFlex == 0 and len(self.rightEdges) > 0 and not myPathOnRightEdge:
            blockedMe = True
            features['blockedMyRight'] = True
        else:
            blockedMe = False
        features['blockedMe'] = blockedMe
        myTurnsAway = 12.0 - myLongestFuturePath + 2.0 * (features['blockedMyLeft'] + features['blockedMyRight'])
        features['myTurnsAway'] = myTurnsAway / 12.0
        features['myTurnsAwaySquared'] = (myTurnsAway**2) / 144.0
        if (myPathOnLeftEdge or myPathOnRightEdge) and myLongestPath != 12:
            features['myOpenPathFlex'] = 0
            features['myClosedPathFlex'] = (myLongestPath / 12.0) * myPathFlex / 96.0
        elif myLongestPath != 12:
            features['myOpenPathFlex'] = (myLongestPath / 12.0) * myPathFlex / 96.0
            features['myClosedPathFlex'] = 0
        else:
            features['myOpenPathFlex'] = 0
            features['myClosedPathFlex'] = 0
        features['my1PathExtension'] = ((myLongestPath + 1) / 12.0) * myPathExtensionCount[0] / 96.0
        features['my2PathExtension'] = ((myLongestPath + 2) / 12.0) * myPathExtensionCount[1] / 96.0
        features['my3PathExtension'] = (myLongestFuturePath / 12.0) * myPathExtensionCount[2] / 96.0
        features['myLongestExtension'] = (myLongestFuturePath - myLongestPath) / 12.0

        yourLongestPath = self.findLongestPathEdges(board, self.otherPlayer(player))
        features['yourLongestPath'] = yourLongestPath / 12.0
        features['yourLongestPathSquared'] = yourLongestPath**2 / 144.0
        yourLongestFuturePath, yourLeftFrontierFlex, yourRightFrontierFlex, yourPathExtensionCount = self.findLongestFuturePath(board, self.otherPlayer(player), yourLongestPath)
        yourPathFlex = yourLeftFrontierFlex + yourRightFrontierFlex
        features['yourLongestFuturePath'] = yourLongestFuturePath / 12.0
        features['yourLongestFuturePathSquared'] = yourLongestFuturePath**2 / 144.0
        yourOneTurnAway = (yourLongestFuturePath == 12)
        features['yourOneTurnAway'] = yourOneTurnAway
        yourPathOnLeftEdge = len(self.leftEdges) > 0 and self.leftEdges[0][1] == 0
        yourPathOnRightEdge = len(self.rightEdges) > 0 and self.rightEdges[0][1] == 11
        features['blockedYourLeft'] = False
        features['blockedYourRight'] = False
        if yourLongestPath <= 1 or yourLongestPath == 12:
            blockedYou = False
        elif yourLeftFrontierFlex == 0 and len(self.leftEdges) > 0 and not yourPathOnLeftEdge:
            blockedYou = True
            features['blockedYourLeft'] = True
        elif yourRightFrontierFlex == 0 and len(self.rightEdges) > 0 and not yourPathOnRightEdge:
            blockedYou = True
            features['blockedYourRight'] = True
        else:
            blockedYou = False
        features['blockedYou'] = blockedYou
        yourTurnsAway = 12.0 - yourLongestFuturePath + 2.0 * (features['blockedYourLeft'] + features['blockedYourRight'])
        features['yourTurnsAway'] = yourTurnsAway / 12.0
        features['yourTurnsAwaySquared'] = (yourTurnsAway**2) / 144.0
        if (yourPathOnLeftEdge or yourPathOnRightEdge) and yourLongestPath != 12:
            features['yourOpenPathFlex'] = 0
            features['yourClosedPathFlex'] = (yourLongestPath / 12.0) * yourPathFlex / 96.0
        elif yourLongestPath != 12:
            features['yourOpenPathFlex'] = (yourLongestPath / 12.0) * yourPathFlex / 96.0
            features['yourClosedPathFlex'] = 0
        else:
            features['yourOpenPathFlex'] = 0
            features['yourClosedPathFlex'] = 0
        features['your1PathExtension'] = ((yourLongestPath + 1) / 12.0) * yourPathExtensionCount[0] / 96.0
        features['your2PathExtension'] = ((yourLongestPath + 2) / 12.0) * yourPathExtensionCount[1] / 96.0
        features['your3PathExtension'] = (yourLongestFuturePath / 12.0) * yourPathExtensionCount[2] / 96.0
        features['yourLongestExtension'] = (yourLongestFuturePath - yourLongestPath) / 12.0

        diffLongestPath = myLongestPath - yourLongestPath
        features['diffLongestPath'] = diffLongestPath / 12.0
        features['diffLongestPathSquared'] = diffLongestPath * abs(diffLongestPath) / 144.0
        diffLongestFuturePath = myLongestFuturePath - yourLongestFuturePath
        features['diffLongestFuturePath'] = diffLongestFuturePath / 12.0
        features['diffLongestFuturePathSquared'] = diffLongestFuturePath * abs(diffLongestFuturePath) / 144.0
        features['ahead'] = myLongestPath > yourLongestPath
        features['behind'] = myLongestPath < yourLongestPath
        features['futureAhead'] = myLongestFuturePath > yourLongestFuturePath
        features['futureBehind'] = myLongestFuturePath < yourLongestFuturePath
        features['onlyTurnAway'] = myOneTurnAway and not yourOneTurnAway
        turnsAhead = yourTurnsAway - myTurnsAway
        features['turnsAhead'] = turnsAhead / 12.0
        features['turnsAheadSquared'] = turnsAhead * abs(turnsAhead) / 144.0
        features['amTurnsAhead'] = turnsAhead > 0
        features['amTurnsBehind'] = turnsAhead < 0

        maxPath = max(myLongestPath, yourLongestPath)
        early = False
        mid = False
        end = False
        if maxPath <= 4:
            early = True
        elif maxPath <= 8:
            mid = True
        else:
            end = True

        for featureName, featureValue in features.items():
            earlyFeature = featureName + 'Early'
            features[earlyFeature] = featureValue * early
            midFeature = featureName + 'Mid'
            features[midFeature] = featureValue * mid
            endFeature = featureName + 'End'
            features[endFeature] = featureValue * end

        # NEED TO UPDATE FEATURE NAMES WHEN CONVERTING TO PATHWAYZGAME

        return features

class smartPAI:
    def __init__(self):
        return

    def evaluationFunction(self, game, board, player):
        # Returns score from smart evaluation function
        features = game.smartFeaturesTDL(board, player)
        value = sum([features[k] * trainingWeights[k] for k in features.keys()])
        if game.isEnd((board, player)):
            return game.utility((board, player)) + value
        return value

    def updateWeights(self, game, player, oldBoard, newBoard):
        # Updates weights of PAI
        #eta = 0.0001
        #eta = 0.0005
        global trainingWeights
        eta = 0.001
        oldScore = self.evaluationFunction(game, oldBoard, player)
        newScore = self.evaluationFunction(game, newBoard, player)
        features = game.smartFeaturesTDL(oldBoard, player)
        scale = -eta * (oldScore - newScore - game.utility((newBoard,player)))
        for i in features.keys():
            trainingWeights[i] += (scale * features[i])
        print('updatedWeights:')
        print(trainingWeights)

PAI = smartPAI()

class GameManager():
    def __init__(self):
        # Initializes GameManager object
        self.game = PathwayzGame()
        self.state = game.startState()
        self.policies = {'Human':None, 'PAI Random':randomMove, 'PAI Baseline':baselineMove, 'PAI Advanced Baseline':advancedBaselineMove, 'PAI Features':featuresMove, 'PAI Advanced Features':smartFeaturesMove, 'PAI TDL':TDLfeaturesMove, 'PAI Minimax':advancedMinimax, 'PAI Beam Minimax':beamMinimax, 'PAI Advanced Beam Minimax':beamMinimaxMoreFeatures, 'PAI TDL Beam Minimax':beamMinimaxTDL, 'PAI Expectimax':advancedExpectimax, 'PAI MCS':monteCarloSearch, 'PAI MCTS':monteCarloTreeSearch}
        self.displayBoard()
        self.isAI = {'w':False, 'b':False}
        self.AIsLastTurn = None

    def setPlayers(self):
        # Initializes player policies and names
        player1Policy = document.getElementById("player1").value
        player1Name = document.getElementById("player1name").value
        player2Policy = document.getElementById("player2").value
        player2Name = document.getElementById("player2name").value
        if player1Name[0] == '{':
            global trainingWeights
            player1Name = player1Name.replace(" ","")
            player1Name = player1Name.replace("'","")
            player1Name = player1Name.replace('"',"")
            entries = player1Name[1:-2].split(',')
            for entry in entries:
                results = entry.split(':')
                trainingWeights[results[0]] = float(results[1])
            player1Name = "Player 1"

        elif player2Name[0] == '{':
            global trainingWeights
            player2Name = player2Name.replace(" ","")
            player2Name = player2Name.replace("'","")
            player2Name = player2Name.replace('"',"")
            entries = player2Name[1:-2].split(',')
            for entry in entries:
                results = entry.split(':')
                trainingWeights[results[0]] = float(results[1])
            player2Name = "Player 2"
        else:
            global trainingWeights
            trainingWeights = {"your2Flip": 1.0495833333333353, "myPerm": 6.816041666666664, "your4Flip": -0.08072916666666671, "your6Empty": 0, "your1Flip": 1.4491666666666643, "myLongestPermPath": 23.74083333333318, "my8Empty": 0, "diffPerm": 4.216770833333327, "myOneTurnAway": 73.14000000000013, "onlyTurnAway": 72.76000000000022, "your5Empty": 0, "your8Empty": 0, "your2Empty": -0.2548958333333335, "myLongestFuturePath": 34.98666666666767, "yourCols": -0.9458333333333613, "blockedMe": -18.720000000000006, "your3Empty": 0, "diffLongestPath": 54.54749999999867, "yourPathFlex": 0, "yourPerm": -2.4007291666666766, "myPathFlex": 0, "blockedYou": 24.70000000000009, "my5Empty": 0, "myTotal": 6.449583333333361, "diffTotal": 5.901354166666625, "yourLongestPermPath": -8.06666666666665, "yourLongestPath": -16.090833333333034, "my4Flip": 0.09114583333333334, "futureAhead": 70.76000000000032, "your1Empty": 0.001, "yourLongestPathSquared": -32.91201388888965, "your7Empty": 0, "my3Empty": -0.007187499999999994, "my1Flip": 0.913333333333336, "myLongestPath": 46.45666666666782, "myCols": 23.67250000000069, "my2Flip": -0.19406249999999978, "my6Empty": 0, "my2Empty": 0.7627083333333332, "my7Empty": 0, "ahead": 105.5099999999984, "your3Flip": -0.01, "diffLongestFuturePath": 30.42083333333315, "myLongestFuturePathSquared": 37.61263888888979, "my4Empty": 0, "yourTotal": 0, "your4Empty": -0.004687499999999997, "yourOneTurnAway": -1000.0, "myLongestPathSquared": 56.155833333334826, "yourLongestFuturePath": -2.4341666666666524, "my1Empty": -0.02208333333333334, "yourLongestFuturePathSquared": -12.705347222222025, "my3Flip": 0.08260416666666671}

        print (trainingWeights)
        self.playerNames = {'w':player1Name, 'b':player2Name}
        self.isAI = {'w':player1Policy!='Human', 'b':player2Policy!='Human'}
        self.policy = {'w':self.policies[player1Policy], 'b':self.policies[player2Policy]}

    def isAITurn(self):
        return self.isAI[self.game.player(self.state)]

    def AITurn(self):
        # Make's AI's move
        if not self.isAITurn() or self.game.isEnd(self.state): return
        tempBoard = [row[:] for row in self.state[0]]
        self.AIsLastTurn = (tempBoard, self.state[1])
        player = self.game.player(self.state)
        policy = self.policy[player]
        action = policy(self.game, self.state)
        self.state = game.succ(self.state, action)
        self.displayBoard(self.coordinatesToSqNo(action))
        curBoard, curPlayer = self.state
        curFeatures = game.smartFeaturesTDL(curBoard, game.otherPlayer(curPlayer))
        if self.game.isEnd(self.state):
            # PAI.updateWeights(self.game, self.AIsLastTurn[1], self.AIsLastTurn[0], curBoard)
            # print(trainingWeights)
            if self.game.isWinner(self.state, player):
                self.displayWinner(player)
            elif self.game.isWinner(self.state, self.game.otherPlayer(player)):
                self.displayWinner(self.game.otherPlayer(player))
            else:
                self.displayDraw()

    def humanMove(self, sqNo):
        # Takes in the square number selected by the player and if able, plays
        # the player's piece at the square
        if self.game.isEnd(self.state):
            print('Game is over.')
            return
        if self.isAITurn():
            print('Wait your turn.')
            return
        row, col = self.sqNoToCoordinates(sqNo)
        if not self.game.emptyPlace(self.state, row, col):
            print('Place is already taken.')
            return
        player = self.game.player(self.state)
        permanent = document.getElementById("switch_perm").checked
        self.state = game.succ(self.state, (row, col, permanent))
        curBoard = self.state[0]
        self.displayBoard(sqNo)
        # if self.AIsLastTurn != None:
        #     PAI.updateWeights(self.game, self.AIsLastTurn[1], self.AIsLastTurn[0], curBoard)
        if self.game.isEnd(self.state):
            print(trainingWeights)
            if self.game.isWinner(self.state, player):
                self.displayWinner(player)
            elif self.game.isWinner(self.state, self.game.otherPlayer(player)):
                self.displayWinner(self.game.otherPlayer(player))
            else:
                self.displayDraw()

    def coordinatesToSqNo(self, action):
        # Takes in an action and returns corresponding square number
        row, col, _ = action
        return ((12 * row) + col)

    def sqNoToCoordinates(self, sqNo):
        # Takes in square number and returns corresponding coordinates
        row = int(sqNo / 12)
        col = sqNo % 12
        return row, col

    def displayBoard(self, fadeIn=-1):
        # Displays the board state in the GUI
        board, _ = self.state
        squares = document.getElementsByClassName('square')
        for square in squares:
            self.refreshSquare(square, board, fadeIn == square.getAttribute("sqid"))

    def refreshSquare(self, square, board, fadeIn):
        # Updates the given square on the GUI based on the given board
        sqNo = square.getAttribute("sqid")
        row, col = self.sqNoToCoordinates(sqNo)
        pieceType = board[row][col]
        while (square.firstChild):
            square.removeChild(square.firstChild)
        if pieceType == '-': return
        piece = document.createElement("div")
        square.appendChild(piece)
        dot = document.createElement("div")
        if pieceType == 'W' or pieceType == 'B':
            dot.classList.add("cdot")
            piece.appendChild(dot)
        if pieceType == 'w' or pieceType == 'W':
            piece.classList.add("whitepiece")
        elif pieceType == 'b' or pieceType == 'B':
            piece.classList.add("blackpiece")
        if (fadeIn):
            piece.classList.add("animated");
            piece.classList.add("justPlayed");
            piece.classList.add("fadeIn");

    def resetGame(self):
        # Resets the game
        self.isAI = {'w':False, 'b':False}
        self.game = PathwayzGame()
        self.state = game.startState()
        self.displayBoard()
        self.displayStartMenu()

    def showModal(self):
        # Shows the modal window in the GUI
        document.getElementById("modal").style.visibility = 'visible'
        document.getElementById("modal").style.opacity = '1'
        document.getElementById("modal").style.top = '50%'

    def displayStartMenu(self):
        # Displays the start menu in the GUI
        self.setStartMenuText()
        self.showModal()

    def setStartMenuText(self):
        # Sets modal up for start menu
        document.getElementById("modaltitle").innerHTML = "Setup Game";
        document.getElementById("modalInformation").innerHTML = "<h2>Player 1</h2><br><select class=\"soflow\" id=\"player1\"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Features</option><option>PAI Advanced Features</option><option>PAI TDL</option><option>PAI Minimax</option><option>PAI Beam Minimax</option><option>PAI Advanced Beam Minimax</option><option>PAI TDL Beam Minimax</option><option>PAI Expectimax</option><option>PAI MCS</option><option>PAI MCTS</option></select><input type=\"text\" style=\"display: inline;\" id=\"player1name\" value=\"Player 1\"><br><h2>Player 2</h2><br><select class=\"soflow\" id=\"player2\"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Features</option><option>PAI Advanced Features</option><option>PAI TDL</option><option>PAI Minimax</option><option>PAI Beam Minimax</option><option>PAI Advanced Beam Minimax</option><option>PAI TDL Beam Minimax</option><option>PAI Expectimax</option><option>PAI MCS</option><option>PAI MCTS</option></select><input type=\"text\" style=\"display: inline;\" id=\"player2name\" value=\"Player 2\"><br><a href=\"#\" onclick=\"closeModal(); pathwayzGame.gameManager.setPlayers();\">Start Game</a></div>";

    def displayWinner(self, player):
        # Displays winner modal in the GUI
        self.setWinText(player)
        self.showModal()

    def setWinText(self, player):
        # Sets modal up for winner
        document.getElementById("modaltitle").innerHTML = 'Game Over!'
        document.getElementById("modalInformation").innerHTML = '<p>{} wins!!</p><a href=\"#\" onclick=\"closeModal();\">Close</a></div>'.format(self.playerNames[player])

    def displayDraw(self):
        # Displays draw modal in the GUI
        self.setDrawText()
        self.showModal()

    def setDrawText(self):
        # Sets modal up for draw
        document.getElementById("modaltitle").innerHTML = 'Game Over!'
        document.getElementById("modalInformation").innerHTML = '<p>Draw! No one wins!</p><a href=\"#\" onclick=\"closeModal();\">Close</a></div>'

game = PathwayzGame()
gameManager = GameManager()
