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
        # Takes in a row and col and returns the coordinates of the surrounding squares
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
        frontierPlaces = []
        frontierFlips = []
        for i,j in self.leftEdges:
            for row,col in self.surroundingPlaces(i,j):
                if not frontierSpacesChecked[row][col]:
                    frontierSpacesChecked[row][col] = True
                    if board[row][col] == '-':
                        frontierPlaces.append((row,col))
                    elif board[row][col] == self.otherPlayer(player):
                        # must be regular piece
                        frontierFlips.append((row,col))
                        """
                        for neighborRow, neighborCol in self.surroundingPlaces(row,col):
                            if board[neighborRow][neighborCol] == '-':
                                frontierFlips.add((neighborRow, neighborCol))
                        """
        for i,j in self.rightEdges:
            for row,col in self.surroundingPlaces(i,j):
                if not frontierSpacesChecked[row][col]:
                    frontierSpacesChecked[row][col] = True
                    if board[row][col] == '-':
                        frontierPlaces.append((row,col))
                    elif board[row][col] == self.otherPlayer(player):
                        # must be regular piece
                        frontierFlips.append((row,col))
                        """
                        for neighborRow, neighborCol in self.surroundingPlaces(row,col):
                            if board[neighborRow][neighborCol] == '-':
                                frontierFlips.add((neighborRow, neighborCol))
                        """
        return (frontierPlaces, frontierFlips)

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
        numPathMoves = 0
        frontierPlaces, frontierFlips = self.findFrontierMoves(board, player)
        for frontier in frontierPlaces:
            self.alreadyChecked = [[False for x in range(12)] for y in range(8)]
            i, j = frontier
            self.leftCol = j
            self.rightCol = j
            self.findPathFromSquare(board, player, i, j) 
            futurePath = self.rightCol - self.leftCol + 1
            if futurePath > longestPath:
                numPathMoves += 1
                if futurePath > longestFuturePath:
                    longestFuturePath = futurePath

        alreadyFlipped = [[False for x in range(12)] for y in range(8)]
        for frontier in frontierFlips:
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
                    if futurePath > longestPath:
                        numPathMoves += 1
                        if futurePath > longestFuturePath:
                            longestFuturePath = futurePath

        return (longestFuturePath, numPathMoves)

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

    def smartFeatures(self, board, player):
        #featureNames = ['myLongestPath','yourLongestPath','myLongestPathFlip', 'yourLongestPathFlip', 'ahead', my1Path', 'my2Path', 'my3Path', 'my4Path', 'my5Path', 'my6Path', 'my7Path', 'my8Path', 'my9Path', 'my10Path', 'my11Path', 'my12Path', 'your1Path', 'your2Path', 'your3Path', 'your4Path', 'your5Path', 'your6Path', 'your7Path', 'your8Path', 'your9Path', 'your10Path', 'your11Path', 'your12Path', 'myCols','yourCols','myPerm','yourPerm','myTotal','yourTotal','my1Empty','your1Empty','my2Empty','your2Empty','my3Empty','your3Empty','my4Empty','your4Empty','my5Empty','your5Empty','my6Empty','your6Empty','my7Empty','your7Empty','my8Empty','your8Empty', 'my1Flip','your1Flip','my2Flip','your2Flip','my3Flip','your3Flip','my4Flip','your4Flip']
        #features = {feature:0 for feature in featureNames}
        features = collections.defaultdict(int)
        myCols = [0 for _ in range(12)]
        yourCols = [0 for _ in range(12)]
        self.permSpaces = [['-' for i in range(12)] for j in range(8)]
        #myLongestPath = self.longestPath(board, player)
        #yourLongestPath = self.longestPath(board, self.otherPlayer(player))
        #myFlipPath = myLongestPath
        #yourFlipPath = yourLongestPath
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if board[i][j] == player.upper():
                features['myPerm'] += 1
                features['myTotal'] += 1
                self.permSpaces[i][j] = player
                if myCols[j] == 0:
                    myCols[j] = 1
            elif board[i][j] == self.otherPlayer(player).upper():
                features['yourPerm'] += 1
                features['yourTotal'] += 1
                self.permSpaces[i][j] = self.otherPlayer(player)
                if yourCols[j] == 0:
                    yourCols[j] = 1
            elif board[i][j] == player:
                features['myTotal'] += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    features['myPerm'] += 1
                    self.permSpaces[i][j] = player
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
                    self.permSpaces[i][j] = self.otherPlayer(player)
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
        features = {k:v/96.0 for k, v in features.items()}
        features['myCols'] = sum(myCols) / 12.0
        features['yourCols'] = sum(yourCols) / 12.0
        features['myLongestPermPath'] = self.findLongestPermPath(board, player) / 12.0
        features['yourLongestPermPath'] = self.findLongestPermPath(board, self.otherPlayer(player)) / 12.0
        #features['myLongestPathFlip'] = myFlipPath / 12.0
        #features['yourLongestPathFlip'] = yourFlipPath / 12.0
        
        #self.printBoard((board, player))

        myLongestPath = self.findLongestPathEdges(board, player)
        features['myLongestPath'] = myLongestPath / 12.0
        features['myLongestPathSquared'] = myLongestPath**2 / 144.0   
        myLongestFuturePath, myPathFlex = self.findLongestFuturePath(board, player, myLongestPath)
        features['myLongestFuturePath'] = myLongestFuturePath / 12.0
        features['myLongestFuturePathSquared'] = myLongestFuturePath**2 / 144.0
        features['blockedMe'] = myLongestFuturePath == myLongestPath
        # could just use myPathFlex == 0
        #features['myPathFlex'] = (myLongestPath * myPathFlex) / 96.0
        features['myPathFlex'] = myPathFlex / 96.0
        #features['myOneMoveAway'] = myLongestFuturePath == 12

        #print self.leftEdges
        #print self.rightEdges
        #print "my path: %d" % (myLongestPath)
        #print "my future path: %d" % (myLongestFuturePath)
        #diffMyFuturePath = myLongestFuturePath - myLongestPath
        #print "diff my future path %d" % (diffMyFuturePath)

        yourLongestPath = self.findLongestPathEdges(board, self.otherPlayer(player))
        features['yourLongestPath'] = yourLongestPath / 12.0
        features['yourLongestPathSquared'] = yourLongestPath**2 / 144.0
        yourLongestFuturePath, yourPathFlex = self.findLongestFuturePath(board, self.otherPlayer(player), yourLongestPath)
        features['yourLongestFuturePath'] = yourLongestFuturePath / 12.0
        features['yourLongestFuturePathSquared'] = yourLongestFuturePath**2 / 144.0
        features['blockedYou'] = yourLongestFuturePath == yourLongestPath 
        # could just use yourPathFlex == 0
        #features['yourPathFlex'] = (yourLongestPath * yourPathFlex) / 96.0
        features['yourPathFlex'] = yourPathFlex / 96.0
        #features['yourOneMoveAway'] = yourLongestFuturePath == 12

        #print self.leftEdges
        #print self.rightEdges
        #print "your path: %d" % (yourLongestPath)
        #print "your future path: %d" % (yourLongestFuturePath)
        #diffYourFuturePath = yourLongestFuturePath - yourLongestPath
        #print "diff your future path %d" % (diffYourFuturePath)

        features['diffLongestPath'] = (myLongestPath - yourLongestPath) / 12.0
        features['ahead'] = myLongestPath > yourLongestPath

        return features

game = PathwayzGame()

def randomMove(game, state):
    # Taking in a game and state, returns a random valid move
    return random.choice(game.actions(state))

def baselineMove(game, state):
    # Returns baseline move
    _, player = state
    bestPath = -float("inf")
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
    # Returns advanced baseline move
    _, player = state
    bestScore = -float("inf")
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
    # Returns shuffled array
    currentIndex = len(array)
    while 0 != currentIndex:
        randomIndex = int(random.random() * currentIndex)
        currentIndex -= 1
        tempValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = tempValue
    return array

def oneMoveAway(game, board, player):
    # Return True if player is one move away, False otherwise
    actions = game.actions((board, player))
    winningActions = []
    for action in actions:
        if game.isWinner(game.simulatedMove((board, player), action), player):
            return True
    return False

def beamScores(game, state, depth, beamWidth):
    # Returns array of top beam scores 
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
    # Returns beam minimax move
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

    def evaluationFunction(self, game, board, player):
        # Returns score from smart evaluation function
        features = game.smartFeatures(board, player)
        value = sum([features[k] * self.weights[k] for k in features.keys()])
        if game.isEnd((board, player)):
            return game.utility((board, player)) + value
        return value

    def updateWeights(self, game, player, oldBoard, newBoard):
        # Updates weights of PAI
        eta = 0.001
        oldScore = self.evaluationFunction(game, oldBoard, player)
        newScore = self.evaluationFunction(game, newBoard, player)
        features = game.smartFeatures(oldBoard, player)
        scale = -eta * (oldScore - newScore - game.utility((newBoard,player)))
        for i in features.keys():
            self.weights[i] += (scale * features[i])

    def epsilonMove(self, game, state, epsMax):
        # Moves with exploration probability
        board, player = state
        actions = shuffle(game.actions(state))
        scores = []
        for action in actions:
            newState = game.simulatedMove(state, action)
            score = self.evaluationFunction(game, newState[0], player)
            scores.append((score, action))
        sortedScores = sorted(scores, key=lambda score: score[0], reverse=True)
        
        epsilon = random.uniform(0, epsMax)
        for i in range(min(15, len(sortedScores))):
            if epsilon <= (2**(i+1) - 1) / float(2**(i+1)):
                chosenScore, chosenAction = sortedScores[i]
                return chosenAction

        bestScore, bestAction = sortedScores[0]
        return bestAction

def playGame(game, PAI1, PAI1_starts, opponent, maxEpsilon): 
    # Plays a game between PAI1 and opponent, where PAI1_starts indicates if
    # PAI starts, and maxEpsilon affects exploration probability
    if PAI1_starts:
        myTurn = game.startState()
    else:
        yourTurn = game.startState()
        myTurn = game.succ(yourTurn, opponent.epsilonMove(game, yourTurn, maxEpsilon))

    while not (game.isEnd(myTurn)):
        yourTurn = game.succ(myTurn, PAI1.epsilonMove(game, myTurn, maxEpsilon))
        if game.isEnd(yourTurn):
            PAI1.updateWeights(game, myTurn[1], myTurn[0], yourTurn[0])
            endState = yourTurn
            break
        myNextTurn = game.succ(yourTurn, opponent.epsilonMove(game, yourTurn, maxEpsilon))
        PAI1.updateWeights(game, myTurn[1], myTurn[0], myNextTurn[0])
        myTurn = myNextTurn
        endState = myTurn

    if game.fullBoard(endState):
        return None
    elif game.isWinner(endState, 'w'):
        return 'w'
    else:
        return 'b'

PAI = smartPAI(weightFile='smarterPAI_v_smarterPAI200.txt')
opponent = smartPAI(weightFile='handpicked_weights.txt')
maxEpsilon = 1
start_time = time.time()
wins = {'PAI':0, 'Opponent':0, 'Draw':0}
numGames = 10001
numGamesPlayed = 0
for i in range(numGames):
    
    if i % 2 == 0:
        winner = playGame(game, PAI, True, opponent, maxEpsilon)
        if winner == 'w':
            wins['PAI'] += 1
        elif winner == 'b':
            wins['Opponent'] += 1
        else:
            wins['Draw'] += 1
    else:
        winner = playGame(game, PAI, False, opponent, maxEpsilon)
        if winner == 'w':
            wins['Opponent'] += 1
        elif winner == 'b':
            wins['PAI'] += 1
        else:
            wins['Draw'] += 1

    numGamesPlayed += 1

    if (i%10) == 0:
        print(i)
        print "PAI: %d" % (wins['PAI'])
        print "Opponent: %d" % (wins['Opponent'])
        winRate = float(wins['PAI']) / (wins['PAI'] + wins['Opponent'] + wins['Draw'])
        print "PAI's current win rate: %f" % (winRate)
        print 'Played %d games in %s seconds' % (numGamesPlayed, time.time() - start_time)

    if (i%50) == 0 and i != 0:
        print "-----------------"
        #print '50 games were played in %s seconds' % time
        print "Writing file..."
        fileName = 'smartPathPAI_v_smartPathPAI%d.txt' % (i)
        f = open(fileName, 'w')
        json.dump(PAI.weights, f)
        f.close()
        if winRate >= 0.65:
            print "Updating opponent..."
            opponent = smartPAI(weightFile=fileName)
        
        print "-----------------"
        wins['PAI'] = 0
        wins['Opponent'] = 0
        wins['Draw'] = 0
        start_time = time.time()
        numGamesPlayed = 0

    """
    if (i%100) == 0 and winRate < 0.65:
        print "Writing file..."
        fileName = 'pathPAI_v_pathPAI%d.txt' % (i+200)
        f = open(fileName, 'w')
        json.dump(PAI.weights, f)
        f.close()
    """

