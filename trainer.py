import random
import collections
import time
import json
import pathwayzGamePython.py

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
        # Returns best dumb move assuming weights trained for player
        board, player = state
        actions = shuffle(game.actions(state))
        scores = []
        for action in actions:
            newState = game.simulatedMove(state, action)
            score = self.evaluationFunction(game, newState[0], player)
            scores.append((score, action))
        bestScore, bestAction = sorted(scores, key=lambda score: score[0], reverse=True)[0]
        # self.updateWeights(game, player, board, game.simulatedMove(state, bestAction)[0])
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
        eta = 0.01
        oldScore = self.evaluationFunction(game, oldBoard, player)
        newScore = self.evaluationFunction(game, newBoard, player)
        features = self.featureExtractor(game, oldBoard, player)
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
