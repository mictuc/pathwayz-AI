import random

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
        return self.longestPath(board, player) == 12 \
            or self.longestPath(board, self.otherPlayer(player)) == 12 \
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
        return self.longestPath(board, player) == 12


    def utility(self, state):
        board, player = state
        # TODO

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

    def simulatedMove(self, board, permanent, row, col, player):
        tempBoard = [row[:] for row in board]
        self.succ((tempBoard, player), (row, col, permanent))
        return self.longestPath(tempBoard, player)

    def simulatedAdvancedMove(self, board, permanent, row, col, player):
        tempBoard = [row[:] for row in board]
        self.succ((tempBoard, player), (row, col, permanent))
        return self.longestPath(tempBoard, player)-0.4*self.longestPath(tempBoard, self.otherPlayer(player))

game = PathwayzGame()

def randomMove(game, state):
    # Taking in a game and state, returns a random valid move
    return random.choice(game.actions(state))

def baselineMove(game, state):
    #TODO FIX THIS...
    _, player = state
    bestPath = 0
    options = []
    for action in game.actions(state):
        newState = game.succ(state, action)
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
    board, player = state
    bestPath = 0
    options = []
    for i,j in [(i, j) for i in range(8) for j in range(12)]:
        if game.emptyPlace(state, i, j):
            # try regular piece
            newPath = game.simulatedAdvancedMove(board, False, i, j, player)
            if newPath > bestPath:
                bestPath = newPath
                options = [(i, j, False)]
            elif newPath == bestPath:
                options.append((i, j, False))
            # try permanent piece
            newPath = game.simulatedAdvancedMove(board, True, i, j, player)
            if newPath > bestPath:
                bestPath = newPath
                options = [(i, j, True)]
            elif newPath == bestPath:
                options.append((i, j, True))
    if len(options) == 0:
        return randomMove(game, state)
    return random.choice(options)

class GameManager():
    def __init__(self):
        # Initializes GameManager object
        self.game = PathwayzGame()
        self.state = game.startState()
        self.policies = {'Human':None, 'PAI Random':randomMove, 'PAI Baseline':baselineMove, 'PAI Advanced Baseline':advancedBaselineMove}
        self.displayBoard()

    def setPlayers(self):
        # Initializes player policies and names
        player1Policy = document.getElementById("player1").value
        player1Name = document.getElementById("player1name").value
        player2Policy = document.getElementById("player2").value
        player2Name = document.getElementById("player2name").value
        self.playerNames = {'w':player1Name, 'b':player2Name}
        self.isAI = {'w':player1Policy!='Human', 'b':player2Policy!='Human'}
        self.policy = {'w':self.policies[player1Policy], 'b':self.policies[player2Policy]}
        # If player 1 is an AI, it will take its turn
        if self.isAI[self.game.player(self.state)]:
            self.AITurn()

    def AITurn(self):
        # Make's AI's move
        if self.game.isEnd(self.state): return
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
        elif self.isAI[self.game.player(self.state)]:
            self.AITurn()

    def humanMove(self, sqNo):
        # Takes in the square number selected by the player and if able, plays
        # the player's piece at the square
        if self.game.isEnd(self.state):
            print('Game is over.')
            return
        if self.isAI[self.game.player(self.state)]:
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
        elif self.isAI[self.game.player(self.state)]:
            self.AITurn()

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
    	document.getElementById("modalInformation").innerHTML = "<h2>Player 1</h2><br><select class=\"soflow\" id=\"player1\"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option></select><input type=\"text\" style=\"display: inline;\" id=\"player1name\" value=\"Player 1\"><br><h2>Player 2</h2><br><select class=\"soflow\" id=\"player2\"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option></select><input type=\"text\" style=\"display: inline;\" id=\"player2name\" value=\"Player 2\"><br><a href=\"#\" onclick=\"closeModal(); pathwayzGame.gameManager.setPlayers();\">Start Game</a></div>";

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

gameManager = GameManager()
