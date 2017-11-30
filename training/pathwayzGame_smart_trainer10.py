import random
import collections
import time
import json

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

    def isWinner(self, state, player):
        # Takes in a state and player and returns true if player is the winner
        board, _ = state
        return self.playerWon(board, player)


    def fullBoard(self, state):
        # Takes in a state and returns true if the board is full
        board, player = state
        return not any('-' in row for row in board)

    def isWinner(self, state, player):
        # Takes in a state and player and returns true if player is the winner
        board, _ = state
        return self.playerWon(board, player)

    def playerWon(self, board, player):
        # Takes in a board and player and returns True if the player has won
        self.alreadyChecked = [[False for i in range(12)] for j in range(8)]
        longestPath = -1
        j = 0
        for i in range(8):
            if (board[i][j].lower() == player):
                if not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    newPath = self.findPathLength(board, player, i, j) - j
                    if newPath > longestPath:
                        longestPath = newPath
            # Complete path
            if longestPath == 11:
                return True
        return longestPath == 11

    def utility(self, state):
        # Takes in a state and returns 100 if player is winner, -100 if player
        # is loser, or 0 for draw
        board, player = state
        if self.isWinner(state, player):
            return 100
        elif self.isWinner(state, self.otherPlayer(player)):
            return -100
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

    def longestPath(self, board, player):
        # Takes in a board and player and returns the longest contiguous
        # path (in terms of length of columns traversed) by the player
        self.alreadyChecked = [[False for i in range(12)] for j in range(8)]
        longestPath = -1
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
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

    def getNumEmptyNeighbors(self, row, col, board):
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
        pieces = {}
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
        for key in pieces:
            pieces[key] /= 96.0
        return pieces

    def lengthAfterFlip(self, board, player, i, j):
        #state = (board, player)
        action = (i, j, True)
        newState = game.simulatedMove((board, player), action)
        newBoard, otherPlayer = newState
        return game.longestPath(newBoard, otherPlayer)

    def convertSquare(self, board, player, i, j):
        piece = board[i][j]
        if piece == '-':
            return 0
        elif piece == player:
            return 1
        elif piece == self.otherPlayer(player):
            return -1
        elif piece == player.upper():
            return 2
        elif piece == self.otherPlayer(player).upper():
            return -2
        else:
            return None


    def smartFeatures(self, board, player):
        #featureNames = ['myLongestPath','yourLongestPath','myCols','yourCols','myPerm','yourPerm','myTotal','yourTotal','my1Empty','your1Empty','my2Empty','your2Empty','my3Empty','your3Empty','my4Empty','your4Empty','my5Empty','your5Empty','my6Empty','your6Empty','my7Empty','your7Empty','my8Empty','your8Empty','myPathFlips', 'yourPathFlips', 'my1Flip','your1Flip','my2Flip','your2Flip','my3Flip','your3Flip','my4Flip','your4Flip','my5Flip','your5Flip','my6Flip','your6Flip','my7Flip','your7Flip','my8Flip','your8Flip']
        #features = {feature:0 for feature in featureNames}
        features = collections.defaultdict(int)
        myCols = [0 for _ in range(12)]
        yourCols = [0 for _ in range(12)]
        myLongestPath = game.longestPath(board, player)
        yourLongestPath = game.longestPath(board, game.otherPlayer(player))
        # CREATE A TEMPORARY BOARD WITH THE DUMB NOTATION SO WE DON'T HAVE TO CHECK IDENTITIES FOR EVERY SINGLE SQUARE...
        # MAKE IT 2 ROWS AND 2 COLS LONGER THAN CURRENT BOARD, WITH A PERIMETER OR NONES
        gridBoard = [[None for i in range(14)]] + [[None] + row[:] + [None] for row in board] + [[None for i in range(14)]]
        for i,j in [(i, j) for j in range(1,13) for i in range(1,9)]:
            #print gridBoard[i][j]
            gridBoard[i][j] = game.convertSquare(gridBoard, player, i, j)

        #print gridBoard

        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            # CURRENTLY IS SWITCHING BACK AND FORTH BETWEEN PLAYER IT'S OPTIMIZING FOR...
            # SHOULD CONVERT TO 1 IF ME, 2 IF ME PERMANENT, -1 IF YOU, -2 IF YOU PERMANENT

            #grid = [[game.convertSquare(board, player, row, col) for col in range(j - 1, j + 2)] for row in range(i - 1, i + 2)]
            grid = [[gridBoard[row][col] for col in range(j, j + 3)] for row in range(i, i + 3)]
            features[repr(grid)] += 1

            """
            if i == 0:
                if j == 0:
                    grid = [[None, None, None]] + [[None,game.convertSquare(board,player,row,j),game.convertSquare(board,player,row,j+1)] for row in range(i, i + 2)]
                elif j == 11:
                    grid = [[None, None, None]] + [[game.convertSquare(board,player,row,j-1),game.convertSquare(board,player,row,j),None] for row in range(i, i + 2)]
                else:
                    grid = [[None, None, None]] + [[game.convertSquare(board,player,row,col) for col in range(j - 1, j + 2)] for row in range(i, i + 2)]
            elif i == 7:
                if j == 0:
                    grid = [[None,board[row][j],board[row][j+1]] for row in range(i- 1, i + 1)] + [[None, None, None]]
                elif j == 11:
                    grid = [[board[row][j-1],board[row][j],None] for row in range(i- 1, i + 1)] + [[None, None, None]]
                else:
                    grid = [[board[row][col] for col in range(j - 1, j + 2)] for row in range(i - 1, i + 1)] + [[None, None, None]]
            elif j == 0:
                grid = [[None,board[row][j],board[row][j+1]] for row in range(i - 1, i + 2)]
            elif j == 11:
                grid = [[board[row][j-1],board[row][j],None] for row in range(i - 1, i + 2)]
            else:
                grid = [[board[row][col] for col in range(j - 1, j + 2)] for row in range(i - 1, i + 2)]
            features[repr(grid)] += 1
            """

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
                    #if self.lengthAfterFlip(board, player, i, j) < yourLongestPath:
                    #    features['myPathFlips'] += 1
                    if flipPotential == 1:
                        features['my1Flip'] += 1
                    elif flipPotential == 2:
                        features['my2Flip'] += 1
                    elif flipPotential == 3:
                        features['my3Flip'] += 1
                    elif flipPotential >= 4:
                        features['my4Flip'] += 1
                elif flipPotential < 0:
                    #if self.lengthAfterFlip(board, self.otherPlayer(player), i, j) < myLongestPath:
                    #    features['yourPathFlips'] += 1
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
        features = {k:v/96.0 for k, v in features.items()}
        features['myCols'] = sum(myCols)/12.0
        features['yourCols'] = sum(yourCols)/12.0
        features['myLongestPath'] = myLongestPath / 12.0
        features['yourLongestPath'] = yourLongestPath / 12.0
        features['diffLongestPath'] = (myLongestPath - yourLongestPath) / 12.0
        #features['myPathFlips'] = features['myPathFlips'] / (myLongestPath + 1.0)
        #features['yourPathFlips'] = features['yourPathFlips'] / (yourLongestPath + 1.0)
        

        # ADD FEATURE FOR NUM PLACES TO FLIP PATH (+1?) / LONGESTPATH + 1
        # ADD FEATURE FOR LONGEST PATH AFTER FLIP
        return features



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

def featureExtractor(game, board, player):
    myLongestPath = game.longestPath(board, player)
    yourLongestPath = game.longestPath(board, game.otherPlayer(player))
    myNumPermanents, yourNumPermanents, myNum1EmptyNeighbor, yourNum1EmptyNeighbor, myNum2EmptyNeighbor, yourNum2EmptyNeighbor, differenceNumPieces = game.countPieces(board, player)
    return [myLongestPath, yourLongestPath, myNumPermanents, yourNumPermanents, myNum1EmptyNeighbor, yourNum1EmptyNeighbor, myNum2EmptyNeighbor, yourNum2EmptyNeighbor, differenceNumPieces]

def evaluationFunction(game, board, player):
    features = featureExtractor(game, board, player)
    weights = [20,-8,3,-6,-0.5,0.5,0.5,-0.5,2]
    results = ([i*j for (i, j) in zip(features, weights)])
    if game.isEnd((board,player)):
        return game.utility((board,player)) + sum(results)
    return sum(results)

class dumbPAI:
    def __init__(self):
        self.weights = collections.defaultdict(int)
        self.cache = {}

    def dumbFeatureExtractor(self, board):
        # board = [['-' for i in range(12)] for j in range(8)]
        # board[7][1] = 'b'
        features = collections.defaultdict(int)
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if i == 0:
                if j == 0:
                    grid = [[None, None, None]] + [[None,board[row][j],board[row][j+1]] for row in range(i, i + 2)]
                elif j == 11:
                    grid = [[None, None, None]] + [[board[row][j-1],board[row][j],None] for row in range(i, i + 2)]
                else:
                    grid = [[None, None, None]] + [[board[row][col] for col in range(j - 1, j + 2)] for row in range(i, i + 2)]
            elif i == 7:
                if j == 0:
                    grid = [[None,board[row][j],board[row][j+1]] for row in range(i- 1, i + 1)] + [[None, None, None]]
                elif j == 11:
                    grid = [[board[row][j-1],board[row][j],None] for row in range(i- 1, i + 1)] + [[None, None, None]]
                else:
                    grid = [[board[row][col] for col in range(j - 1, j + 2)] for row in range(i - 1, i + 1)] + [[None, None, None]]
            elif j == 0:
                grid = [[None,board[row][j],board[row][j+1]] for row in range(i - 1, i + 2)]
            elif j == 11:
                grid = [[board[row][j-1],board[row][j],None] for row in range(i - 1, i + 2)]
            else:
                grid = [[board[row][col] for col in range(j - 1, j + 2)] for row in range(i - 1, i + 2)]
            features[repr(grid)] += 1

        return features

    def dumbMove(self, game, state):
        # Returns best dumb move assuming weights trained for 'w'
        board, player = state
        bestScore = 0
        options = []
        actions = shuffle(game.actions(state))
        scores = [(self.dumbEvaluationFunction(game.simulatedMove(state, action)), action) for action in actions]
        bestScore, bestAction = sorted(scores, key=lambda score: score[0], reverse=(player=='w'))[0]
        self.updateWeights(self.dumbEvaluationFunction(state), bestScore, self.dumbFeatureExtractor(board), game.simulatedMove(state, bestAction))
        return bestAction

    def dumbEvaluationFunction(self, state):
        board, player = state
        boardString = repr(board)
        if boardString in self.cache:
            return self.cache[boardString]
        features = self.dumbFeatureExtractor(board)
        score = 0
        for k in features:
            score += features[k] * self.weights[k]
        self.cache[boardString] = score
        return score


def initSmartFeatureWeights():
    weights = {}
    weights['myLongestPath'] = 10
    weights['yourLongestPath'] = -5
    weights['diffLongestPath'] = 15
    weights['myCols'] = 2
    weights['yourCols'] = -2
    weights['myPerm'] = 3
    weights['yourPerm'] = -3
    weights['diffPerm'] = 1
    weights['myTotal'] = 0.5
    weights['yourTotal'] = -0.5
    weights['diffTotal'] = 1
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
    weights['my3Flip'] = 0.1
    weights['your3Flip'] = -0.1
    weights['my4Flip'] = 0.1
    weights['your4Flip'] = -0.1
    weights['my5Flip'] = 0.1
    weights['your5Flip'] = -0.1
    weights['my6Flip'] = 0.1
    weights['your6Flip'] = -0.1
    weights['my7Flip'] = 0.1
    weights['your7Flip'] = -0.1
    weights['my8Flip'] = 0.1
    weights['your8Flip'] = -0.1
    return weights

def smartEvaluationFunction(game, board, player):
    features = game.smartFeatures(board, player)
    weights = initSmartFeatureWeights()
    value = sum([features[k] * weights[k] for k in features.keys()])
    if game.isEnd((board, player)):
        return game.utility((board, player)) + value
    return value

def smartFeaturesMove(game, state):
    _, player = state
    bestScore = -float("inf")
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

def opponentEvaluationFunction(game, board, player, weights):
    features = game.smartFeatures(board, player)
    value = sum([features[k] * weights[k] for k in features.keys()])
    if game.isEnd((board, player)):
        return game.utility((board, player)) + value
    return value

def opponentMove(game, state, weights):
    # SEE BELOW TO CREATE THIS
    _, player = state
    bestScore = -float("inf")
    options = []
    actions = game.actions(state)
    for action in actions:
        newState = game.simulatedMove(state, action)
        newBoard, _ = newState
        newScore = opponentEvaluationFunction(game, newBoard, player, weights)
        if newScore > bestScore:
            bestScore = newScore
            options = [action]
        elif newScore == bestScore:
            options.append(action)
    if len(options) == 0:
        return randomMove(game, state)
    return random.choice(options)

class smartPAI:
    def __init__(self, weightFile = '', cacheFile = ''):
        self.weights = collections.defaultdict(float)
        if weightFile != '':
            try:
                f = open(weightFile, 'r')
                self.weights.update(json.load(f))
                f.close()
            except Exception as e:
                print('Weight load failed.')
                raise

        if cacheFile == '':
            self.cache = {}
        else:
            try:
                f = open(cacheFile, 'r')
                self.cache = json.load(f)
                f.close()
            except Exception as e:
                print('Cache load failed.')
                raise

    def evaluationFunction(self, game, board, player):
        features = game.smartFeatures(board, player)
        value = sum([features[k] * self.weights[k] for k in features.keys()])
        if game.isEnd((board, player)):
            return game.utility((board, player)) + value
        return value

    """
    def evaluationFunction(self, game, board, player):
        stateString = repr((board, player))
        if stateString in self.cache:
            return self.cache[stateString]
        features = self.featureExtractor(game, board, player)
        score = sum([features[k] * self.weights[k] for k in features])
        self.cache[stateString] = score
        return score
    """

    def updateWeights(self, game, player, oldBoard, newBoard):
        eta = 0.001
        oldScore = self.evaluationFunction(game, oldBoard, player)
        newScore = self.evaluationFunction(game, newBoard, player)
        features = game.smartFeatures(oldBoard, player)
        scale = -eta * (oldScore - newScore - game.utility((newBoard,player)))
        for i in features.keys():
            self.weights[i] += (scale * features[i])

    """
    def move(self, game, state):
        # Returns best dumb move assuming weights trained for 'w'
        board, player = state
        actions = shuffle(game.actions(state))
        scores = []
        for action in actions:
            newState = game.simulatedMove(state, action)
            score = self.PAIevaluationFunction(game, newState[0], player)
            scores.append((score, action))
        bestScore, bestAction = sorted(scores, key=lambda score: score[0], reverse=True)[0]
        #self.updateWeights(game, player, board, game.simulatedMove(state, bestAction)[0])
        return bestAction
    """

    def epsilonMove(self, game, state, epsMax):
        board, player = state
        actions = shuffle(game.actions(state))
        scores = []
        for action in actions:
            newState = game.simulatedMove(state, action)
            score = self.evaluationFunction(game, newState[0], player)
            scores.append((score, action))
        sortedScores = sorted(scores, key=lambda score: score[0], reverse=True)
        
        epsilon = random.uniform(0, epsMax)
        print epsilon
        for i in range(len(sortedScores)):
            if epsilon <= (2**(i+1) - 1) / float(2**(i+1)):
                # NEED TO USE FLOATS, ABOVE IS PRBLY ALWAYS 0...
                print "i: %d" % (i)
                chosenScore, chosenAction = sortedScores[i]
                return chosenAction
        
        print ("just i = 0")
        bestScore, bestAction = sortedScores[0]
        return bestAction

def playGame(game, PAI1, PAI1_starts, opponentWeights, maxEpsilon): 
    if PAI1_starts:
        myTurn = game.startState()
    else:
        yourTurn = game.startState()
        myTurn = game.succ(yourTurn, opponentMove(game, yourTurn, opponentWeights))

    while not (game.isEnd(myTurn)):
        yourTurn = game.succ(myTurn, PAI1.epsilonMove(game, myTurn, maxEpsilon))
        if game.isEnd(yourTurn):
            PAI1.updateWeights(game, myTurn[1], myTurn[0], yourTurn[0])
            endState = yourTurn
            break
        myNextTurn = game.succ(yourTurn, opponentMove(game, yourTurn, opponentWeights))
        PAI1.updateWeights(game, myTurn[1], myTurn[0], myNextTurn[0])
        myTurn = myNextTurn
        endState = myTurn

    if game.fullBoard(endState):
        return None
    elif game.isWinner(endState, 'w'):
        return 'w'
    else:
        return 'b'

def initOpponentWeights(weightFile):
    weights = collections.defaultdict(float)
    if weightFile != '':
        try:
            f = open(weightFile, 'r')
            weights.update(json.load(f))
            f.close()
        except Exception as e:
            print('Weight load failed.')
            raise
    return weights


"""
print "writing weights"
handpicked_weights = initSmartFeatureWeights()
fileName = 'handpicked_weights.txt'
f = open(fileName, 'w')
json.dump(handpicked_weights, f)
f.close()
print "finished!"
"""

#PAI = smartPAI(weightFile='SmartPAI_weights_featuresBaseline100.txt')
#PAI = smartPAI(weightFile='SmartPAI_weights_eps_advBaseline600.txt')
PAI = smartPAI(weightFile='both_smartDumbPAI_v_smartDumbPAI2550.txt')
#opponentWeightsFile = 'SmartPAI_weights_advBaseline_opt.txt'
opponentWeightsFile = 'both_smartDumbPAI_v_smartDumbPAI2550.txt'
opponentWeights = initOpponentWeights(opponentWeightsFile)
maxEpsilon = 1
# gameStats = []
start_time = time.time()
wins = {'PAI':0, 'Opponent':0, 'Draw':0}
numGames = 10001
for i in range(numGames):
    
    if i % 2 == 0:
        winner = playGame(game, PAI, True, opponentWeights, maxEpsilon)
        if winner == 'w':
            wins['PAI'] += 1
        elif winner == 'b':
            wins['Opponent'] += 1
        else:
            wins['Draw'] += 1
    else:
        winner = playGame(game, PAI, False, opponentWeights, maxEpsilon)
        if winner == 'w':
            wins['Opponent'] += 1
        elif winner == 'b':
            wins['PAI'] += 1
        else:
            wins['Draw'] += 1

    if (i%10) == 0:
        print(i)
        print "PAI: %d" % (wins['PAI'])
        print "Opponent: %d" % (wins['Opponent'])
        winRate = float(wins['PAI']) / (wins['PAI'] + wins['Opponent'] + wins['Draw'])
        print "PAI's current win rate: %f" % (winRate)

    """
    if (i%50) == 0 and i != 0:
        print '50 games were played in %s seconds' % (int(time.time() - start_time))
        print "-----------------"
        if winRate >= 0.65:
            print "Updating opponent..."
            fileName = 'both_smartDumbPAI_v_smartDumbPAI%d.txt' % (i)
            f = open(fileName, 'w')
            json.dump(PAI.weights, f)
            f.close()
            opponentWeights = initOpponentWeights(fileName)
            #maxEpsilon = 1
        
        #winRate = float(wins['PAI']) / (wins['PAI'] + wins['Opponent'] + wins['Draw'])
    
        wins['PAI'] = 0
        wins['Opponent'] = 0
        wins['Draw'] = 0
        start_time = time.time()
        # IF PAI WINS > 65% OF GAMES, UPDATE OPPONENT WEIGHT FILE

        # ALSO, EACH TIME WE CHANGE FILES, DECREASE EPSILON UPPER BOUND BY .01
    if (i%1000) == 0 and winRate < 0.65:
        fileName = 'both_smartDumbPAI_v_smartDumbPAI_epsilon%d.txt' % (i)
        f = open(fileName, 'w')
        json.dump(PAI.weights, f)
        f.close()
    """

