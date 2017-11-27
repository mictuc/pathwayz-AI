import random
import math

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

def backpropagate (node,score):
    node.visits += 1
    node.utility = node.utility+score
    if node.parent:
        backpropagate(node.parent,score)

def MCTSdepthCharge (game,node,originalPlayer):
    state = node.state
    if game.isEnd(state):
        if game.isWinner(state,state[1]):
            if originalPlayer:
                backpropagate(node,1)
                return
            else:
                backpropagate(node,0)
                return
        else if (game.isWinner(state,game.otherPlayer(state[1]))):
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
    count = 2000000
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

def value(game, state, depth, alpha, beta, originalPlayer):
    board, player = state
    if game.isEnd(state) or depth == 0:
        if originalPlayer:
            return evaluationFunction(game, board, player)
        else:
            return -evaluationFunction(game, board, player)
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
        beamWidth = [1, 5, 15]
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
        beamWidth = [1, 5, 15]
    scores = beamScores(game, state, depth, beamWidth, smartEvaluationFunction)
    _, bestMove, _ = sorted(scores, key=lambda score: score[0], reverse=True)[0]
    return bestMove

def AVG(scores):
    scores = sorted(scores)
    weightedTotal = 0
    for i in range(len(scores)):
        weightedTotal += scores[i] / (2 ^ (i+1))
    return weightedTotal

def valueExpectimax(game, state, depth, originalPlayer):
    board, player = state
    if game.isEnd(state) or depth == 0:
        if originalPlayer:
            return evaluationFunction(game, board, player)
        else:
            return -evaluationFunction(game, board, game.otherPlayer(player))
    elif originalPlayer:
        highestScore = -float('inf')
        for action in game.actions(state):
            score = value(game, game.simulatedMove(state, action), depth-1, False)
            highestScore = MAX([highestScore, score])
        return highestScore
    else:
        scores = []
        for action in game.actions(state):
            score = value(game, game.simulatedMove(state, action), depth-1, True)
            scores.append(score)
        expectedScore = AVG(scores)
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

def smartEvaluationFunction(game, board, player):
    features = game.smartFeatures(board, player)
    weights = initSmartFeatureWeights()
    value = sum([features[k] * weights[k] for k in features.keys()])
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
            return 1e+6
        elif self.isWinner(state, self.otherPlayer(player)):
            return -1e+6
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

    def simulatedMove(self, state, action):
        board, player = state
        tempBoard = [row[:] for row in board]
        return self.succ((tempBoard, player), action)

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

    def getNumEmptyNeighbors(self, row, col, board):
        neighbors = self.surroundingPlaces(row, col)
        numEmptyNeighbors = 0
        for neighbor in neighbors:
            i, j = neighbor
            if board[i][j] == '-':
                numEmptyNeighbors += 1
        return numEmptyNeighbors

    def getFlipPotential(self, row, col, board, player):
        neighbors = self.surroundingPlaces(row, col)
        flipPotential = 0
        otherPlayer = self.otherPlayer(player)
        for neighbor in neighbors:
            i, j = neighbor
            if board[i][j] == otherPlayer:
                flipPotential += 1
            elif board[i][j] == player:
                flipPotential -= 1
        return flipPotential

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
            # elif board[i][j] == '-':
            #     flipPotential = self.getFlipPotential(i, j, board, player)
            #     if flipPotential > 0:
            #         if flipPotential == 1:
            #             features['my1Flip'] += 1
            #         elif flipPotential == 2:
            #             features['my2Flip'] += 1
            #         elif flipPotential == 3:
            #             features['my3Flip'] += 1
            #         elif flipPotential == 4:
            #             features['my4Flip'] += 1
            #         elif flipPotential == 5:
            #             features['my5Flip'] += 1
            #         elif flipPotential == 6:
            #             features['my6Flip'] += 1
            #         elif flipPotential == 7:
            #             features['my7Flip'] += 1
            #         elif flipPotential == 8:
            #             features['my8Flip'] += 1
            #     elif flipPotential < 0:
            #         if flipPotential == -1:
            #             features['your1Flip'] += 1
            #         elif flipPotential == -2:
            #             features['your2Flip'] += 1
            #         elif flipPotential == -3:
            #             features['your3Flip'] += 1
            #         elif flipPotential == -4:
            #             features['your4Flip'] += 1
            #         elif flipPotential == -5:
            #             features['your5Flip'] += 1
            #         elif flipPotential == -6:
            #             features['your6Flip'] += 1
            #         elif flipPotential == -7:
            #             features['your7Flip'] += 1
            #         elif flipPotential == -8:
            #             features['your8Flip'] += 1
        features = {k:v/96.0 for k, v in features.items()}
        features['myCols'] = sum(myCols)/12.0
        features['yourCols'] = sum(yourCols)/12.0
        features['myLongestPath'] = game.longestPath(board, player) / 12.0
        features['yourLongestPath'] = game.longestPath(board, game.otherPlayer(player)) / 12.0
        return features

class GameManager():
    def __init__(self):
        # Initializes GameManager object
        self.game = PathwayzGame()
        self.state = game.startState()
        self.policies = {'Human':None, 'PAI Random':randomMove, 'PAI Baseline':baselineMove, 'PAI Advanced Baseline':advancedBaselineMove, 'PAI Features':featuresMove, 'PAI Advanced Features':smartFeaturesMove, 'PAI Minimax':advancedMinimax, 'PAI Beam Minimax':beamMinimax, 'PAI Advanced Beam Minimax':beamMinimaxMoreFeatures, 'PAI Expectimax':advancedExpectimax, 'PAI MCS':monteCarloSearch, 'PAI MCTS':monteCarloTreeSearch}
        self.displayBoard()
        self.isAI = {'w':False, 'b':False}

    def setPlayers(self):
        # Initializes player policies and names
        player1Policy = document.getElementById("player1").value
        player1Name = document.getElementById("player1name").value
        player2Policy = document.getElementById("player2").value
        player2Name = document.getElementById("player2name").value
        self.playerNames = {'w':player1Name, 'b':player2Name}
        self.isAI = {'w':player1Policy!='Human', 'b':player2Policy!='Human'}
        self.policy = {'w':self.policies[player1Policy], 'b':self.policies[player2Policy]}

    def isAITurn(self):
        return self.isAI[self.game.player(self.state)]

    def AITurn(self):
        # Make's AI's move
        if not self.isAITurn() or self.game.isEnd(self.state): return
        player = self.game.player(self.state)
        policy = self.policy[player]
        action = policy(self.game, self.state)
        self.state = game.succ(self.state, action)
        self.displayBoard(self.coordinatesToSqNo(action))
        if self.game.isEnd(self.state):
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
        self.displayBoard(sqNo)
        if self.game.isEnd(self.state):
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
        document.getElementById("modalInformation").innerHTML = "<h2>Player 1</h2><br><select class=\"soflow\" id=\"player1\"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Minimax</option><option>PAI Beam Minimax</option><option>PAI Advanced Beam Minimax</option><option>PAI Expectimax</option><option>PAI MCS</option><option>PAI MCTS</option></select><input type=\"text\" style=\"display: inline;\" id=\"player1name\" value=\"Player 1\"><br><h2>Player 2</h2><br><select class=\"soflow\" id=\"player2\"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Minimax</option><option>PAI Beam Minimax</option><option>PAI Advanced Beam Minimax</option><option>PAI Expectimax</option><option>PAI MCS</option><option>PAI MCTS</option></select><input type=\"text\" style=\"display: inline;\" id=\"player2name\" value=\"Player 2\"><br><a href=\"#\" onclick=\"closeModal(); pathwayzGame.gameManager.setPlayers();\">Start Game</a></div>";

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
