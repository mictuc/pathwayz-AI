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
        # for i in range(8):
        #     for j in range(12):
        #         if board[i][j] == "-":
        #             return False
        # return True

    def isWinner(self, state, player):
        # Takes in a state and player and returns true if player is the winner
        board, _ = state
        return self.playerWon(board, player)

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

    def utility(self, state):
        # Takes in a state and returns inf if player is winner, -inf if player
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
        pieces = {}
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
        for key, value in pieces.items():
            pieces[key] = value / 96.0
        return pieces

    def countNumCols(self, board, player):
        pieces = {}
        pieces['myCols'] = 0
        pieces['yourCols'] = 0
        otherPlayer = self.otherPlayer(player)
        for j in range(12):
            foundMine = False
            foundYours = False
            for i in range(8):
                if not foundMine and board[i][j].lower() == player:
                    pieces['myCols'] += 1
                    foundMine = True
                elif not foundYours and board[i][j].lower() == otherPlayer:
                    pieces['yourCols'] += 1
                    foundYours = True
                if foundMine and foundYours:
                    break
        pieces['myCols'] = pieces['myCols'] / 12.0
        pieces['yourCols'] = pieces['yourCols'] / 12.0
        return pieces


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
    scores = [value(game, game.simulatedMove((tempBoard, player), action), 2, -float('inf'), float('inf'), False) for action in legalMoves]
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
    depth = int(piecesPlayed / 35)
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

def beamMinimax(game, state):
    board, player = state
    if oneMoveAway(game, board, game.otherPlayer(player)):
        depth = 2
        beamWidth = [None, None]
    else:
        depth = 3
        beamWidth = [1, 5, 5]
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


    """
    def updateWeights(self, oldScore, newScore, features, newState):
        eta = 0.5
        scale = -eta * (oldScore - newScore + game.utility(newState))
        for i in features.keys():
            self.weights[i] += (scale * features[i])
    """

def initSmartFeatureWeights():
    weights = {}
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

class smartPAI:
    def __init__(self, weightFile = '', cacheFile = ''):
        self.weights = collections.defaultdict(int)
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

    def featureExtractor(self, game, board, player):
        features = {}
        features['myLongestPath'] = game.longestPath(board, player) / 12.0
        features['yourLongestPath'] = game.longestPath(board, game.otherPlayer(player)) / 12.0
        cols = game.countNumCols(board, player)
        features.update(cols)
        pieces = game.countAllPieces(board, player)
        features.update(pieces)
        flipPotentials = game.getAllFlipPotentials(board, player)
        features.update(flipPotentials)
        return features

    def evaluationFunction(self, game, board, player):
        stateString = repr((board, player))
        if stateString in self.cache:
            return self.cache[stateString]
        features = self.featureExtractor(game, board, player)
        score = sum([features[k] * self.weights[k] for k in features])
        self.cache[stateString] = score
        return score


    def updateWeights(self, game, player, oldBoard, newBoard):
        # print(self.weights)
        #eta = 0.01
        eta = 0.001
        oldScore = self.evaluationFunction(game, oldBoard, player)
        newScore = self.evaluationFunction(game, newBoard, player)
        features = self.featureExtractor(game, oldBoard, player)
        #print "new score: %f" % newScore
        scale = -eta * (oldScore - newScore - game.utility((newBoard,player)))
        for i in features.keys():
            self.weights[i] += (scale * features[i])
        # print(self.weights)
        # print(' ')

    def move(self, game, state):
        # Returns best dumb move assuming weights trained for 'w'
        board, player = state
        actions = shuffle(game.actions(state))
        scores = []
        for action in actions:
            newState = game.simulatedMove(state, action)
            score = self.evaluationFunction(game, newState[0], player)
            scores.append((score, action))

        # newStates = [game.simulatedMove(state, action) for action in actions]
        # scores = [(self.evaluationFunction(game, newStates[i][0], player), action[i]) for i in range(len(actions))]
        bestScore, bestAction = sorted(scores, key=lambda score: score[0], reverse=True)[0]
        self.updateWeights(game, player, board, game.simulatedMove(state, bestAction)[0])
        return bestAction

#
# def playGame(game, PAI, PAI_first):
#     state = game.startState()
#     oldStateScore = 0
#     if PAI_first:
#         while not (game.isEnd(state)):
#             state = game.succ(state, PAI.move(game, state))
#             if game.isEnd(state): break
#             newState = game.succ(state, randomMove(game, state))
#             if game.isEnd(newState):
#                 PAI.updateWeights(game, newState[1], state[0], newState[0])
#             state = newState
#     else:
#         while not (game.isEnd(state)):
#             newState = game.succ(state, randomMove(game, state))
#             if game.isEnd(newState):
#                 PAI.updateWeights(game, newState[1], state[0], newState[0])
#                 break
#             state = newState
#             state = game.succ(state, PAI.move(game, state))
#
#     game.printBoard(state)
#     if game.fullBoard(state):
#         # print('DRAW')
#         return None
#     elif game.isWinner(state, game.otherPlayer(state[1])):
#         print '%s WINS!' % (game.otherPlayer(state[1]))
#         return game.otherPlayer(state[1])
#     else:
#         print '%s WINS!' % (state[1])
#         return state[1]

def playGame(game, PAI1):
    state = game.startState()
    board, player = state
    while not (game.isEnd(state)):
        newState = game.succ(state, PAI1.move(game, state))
        newBoard, newPlayer = newState
        #game.printBoard(newState)
        PAI1.updateWeights(game, newPlayer, board, newBoard)
        #print "MY TURN"
        #print 'My longest path: %f' % PAI.weights['myLongestPath']
        #print 'Your longest path: %f' % PAI.weights['yourLongestPath']
        state = newState
        board, player = state
        if game.isEnd(state):
            
            break


        newState = game.succ(state, beamMinimax(game, state))
        newBoard, newPlayer = newState
        PAI1.updateWeights(game, newPlayer, board, newBoard)
        state = newState
        board, player = state

        #print "YOUR TURN"
        #print 'My longest path: %f' % PAI.weights['myLongestPath']
        #print 'Your longest path: %f' % PAI.weights['yourLongestPath']



    # state = game.startState()
    #
    # if PAI1_starts:
    #     while not (game.isEnd(state)):
    #         # game.printBoard(state)
    #         state = game.succ(state, PAI1.move(game, state))
    #         # game.printBoard(state)
    #         if game.isEnd(state): break
    #         newState = game.succ(state, PAI2.move(game, state))
    #         if game.isEnd(newState):
    #             PAI1.updateWeights(game, newState[1], state[0], newState[0])
    #             break
    #         state = newState
    # else:
    #     while not (game.isEnd(state)):
    #         # game.printBoard(state)
    #         newState = game.succ(state, PAI2.move(game, state))
    #         # game.printBoard(state)
    #         if game.isEnd(newState):
    #             PAI1.updateWeights(game, newState[1], state[0], newState[0])
    #             break
    #         state = newState
    #         state = game.succ(state, PAI1.move(game, state))

    #print "GAME OVER"

    # game.printBoard(state)
    if game.fullBoard(state):
        # print('DRAW')
        return None
    elif game.isWinner(state, 'w'):
        # print '%s WINS!' % (game.otherPlayer(state[1]))
        #print "PAI wins"
        return 'w'
    else:
        # print '%s WINS!' % (state[1])
        #print "Opponent wins"
        return 'b'


# def playQuickGame(game, policy1, policy2):
#     state = game.startState()
#     while not (game.isEnd(state)):
#         state = game.succ(state, policy1(game, state))
#         if game.isEnd(state):
#             break
#         state = game.succ(state, policy2(game, state))
#
#     if game.fullBoard(state):
#         return None
#     elif game.isWinner(state, game.otherPlayer(state[1])):
#         return game.otherPlayer(state[1])
#     else:
#         return state[1]

#PAI1 = smartPAI(weightFile='SmartPAI1_weights2000.txt')
#PAI1 = smartPAI(weightFile='SmartPAI1_weights_test50.txt')
PAI = smartPAI(weightFile='SmartPAI_weights_featuresBaseline100.txt')
#PAI = smartPAI()
# gameStats = []
start_time = time.time()
wins = {'PAI':0, 'Opponent':0, 'Draw':0}
numGames = 50001
for i in range(numGames):
    winner = playGame(game, PAI)
    #if i % 2 == 0:
    if winner == 'w':
        wins['PAI'] += 1
    elif winner == 'b':
        wins['Opponent'] += 1
    else:
        wins['Draw'] += 1
    """
    else:
        if winner == 'w':
            wins['Opponent'] += 1
        elif winner == 'b':
            wins['PAI'] += 1
        else:
            wins['Draw'] += 1
    """

    if i%25 == 0:
        winRate = wins['PAI'] / 25.0
        print "PAI's win rate: %f" % (winRate)
        wins['PAI'] = 0
        wins['Opponent'] = 0
        wins['Draw'] = 0
        print(i)


    if (i%100) == 0:
        fileName = 'SmartPAI_weights_beamMinimax%d.txt' % (i)
        f = open(fileName, 'w')
        json.dump(PAI.weights, f)
        f.close()
        


"""
print 'smartPAI 1 won %s percent' % (1.0 * wins['PAI1'] / numGames)
print 'smartPAI 2 won %s percent' % (1.0 * wins['PAI2'] / numGames)
print 'Draw %s percent' % (1.0 * wins['Draw'] / numGames)
print '%d games were played in %s seconds' % (numGames, int(time.time() - start_time))
"""
