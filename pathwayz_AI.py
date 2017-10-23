## Baseline for Pathwayz AI
#
# Michael Tucker, Louis Lafair, Nikhil Prabala
#
# This script runs the Pathwayz AI

import random
from copy import copy, deepcopy

# Initialize the board to empty
board = [['-' for i in range(12)] for j in range(8)]
# Initializes first player to be white
currentPlayer = 'w'

def printBoard(board):
    # Prints out board in console
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

def otherPlayer(player):
    # Takes in one play and returns other player
    if player == 'w':
        return 'b'
    elif player == 'b':
        return 'w'
    else:
        raise Exception('Not valid player')

def emptyPlace(board, row, col):
    # Returns true if the board is empty at row, col, else returns false
    return board[row][col] == '-'

def flipPieces(board, row, col):
    # Takes in a board, and the row and col of a permanent piece
    # Flips the available pieces around the permanent piece in the board
    for i in range(row-1,row+2):
        if i >= 0 and i < 8:
            for j in range(col-1, col+2):
                if j >= 0 and j < 12:
                    if board[i][j] == 'b' or board[i][j] == 'w':
                        board[i][j] = otherPlayer(board[i][j])

def findPathLength(board, player, row, col, alreadyChecked):
    # Checks for the longest path (in terms of columns) from the left
    farthestCol = -1
    for i in range(row-1, row+2):
        if i >= 0 and i < 8:
            for j in range(col-1, col+2):
                if j >= 0 and j < 12:
                    if board[i][j].lower() == player:
                        if j > farthestCol:
                            farthestCol = j
                        if j == 11:
                            return 11
                        elif ((i, j)) not in alreadyChecked:
                            alreadyChecked.append((i, j))
                            maxCol = findPathLength(board, player, i, j, alreadyChecked)
                            if maxCol > farthestCol:
                                farthestCol = maxCol
    return farthestCol

def longestPath(board, player):
    alreadyChecked = []
    longestPath = -1
    for i in range(8):
        if (board[i][0].lower() == player):
            alreadyChecked.append((i, 0))
            newPath = findPathLength(board, player, i, 0, alreadyChecked)
            if newPath > longestPath:
                longestPath = newPath
            if longestPath == 11:
                return 12
    return longestPath + 1

def isWinner(board, player):
    return longestPath(board, player) == 12

def playPiece(board, row, col, permanent, player):
    if not (row < 8 and row >= 0 and col < 12 and col >= 0):
        print('Row, column out of bounds')
        return False
    elif not emptyPlace(board, row, col):
        print('Position is already played')
        return False
    elif permanent:
        board[row][col] = otherPlayer(player).upper()
        flipPieces(board, row, col)
        return True
    else:
        board[row][col] = player
        return True

def randomMove(board):
    row = -1
    col = -1
    while row == -1 or not emptyPlace(board, row, col):
        row = random.randint(0,7)
        col = random.randint(0,11)
        permanent = random.choice([True, False])
    return row,col,permanent

def baselineMove(board, player):
    bestPath = 0
    row, col, permanent = -1, -1, False
    for i in range(8):
        for j in range(12):
            if emptyPlace(board, i, j):
                tempBoard = deepcopy(board)
                playPiece(tempBoard, i, j, False, player)
                newPath = longestPath(tempBoard, player)
                if newPath > bestPath:
                    bestPath = newPath
                    row, col, permanent = i, j, False
                tempBoard = deepcopy(board)
                playPiece(tempBoard, i, j, True, player)
                newPath = longestPath(tempBoard, player)
                if newPath > bestPath:
                    row, col, permanent = i, j, True
    if row == -1 or not emptyPlace(board, row, col):
        return randomMove(board)
    return row, col, permanent

def fullBoard(board):
    for i in range(8):
        for j in range(12):
            if board[i][j] == "-":
                return False
    return True



while(True):

    # row,col,permanent = randomMove(board)

    if currentPlayer == 'b':
        row = -1
        while not (row < 8 and row >= 0):
            row = (raw_input('Enter row '))
            if row.isdigit():
                row = int(row) - 1
        col = -1
        while col == -1:
            colInput = (raw_input('Enter column '))
            if colInput.isalpha() and ord(colInput.lower()) >= ord('a') and ord(colInput.lower()) <= ord('l'):
                col = ord(colInput.lower()) - ord('a')
        permanentInput = ''
        while not (permanentInput == 'y' or permanentInput == 'n'):
            permanentInput = raw_input('Permanent? (y/n) ')
        permanent = permanentInput == 'y'
    else:
        row,col,permanent = baselineMove(board, currentPlayer)

    if playPiece(board, row, col, permanent, currentPlayer):
        permanentOutput = 'permanent' if permanent else 'regular'
        playLocation = '(%d,%c)' % (row+1, chr(ord('A')+col))
        print('Player %s put a %s piece at %s') % (currentPlayer, permanentOutput, playLocation)
        printBoard(board)
        if isWinner(board, currentPlayer):
            print('Player %s wins!!!' % currentPlayer)
            break
        elif isWinner(board, otherPlayer(currentPlayer)):
            print('Player %s player wins!!!' % otherPlayer(currentPlayer))
            break
        elif fullBoard(board):
            print 'Board is full...'
            break
        currentPlayer = otherPlayer(currentPlayer)
        print('Player %s\'s turn' % currentPlayer)
