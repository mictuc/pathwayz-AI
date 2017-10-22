## Baseline for Pathwayz AI

import random
from copy import copy, deepcopy

board = [['-' for i in range(12)] for j in range(8)]
# for i in range(11):
#     board[0][i] = 'w'


currentPlayer = 'w'

# TODO: do we even need to pass board? is it global?

def printBoard(board):
    # Prints out board in console
    for row in board:
        print(row)

def otherPlayer(player):
    if player == 'w':
        return 'b'
    elif player == 'b':
        return 'w'
    else:
        raise Exception('Not valid player')

def flipPieces(board, row, col):
    for i in range(row-1,row+2):
        if i >= 0 and i < 8:
            for j in range(col-1, col+2):
                if j >= 0 and j < 12:
                    if board[i][j] == 'b' or board[i][j] == 'w':
                        board[i][j] = otherPlayer(board[i][j])


# def checkPath(board, player, row, col, alreadyChecked):
#     #print alreadyChecked
#     for i in range(row-1, row+2):
#         if i >= 0 and i < 8:
#             for j in range(col-1, col+2):
#                 if j >= 0 and j < 12:
#                     if board[i][j].lower() == player:
#                         if j == 11:
#                             return True
#                         elif ((i, j)) not in alreadyChecked:
#                             alreadyChecked.append((i, j))
#                             if checkPath(board, player, i, j, alreadyChecked):
#                                 return True
#     return False


def checkLongestPath(board, player, row, col, alreadyChecked):
    farthestCol = -1
    #print alreadyChecked
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
                            maxCol = checkLongestPath(board, player, i, j, alreadyChecked)
                            if maxCol > farthestCol:
                                farthestCol = maxCol
    return farthestCol


# TODO: do we need to pass already checked? should it be global? can we modify it? what is data?
# TODO: probably make this recursion more efficient

# def checkWinner(board, player):
#     alreadyChecked = []
#     for i in range(8):
#         if (board[i][0].lower() == player):
#             alreadyChecked.append((i, 0))
#             if checkPath(board, player, i, 0, alreadyChecked):
#                 return True
#     return False

# def checkWinner(board, player):
#     alreadyChecked = []
#     longestPath = -1
#     for i in range(8):
#         if (board[i][0].lower() == player):
#             alreadyChecked.append((i, 0))
#             newPath = checkLongestPath(board, player, i, 0, alreadyChecked)
#             if newPath > longestPath:
#                 longestPath = newPath
#             if longestPath == 11:
#                 return True
#     print(longestPath+1)
#     return False

def checkWinner(board, player):
    alreadyChecked = []
    longestPath = -1
    for i in range(8):
        if (board[i][0].lower() == player):
            alreadyChecked.append((i, 0))
            newPath = checkLongestPath(board, player, i, 0, alreadyChecked)
            if newPath > longestPath:
                longestPath = newPath
            if longestPath == 11:
                return 12
    return longestPath + 1


def playPiece(board, row, col, permanent, player):
    if not (row < 8 and row >= 0 and col < 12 and col >= 0):
        print('Row, column out of bounds')
        return False
    elif board[row][col] != '-':
        print('Position is already played')
        return False
    elif permanent:
        board[row][col] = otherPlayer(player).upper()
        flipPieces(board, row, col)
        return True
    else:
        board[row][col] = player
        return True

def randomMove():
    row = random.randint(1,8)
    col = random.randint(1,12)
    permanent = random.choice(['y','n'])
    return row,col,permanent

def baselineMove(board, player):
    bestPath = 0
    row, col, permanent = -1, -1, False
    for i in range(8):
        for j in range(12):
            tempBoard = deepcopy(board)
            playPiece(tempBoard, i, j, False, player)
            newPath = checkWinner(tempBoard, player)
            if newPath > bestPath:
                bestPath = newPath
                row, col, permanent = i, j, False
            tempBoard = deepcopy(board)
            playPiece(tempBoard, i, j, True, player)
            newPath = checkWinner(tempBoard, player)
            if newPath > bestPath:
                row, col, permanent = i, j, True
    return row, col, permanent



def fullBoard(board):
    for i in range(8):
        for j in range(12):
            if board[i][j] == "-":
                return False
    return True



while(True):
    row = -1
    col = -1
    permanentInput = ''
    player = ''
    print('%s player\'s turn' % currentPlayer)

    # TODO: prevent game from breaking when input not an int

    if currentPlayer == 'b':
        while not (row < 8 and row >= 0):
            row = (raw_input('Enter row '))
            if row.isdigit():
                row = int(row) - 1
        while not (col < 12 and col >= 0):
            col = (raw_input('Enter column '))
            if col.isdigit():
                col = int(col) - 1
        while not (permanentInput == 'y' or permanentInput == 'n'):
            permanentInput = raw_input('Permanent? (y/n) ')
        permanent = permanentInput == 'y'
    else:
        row,col,permanent = baselineMove(board, currentPlayer)

    # TODO: maybe make the other player checking happen less often
    if playPiece(board, row, col, permanent, currentPlayer):
        if checkWinner(board, currentPlayer) == 12:
            print('%s player wins!!!' % currentPlayer)
            break
        elif checkWinner(board, otherPlayer(currentPlayer)) == 12:
            print('%s player wins!!!' % otherPlayer(currentPlayer))
            break
        elif fullBoard(board):
            print 'board is full...'
            break
        currentPlayer = otherPlayer(currentPlayer)
        printBoard(board)

printBoard(board)
