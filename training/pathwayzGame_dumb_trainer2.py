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
            return 1
        elif self.isWinner(state, self.otherPlayer(player)):
            return -1
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
            features[repr(grid)] += (1.0/96)
        for j in range(12):
            col = [[board[i][j]] for i in range(8)]
            features[repr(col)] += (1.0/12)
        return features

    def move(self, game, state):
        # Returns best dumb move assuming weights trained for 'b'
        board, player = state
        actions = shuffle(game.actions(state))
        scores = []
        for action in actions:
            newState = game.simulatedMove(state, action)
            score = self.evaluationFunction(game, newState[0], player)
            scores.append((score, action))
        bestScore, bestAction = sorted(scores, key=lambda score: score[0], reverse=True)[0]
        self.updateWeights(game, player, board, game.simulatedMove(state, bestAction)[0])
        return bestAction


    def evaluationFunction(self, game, board, player):
        stateString = repr((board, player))
        if stateString in self.cache:
            return self.cache[stateString]
        features = self.featureExtractor(game, board, player)
        score = sum([features[k] * self.weights[k] for k in features])
        self.cache[stateString] = score
        return score

    def updateWeights(self, game, player, oldBoard, newBoard):
        eta = 0.01
        oldScore = self.evaluationFunction(game, oldBoard, player)
        newScore = self.evaluationFunction(game, newBoard, player)
        features = self.featureExtractor(game, oldBoard, player)
        scale = -eta * (oldScore - newScore - game.utility((newBoard,player)))
        for i in features.keys():
            self.weights[i] += (scale * features[i])

PAI1 = dumbPAI(weightFile='PAI1_weights12000.txt')
PAI2 = dumbPAI(weightFile='PAI2_weights12000.txt')

def playGame(game, PAI1, PAI2):
    state = game.startState()
    oldStateScore = 0
    while not (game.isEnd(state)):
        newState = game.succ(state, PAI1.move(game, state))
        if game.isEnd(newState):
            PAI2.updateWeights(game, newState[1], state[0], newState[0])
            break
        state = newState
        newState = game.succ(state, PAI2.move(game, state))
        if game.isEnd(newState):
            PAI1.updateWeights(game, newState[1], state[0], newState[0])
            break
        state = newState

    # game.printBoard(state)
    if game.fullBoard(state):
        # print('DRAW')
        return None
    elif game.isWinner(state, game.otherPlayer(state[1])):
        # print '%s WINS!' % (game.otherPlayer(state[1]))
        return game.otherPlayer(state[1])
    else:
        # print '%s WINS!' % (state[1])
        return state[1]

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


start_time = time.time()
wins = {'PAI1':0, 'PAI2':0, 'Draw':0}
numGames = 100000
for i in range(numGames):
    winner = playGame(game, PAI1, PAI2)
    if winner == 'w':
        wins['PAI1'] += 1
    elif winner == 'b':
        wins['PAI2'] += 1
    else:
        wins['Draw'] += 1

    if i%100 == 0:
        print(i)

    if (i%1000) == 0:
        fileName = 'PAI1_weights%d.txt' % (12000+i)
        f = open(fileName, 'w')
        json.dump(PAI1.weights, f)
        f.close()
        fileName = 'PAI2_weights%d.txt' % (12000+i)
        f = open(fileName, 'w')
        json.dump(PAI2.weights, f)
        f.close()



print 'dumbPAI 1 won %s percent' % (1.0 * wins['PAI1'] / numGames)
print 'dumbPAI 2 won %s percent' % (1.0 * wins['PAI2'] / numGames)
print 'Draw %s percent' % (1.0 * wins['Draw'] / numGames)
print '%d games were played in %s seconds' % (numGames, int(time.time() - start_time))
