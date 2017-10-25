## Baseline for Pathwayz AI
#
# Michael Tucker, Louis Lafair, Nikhil Prabala
#
# This script runs the Pathwayz AI

import random
from copy import copy, deepcopy

class PathwayzGame():
    def __init__(self):
        # TODO
        pass

    def startState(self):
        board = [['-' for i in range(12)] for j in range(8)]
        startingPlayer = 'w'
        return (board, startingPlayer)

    def isEnd(self, state):
        board, player = state
        return self.longestPath(board, player) == 12 \
            or self.longestPath(board, self.otherPlayer(player)) == 12 \
            or self.fullBoard(state)

    def utility(self, state):
        board, player = state
        # TODO

    def actions(self, state):
        # TODO
        pass

    def player(self, state):
        # Returns the player of the state
        board, player = state
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

    def printPlayersTurn(self, state, playerNames):
        board, player = state
        print('%s\'s turn' % playerNames[player])

    def printStatus(self, state, action, playerNames):
        board, player = state
        row, col, permanent = action
        permanentOutput = 'permanent' if permanent else 'regular'
        playLocation = '(%d,%c)' % (row+1, chr(ord('A')+col))
        print('%s put a %s piece at %s') \
            % (playerNames[self.otherPlayer(player)], permanentOutput, playLocation)
        self.printBoard(state)
        if self.isWinner(state, player):
            print('%s wins!!!' % playerNames[player])
        elif self.isWinner(state, self.otherPlayer(player)):
            print('%s wins!!!' % playerNames[self.otherPlayer(player)])
        elif self.fullBoard(state):
            print 'Board is full. Draw.'

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

    def emptyPlace(self, state, row, col):
        # Returns true if the board is empty at row, col, else returns false
        board, player = state
        return board[row][col] == '-'

    def fullBoard(self, state):
        board, player = state
        for i in range(8):
            for j in range(12):
                if board[i][j] == "-":
                    return False
        return True

    def isWinner(self, state, player):
        board, _ = state
        return self.longestPath(board, player) == 12

    def otherPlayer(self, player):
        # Returns the other player
        if player == 'w': return 'b'
        elif player == 'b': return 'w'
        else: raise Exception('Not valid player')

    def playPiece(self, state, row, col, permanent):
        board, player = state
        if not (row < 8 and row >= 0 and col < 12 and col >= 0):
            print('Row, column out of bounds.')
            return False
        elif not self.emptyPlace(state, row, col):
            print('Position is already played.')
            return False
        elif permanent:
            board[row][col] = self.otherPlayer(player).upper()
            self.flipPieces(board, row, col)
            return True
        else:
            board[row][col] = player
            return True

    def surroundingPlaces(self, row, col):
        rows = [i for i in range(row - 1, row + 2) if i >= 0 and i < 8]
        cols = [j for j in range(col - 1, col + 2) if j >= 0 and j < 12]
        return [(i, j) for i in rows for j in cols]

    def flipPieces(self, board, row, col):
        # Takes in a board, and the row and col of a permanent piece
        # Flips the available pieces around the permanent piece in the board
        # Returns board
        for i, j in self.surroundingPlaces(row, col):
            if board[i][j] == 'b' or board[i][j] == 'w':
                board[i][j] = self.otherPlayer(board[i][j])

    def findPathLength(self, board, player, row, col, alreadyChecked):
        # Checks for the longest path (in terms of columns) from the left
        farthestCol = -1
        for i, j in self.surroundingPlaces(row, col):
            if board[i][j].lower() == player:
                if j > farthestCol:
                    farthestCol = j
                if j == 11:
                    return 11
                elif ((i, j)) not in alreadyChecked:
                    alreadyChecked.append((i, j))
                    maxCol = self.findPathLength(board, player, i, j, alreadyChecked)
                    if maxCol > farthestCol:
                        farthestCol = maxCol
        return farthestCol

    def longestPath(self, board, player):
        alreadyChecked = []
        longestPath = -1
        for i,j in [(i, j) for i in range(8) for j in range(12)]:
            if (board[i][j].lower() == player):
                if board[i][j].lower() not in alreadyChecked:
                    alreadyChecked.append((i, j))
                    newPath = self.findPathLength(board, player, i, j, alreadyChecked) - j
                    if newPath > longestPath:
                        longestPath = newPath
            # complete path
            if longestPath == 11:
                return 12
        return longestPath + 1

    def simulatedMove(self, board, permanent, row, col, player):
        tempBoard = deepcopy(board)
        self.playPiece((tempBoard, player), row, col, permanent)
        return self.longestPath(tempBoard, player)


def randomMove(game, state):
    row, col = -1, -1
    while row == -1 or not game.emptyPlace(state, row, col):
        row = random.randint(0,7)
        col = random.randint(0,11)
        permanent = random.choice([True, False])
    return row, col, permanent

def baselineMove(game, state):
    board, player = state
    bestPath = 0
    row, col, permanent = -1, -1, False
    for i in range(8):
        for j in range(12):
            if game.emptyPlace(state, i, j):
                # try regular piece
                newPath = game.simulatedMove(board, False, i, j, player)
                if newPath > bestPath:
                    bestPath, row, col, permanent = newPath, i, j, False
                # try permanent piece
                newPath = game.simulatedMove(board, True, i, j, player)
                if newPath > bestPath:
                    bestPath, row, col, permanent = newPath, i, j, True
    if row == -1:
        return randomMove(game, state)
    return row, col, permanent

def advancedBaselineMove(game, state):
    board, player = state
    bestPath = 0
    options = []
    for i,j in [(i, j) for i in range(8) for j in range(12)]:
        if game.emptyPlace(state, i, j):
            # try regular piece
            newPath = game.simulatedMove(board, False, i, j, player)
            if newPath > bestPath:
                bestPath = newPath
                options = [(i, j, False)]
            elif newPath == bestPath:
                options.append((i, j, False))
            # try permanent piece
            newPath = game.simulatedMove(board, True, i, j, player)
            if newPath > bestPath:
                bestPath = newPath
                options = [(i, j, True)]
            elif newPath == bestPath:
                options.append((i, j, True))
    if len(options) == 0:
        return randomMove(game, state)
    return random.choice(options)

def humanPolicy(game, state):
    # Takes in a game and state
    # Returns action as a tuple (row, col, permanent)
    while True:
        while True:
            row = (raw_input('Enter row '))
            if row.isdigit() and int(row) >= 1 and int(row) <= 8:
                row = int(row) - 1
                break
            else:
                print('Invalid row, please choose a row between 1 and 8.')
        while True:
            colInput = (raw_input('Enter column '))
            if colInput.isalpha() \
                and ord(colInput.lower()) >= ord('a') \
                and ord(colInput.lower()) <= ord('l'):
                col = ord(colInput.lower()) - ord('a')
                break
            else:
                print('Invalid row, please choose a column between A and L.')
        if game.emptyPlace(state, row, col):
            break
        else:
            print('Place is already taken, try again.')
    while True:
        permanentInput = raw_input('Permanent? (y/n) ')
        if (permanentInput == 'y' or permanentInput == 'n'):
            permanent = permanentInput == 'y'
            break

    return (row, col, permanent)


def AIPolicy(game, state):
    # Takes in a game and state
    # Returns action as a tuple (row, col, permanent)
    return advancedBaselineMove(game, state)
    # return baselineMove(game, state)
    # return randomMove(game, state)

def playPathwayz():
    policies = {'w':AIPolicy, 'b':humanPolicy}
    playerNames = {'w': 'PAI', 'b':'Human'}
    game = PathwayzGame()
    state = game.startState()
    game.printBoard(state)
    while not game.isEnd(state):
        game.printPlayersTurn(state, playerNames)
        player = game.player(state)
        policy = policies[player]
        action = policy(game, state)
        state = game.succ(state, action)
        game.printStatus(state, action, playerNames)

if __name__ == '__main__':
    playPathwayz()
