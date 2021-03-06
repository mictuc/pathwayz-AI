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




def MCTSdepthCharge (game,node,originalPlayer,depth):
    state = node.state
    if game.isEnd(state) or depth == 0:
        if originalPlayer:
            backpropagate(node,evaluationFunction(game,state[0],state[1]))
            return
        else:
            backpropagate(node,-evaluationFunction(game,state[0],game.otherPlayer(state[1])))
            return 
    moves = game.actions(state)
    rand = random.choice(moves)
    newState = game.simulatedMove(state, rand)
    for child in node.children:
        if child.state == newState:
            MCTSdepthCharge(game, child, not originalPlayer, depth-1)
            return
    newNode = Node(newState,[],0,0,node,rand)
    node.children.append(newNode)
    MCTSdepthCharge(game, newNode, not originalPlayer, depth-1)


def monteCarloTreeSearch(game,state):
    rootNode = Node(state,[],0,0,None,None)
    count = 250000
    node = rootNode
    for i in range(count):
        node = select(node)
        node = expand(game,node)
        for child in node.children:
            MCTSdepthCharge(game, child, False, 50)
    return sorted(rootNode.children, key=lambda c: c.utility, reverse=True)[0].action


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
        board, player = state
        return self.playerWon(board, player) \
            or self.playerWon(board, self.otherPlayer(player)) \
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
        return self.playerWon(board, player)


    def utility(self, state):
        # Takes in a state and returns inf if player is winner, -inf if player
        # is loser, or 0 for draw
        board, player = state
        if self.isWinner(state, player):
            return 1e+6
        elif self.isWinner(state, self.otherPlayer(player)):
            return -1e+6
        else:
            return 0

    def actions(self, state):
        # Returns all valid moves for the given state
        board, player = state
        actions = []
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if self.emptyPlace(state, i, j):
                actions.append((i,j,True))
                actions.append((i,j,False))
        return actions

    def player(self, state):
        # Returns the player of the state
        _, player = state
        return player

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

    def findPathLength(self, board, player, row, col, test):
        # Checks for the longest path (in terms of columns) from the left
        farthestCol = -1
        for i, j in self.surroundingPlaces(row, col):
            test += 1
            if board[i][j].lower() == player:
                if j > farthestCol:
                    farthestCol = j
                if j == 11:
                    return 11
                elif not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    maxCol = self.findPathLength(board, player, i, j, test)
                    if maxCol > farthestCol:
                        farthestCol = maxCol
        return farthestCol

    #TODO: remove test?

    def longestPath(self, board, player):
        # Takes in a board and player and returns the longest contiguous
        # path (in terms of length of columns traversed) by the player
        self.alreadyChecked = [[False for i in range(12)] for j in range(8)]
        longestPath = -1
        test = 0
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if (board[i][j].lower() == player):
                if not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    newPath = self.findPathLength(board, player, i, j, test) - j
                    if newPath > longestPath:
                        longestPath = newPath
            # Complete path
            if longestPath == 11:
                return 12
        return longestPath + 1

    def playerWon(self, board, player):
        # Takes in a board and player and returns True if the player has won
        self.alreadyChecked = [[False for i in range(12)] for j in range(8)]
        longestPath = -1
        test = 0
        j = 0
        for i in range(8):
            if (board[i][j].lower() == player):
                if not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    newPath = self.findPathLength(board, player, i, j, test) - j
                    if newPath > longestPath:
                        longestPath = newPath
            # Complete path
            if longestPath == 11:
                return True
        return longestPath == 11

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

    def countAllPieces(self, board, player):
        pieces = dict(float)
        pieces['myTotal'] = 0
        pieces['yourTotal'] = 0
        pieces['myPerm'] = 0
        pieces['yourPerm'] = 0
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if board[i][j] == player.upper():
                pieces['myPerm'] += 1
                pieces['myTotal'] += 1
            elif board[i][j] == self.otherPlayer(player).upper():
                pieces['yourPerm'] += 1
                pieces['yourTotal'] += 1
            elif board[i][j] == player:
                pieces['myTotal'] += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    pieces['myPerm'] += 1
                elif numEmptyNeighbors == 1:
                    if 'my1Empty' in pieces:
                        pieces['my1Empty'] += 1
                    else:
                        pieces['my1Empty'] = 1
                elif numEmptyNeighbors == 2:
                    if 'my2Empty' in pieces:
                        pieces['my2Empty'] += 1
                    else:
                        pieces['my2Empty'] = 1
                elif numEmptyNeighbors == 3:
                    if 'my3Empty' in pieces:
                        pieces['my3Empty'] += 1
                    else:
                        pieces['my3Empty'] = 1
                elif numEmptyNeighbors == 4:
                    if 'my4Empty' in pieces:
                        pieces['my4Empty'] += 1
                    else:
                        pieces['my4Empty'] = 1
                elif numEmptyNeighbors == 5:
                    if 'my5Empty' in pieces:
                        pieces['my5Empty'] += 1
                    else:
                        pieces['my5Empty'] = 1
                elif numEmptyNeighbors == 6:
                    if 'my5Empty' in pieces:
                        pieces['my5Empty'] += 1
                    else:
                        pieces['my5Empty'] = 1
                elif numEmptyNeighbors == 7:
                    if 'my7Empty' in pieces:
                        pieces['my7Empty'] += 1
                    else:
                        pieces['my7Empty'] = 1
                elif numEmptyNeighbors == 8:
                    if 'my8Empty' in pieces:
                        pieces['my8Empty'] += 1
                    else:
                        pieces['my8Empty'] = 1
            elif board[i][j] == self.otherPlayer(player):
                pieces['yourTotal'] += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    pieces['yourPerm'] += 1
                elif numEmptyNeighbors == 1:
                    if 'your1Empty' in pieces:
                        pieces['your1Empty'] += 1
                    else:
                        pieces['your1Empty'] = 1
                elif numEmptyNeighbors == 2:
                    if 'your2Empty' in pieces:
                        pieces['your2Empty'] += 1
                    else:
                        pieces['your2Empty'] = 1
                elif numEmptyNeighbors == 3:
                    if 'your3Empty' in pieces:
                        pieces['your3Empty'] += 1
                    else:
                        pieces['your3Empty'] = 1
                elif numEmptyNeighbors == 4:
                    if 'your4Empty' in pieces:
                        pieces['your4Empty'] += 1
                    else:
                        pieces['your4Empty'] = 1
                elif numEmptyNeighbors == 5:
                    if 'your5Empty' in pieces:
                        pieces['your5Empty'] += 1
                    else:
                        pieces['your5Empty'] = 1
                elif numEmptyNeighbors == 6:
                    if 'your6Empty' in pieces:
                        pieces['your6Empty'] += 1
                    else:
                        pieces['your6Empty'] = 1
                elif numEmptyNeighbors == 7:
                    if 'your7Empty' in pieces:
                        pieces['your7Empty'] += 1
                    else:
                        pieces['your7Empty'] = 1
                elif numEmptyNeighbors == 8:
                    if 'your8Empty' in pieces:
                        pieces['your8Empty'] += 1
                    else:
                        pieces['your8Empty'] = 1
        return pieces

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

    def getAllFlipPotentials(self, board, player):
        pieces = dict(float)
        pieces['my1Flip'] = 0
        pieces['my2Flip'] = 0
        pieces['my3Flip'] = 0
        pieces['your1Flip'] = 0
        pieces['your2Flip'] = 0
        pieces['your3Flip'] = 0
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if board[i][j] == '-':
                flipPotential = self.getFlipPotential(i, j, board, player)
                if flipPotential > 0:
                    if flipPotential == 1:
                        pieces['my1Flip'] += 1
                    elif flipPotential == 2:
                        pieces['my2Flip'] += 1
                    elif flipPotential == 3:
                        pieces['my3Flip'] += 1
                    elif flipPotential == 4:
                        if 'my4Flip' in pieces:
                            pieces['my4Flip'] += 1
                        else:
                            pieces['my4Flip'] = 1
                    elif flipPotential == 5:
                        if 'my5Flip' in pieces:
                            pieces['my5Flip'] += 1
                        else:
                            pieces['my5Flip'] = 1
                    elif flipPotential == 6:
                        if 'my6Flip' in pieces:
                            pieces['my6Flip'] += 1
                        else:
                            pieces['my6Flip'] = 1
                    elif flipPotential == 7:
                        if 'my7Flip' in pieces:
                            pieces['my7Flip'] += 1
                        else:
                            pieces['my7Flip'] = 1
                    elif flipPotential == 8:
                        if 'my8Flip' in pieces:
                            pieces['my8Flip'] += 1
                        else:
                            pieces['my8Flip'] = 1
                elif flipPotential < 0:
                    if flipPotential == -1:
                        pieces['your1Flip'] += 1
                    elif flipPotential == -2:
                        pieces['your2Flip'] += 1
                    elif flipPotential == -3:
                        pieces['your3Flip'] += 1
                    elif flipPotential == -4:
                        if 'your4Flip' in pieces:
                            pieces['your4Flip'] += 1
                        else:
                            pieces['your4Flip'] = 1
                    elif flipPotential == -5:
                        if 'your5Flip' in pieces:
                            pieces['your5Flip'] += 1
                        else:
                            pieces['your5Flip'] = 1
                    elif flipPotential == -6:
                        if 'your6Flip' in pieces:
                            pieces['your6Flip'] += 1
                        else:
                            pieces['your6Flip'] = 1
                    elif flipPotential == -7:
                        if 'your7Flip' in pieces:
                            pieces['your7Flip'] += 1
                        else:
                            pieces['your7Flip'] = 1
                    elif flipPotential == -8:
                        if 'your8Flip' in pieces:
                            pieces['your8Flip'] += 1
                        else:
                            pieces['your8Flip'] = 1
        return pieces

game = PathwayzGame()

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

def beamScores(game, state, depth, beamWidth):
    board, player = state
    if game.isEnd(state) or depth == 0:
        return [(evaluationFunction(game, board, player), None, state)]
    actions = shuffle(game.actions(state))
    numTopScores = beamWidth[depth-1]
    if numTopScores == None: numTopScores = len(actions)
    topScores = [(-float('inf'), None, None) for i in range(numTopScores)]
    newStates = []
    for action in actions:
        newBoard, newPlayer = game.simulatedMove(state, action)
        newScore = evaluationFunction(game, newBoard, player)
        minScore = sorted(topScores, key=lambda score: score[0])[0]
        if newScore > minScore[0]:
            topScores.remove(minScore)
            topScores.append((newScore, action, (newBoard, newPlayer)))
    newTopScores = []
    for score, action, newState in topScores:
        _, _, lastState = sorted(beamScores(game, newState, depth-1, beamWidth), key=lambda score: score[0], reverse=True)[0]
        newTopScores.append((evaluationFunction(game, lastState[0], player), action, lastState))
    return newTopScores


def beamScoresSmart(game, state, depth, beamWidth):
    board, player = state
    if game.isEnd(state) or depth == 0:
        return [(smartEvaluationFunction(game, board, player), None, state)]
    actions = shuffle(game.actions(state))
    numTopScores = beamWidth[depth-1]
    if numTopScores == None: numTopScores = len(actions)
    topScores = [(-float('inf'), None, None) for i in range(numTopScores)]
    newStates = []
    for action in actions:
        newBoard, newPlayer = game.simulatedMove(state, action)
        newScore = smartEvaluationFunction(game, newBoard, player)
        minScore = sorted(topScores, key=lambda score: score[0])[0]
        if newScore > minScore[0]:
            topScores.remove(minScore)
            topScores.append((newScore, action, (newBoard, newPlayer)))
    newTopScores = []
    for score, action, newState in topScores:
        _, _, lastState = sorted(beamScores(game, newState, depth-1, beamWidth), key=lambda score: score[0], reverse=True)[0]
        newTopScores.append((smartEvaluationFunction(game, lastState[0], player), action, lastState))
    return newTopScores

def beamMinimax(game, state):
    board, player = state
    if oneMoveAway(game, board, game.otherPlayer(player)):
        depth = 2
        beamWidth = [None, None]
    else:
        depth = 3
        beamWidth = [1, 5, 15]
    scores = beamScores(game, state, depth, beamWidth)
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
    scores = beamScoresSmart(game, state, depth, beamWidth)
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

def smartFeatureExtractor(game, board, player):
    # Extracts and returns features as a dict
    features = dict(int)
    features['myLongestPath'] = game.longestPath(board, player)
    features['yourLongestPath'] = game.longestPath(board, game.otherPlayer(player))
    pieces = game.countAllPieces(board, player)
    features.update(pieces)
    flipPotentials = game.getAllFlipPotentials(board, player)
    features.update(flipPotentials)
    #print(features)
    return features

def initSmartFeatureWeights():
    weights = dict(float)
    weights['myLongestPath'] = 20
    weights['yourLongestPath'] = -8
    weights['myPerm'] = 5
    weights['yourPerm'] = -5
    weights['myTotal'] = 1
    weights['yourTotal'] = -1
    weights['my1Empty'] = -0.2
    weights['your1Empty'] = 0.2
    weights['my2Empty'] = 0.2
    weights['your2Empty'] = -0.2
    weights['my3Empty'] = 0
    weights['your3Empty'] = 0
    weights['my4Empty'] = 0.2
    weights['your4Empty'] = -0.2
    weights['my5Empty'] = 0.2
    weights['your5Empty'] = -0.2
    weights['my6Empty'] = 0.2
    weights['your6Empty'] = -0.2
    weights['my7Empty'] = 0.2
    weights['your7Empty'] = -0.2
    weights['my8Empty'] = 0.2
    weights['your8Empty'] = -0.2
    weights['my1Flip'] = 0
    weights['your1Flip'] = 0
    weights['my2Flip'] = 0
    weights['your2Flip'] = 0
    weights['my3Flip'] = 0.2
    weights['your3Flip'] = -0.2
    weights['my4Flip'] = 0.2
    weights['your4Flip'] = -0.2
    weights['my5Flip'] = 0.2
    weights['your5Flip'] = -0.2
    weights['my6Flip'] = 0.2
    weights['your6Flip'] = -0.2
    weights['my7Flip'] = 0.2
    weights['your7Flip'] = -0.2
    weights['my8Flip'] = 0.2
    weights['your8Flip'] = -0.2
    return weights


def smartEvaluationFunction(game, board, player):
    features = smartFeatureExtractor(game, board, player)
    #print(features)
    weights = initSmartFeatureWeights()
    #print(weights)
    values = {features[k] * weights[k] for k in features.keys()}
    #print(values)
    value = sum(values)
    if game.isEnd((board, player)):
        return game.utility((board, player)) + value
    #print(value)
    return value



def playPathwayz():
    policies = {'w':monteCarloTreeSearch, 'b':monteCarloSearch}
    playerNames = {'w': 'MCTS', 'b':'MCS'}
    game = PathwayzGame()
    state = game.startState()
    count = 0
    while count < 5:
        while not game.isEnd(state):
            player = game.player(state)
            policy = policies[player]
            action = policy(game, state)
            state = game.succ(state, action)
            printStatus(game,state,action,playerNames)
        count += 1
        state = game.startState()
        print(count)
    print("SWITCH SIDES")
    policies = {'b':monteCarloTreeSearch, 'w':monteCarloSearch}
    playerNames = {'w': 'MCTS', 'b':'MCS'}
    game = PathwayzGame()
    state = game.startState()
    count = 0
    while count < 5:
        while not game.isEnd(state):
            player = game.player(state)
            policy = policies[player]
            action = policy(game, state)
            state = game.succ(state, action)
            printStatus(game,state,action,playerNames)
        count += 1
        print(count)
        state = game.startState()





def printStatus(self, state, action, playerNames):
        board, player = state
        row, col, permanent = action
        # permanentOutput = 'permanent' if permanent else 'regular'
        # playLocation = '(%d,%c)' % (row+1, chr(ord('A')+col))
        # print('%s put a %s piece at %s') \
        #     % (playerNames[self.otherPlayer(player)], permanentOutput, playLocation)
        # self.printBoard(state)
        if self.isWinner(state, player):
            print('%s wins!!!' % playerNames[player])
        elif self.isWinner(state, self.otherPlayer(player)):
            print('%s wins!!!' % playerNames[self.otherPlayer(player)])
        elif self.fullBoard(state):
            print('Board is full. Draw.')

playPathwayz()


