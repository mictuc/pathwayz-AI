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

def backpropagate(node,score):
    node.visits += 1
    node.utility = node.utility+score
    if node.parent:
        backpropagate(node.parent,score)

def MCTSdepthCharge(game,node,originalPlayer):
    state = node.state
    if game.isEnd(state):
        if game.isWinner(state,state[1]):
            if originalPlayer:
                backpropagate(node,1)
                return
            else:
                backpropagate(node,0)
                return
        elif (game.isWinner(state,game.otherPlayer(state[1]))):
            if originalPlayer:
                backpropagate(node,0)
                return
            else:
                backpropagate(node,1)
                return
    moves = game.actions(state)
    rand = random.choice(moves)
    newState = game.simulatedMove(state, rand)
    for child in node.children:
        if child.state == newState:
            MCTSdepthCharge(game, child, not originalPlayer)
            return
    newNode = Node(newState,[],0.0,0.0,node,rand)
    node.children.append(newNode)
    MCTSdepthCharge(game, newNode, not originalPlayer)

def monteCarloTreeSearch(game,state):
    rootNode = Node(state,[],0.0,0.0,None,None)
    count = 200000
    node = rootNode
    for action in game.actions(state):
        if game.isWinner(game.simulatedMove(state,action),state[1]):
            return action
    for i in range(count):
        node = select(node)
        node = expand(game,node)
        for child in node.children:
            MCTSdepthCharge(game, child, False)
    move = sorted(rootNode.children, key=lambda c: c.utility/c.visits, reverse=True)[0].action
    return move

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

def featuresMove(game, state):
    _, player = state
    bestScore = 0
    options = []
    actions = game.actions(state)
    for action in actions:
        newState = game.simulatedMove(state, action)
        newBoard, _ = newState
        newScore = evaluationFunction(game, newBoard, player)
        if newScore > bestScore:
            bestScore = newScore
            options = [action]
        elif newScore == bestScore:
            options.append(action)
    if len(options) == 0:
        return randomMove(game, state)
    return random.choice(options)

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

def TDLfeaturesMove(game, state):
    _, player = state
    bestScore = -float("inf")
    options = []
    actions = game.actions(state)
    for action in actions:
        newState = game.simulatedMove(state, action)
        newBoard, _ = newState
        newScore = TDLevaluationFunction(game, newBoard, player)
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
            return evaluationFunction(game, board, game.otherPlayer(player))
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

def beamScores(game, state, depth, beamWidth, evalFunction):
    board, player = state
    if game.isEnd(state) or depth == 0:
        return [(evalFunction(game, board, player), None, state)]
    actions = shuffle(game.actions(state))
    numTopScores = beamWidth[depth-1]
    if numTopScores == None: numTopScores = len(actions)
    topScores = [(-float('inf'), None, None) for i in range(numTopScores)]
    newStates = []
    for action in actions:
        newBoard, newPlayer = game.simulatedMove(state, action)
        newScore = evalFunction(game, newBoard, player)
        minScore = sorted(topScores, key=lambda score: score[0])[0]
        if newScore > minScore[0]:
            topScores.remove(minScore)
            topScores.append((newScore, action, (newBoard, newPlayer)))
    newTopScores = []
    for score, action, newState in topScores:
        _, _, lastState = sorted(beamScores(game, newState, depth-1, beamWidth, evalFunction), key=lambda score: score[0], reverse=True)[0]
        newTopScores.append((evalFunction(game, lastState[0], player), action, lastState))
    return newTopScores

def beamMinimax(game, state):
    board, player = state
    if oneMoveAway(game, board, game.otherPlayer(player)):
        depth = 2
        beamWidth = [None, None]
    else:
        depth = 3
        beamWidth = [1, 5, 10]
    scores = beamScores(game, state, depth, beamWidth, evaluationFunction)
    _, bestMove, _ = sorted(scores, key=lambda score: score[0], reverse=True)[0]
    return bestMove

def beamMinimaxMoreFeatures(game, state):
    board, player = state
    if oneMoveAway(game, board, game.otherPlayer(player)):
        depth = 2
        beamWidth = [None, None]
    else:
        depth = 3
        beamWidth = [1, 5, 10]
    scores = beamScores(game, state, depth, beamWidth, smartEvaluationFunction)
    _, bestMove, _ = sorted(scores, key=lambda score: score[0], reverse=True)[0]
    return bestMove

def beamMinimaxTDL(game, state):
    board, player = state
    if oneMoveAway(game, board, game.otherPlayer(player)):
        depth = 2
        beamWidth = [None, None]
    # ELSEIF NO WAY TO EXTEND LONGEST PATH...
    else:
        depth = 3
        beamWidth = [1, 5, 10]
    scores = beamScores(game, state, depth, beamWidth, TDLevaluationFunction)
    _, bestMove, _ = sorted(scores, key=lambda score: score[0], reverse=True)[0]
    return bestMove

def AVG(scores):
    scores = sorted(scores)
    weightedTotal = 0
    """
    for i in range(len(scores)):
        weightedTotal += scores[i] / (2 ^ (i+1))
    """
    for i in range(min(5, len(scores))):
        weightedTotal += scores[i] / (2 ^ (i+1))
    return weightedTotal

def valueExpectimax(game, state, depth, originalPlayer):
    board, player = state
    if game.isEnd(state) or depth == 0:
        if originalPlayer:
            return TDLevaluationFunction(game, board, player)
        else:
            return TDLevaluationFunction(game, board, game.otherPlayer(player))
    elif originalPlayer:
        highestScore = -float('inf')
        for action in game.actions(state):
            score = valueExpectimax(game, game.simulatedMove(state, action), depth-1, False)
            highestScore = MAX([highestScore, score])
        return highestScore
    else:
        scores = []
        for action in game.actions(state):
            score = valueExpectimax(game, game.simulatedMove(state, action), depth-1, True)
            scores.append(score)
        sortedScores = sorted(scores, reverse=True)
        expectedScore = 0
        for i in range(min(5, len(sortedScores))):
            expectedScore += sortedScores[i]
        expectedScore = expectedScore / 5.0
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

def initSmartFeatureWeights():
    weights = dict(float)
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

def initOpponentWeights():
    #weights = dict(float)
    weights = {"your2Flip": 0.7822916666666648, "myPerm": 6.375000000000007, "diffPerm": 5.657291666666555, "my2Flip": -0.43645833333333245, "your1Flip": 0.5760416666666688, "your2Empty": -0.8906250000000077, "my8Empty": -0.047916666666666705, "your4Flip": -0.09791666666666667, "my3Flip": 0.0500000000000001, "your8Flip": -0.1, "your5Empty": 0.220833333333333, "your8Empty": 0.09479166666666669, "yourCols": -4.266666666666366, "your3Empty": -0.13125, "diffLongestPath": 91.69166666666835, "yourPerm": -4.282291666666636, "my8Flip": 0.1, "my5Empty": -0.005208333333333049, "myTotal": 6.836458333333379, "diffTotal": 9.201041666666528, "my4Empty": 0.8666666666666678, "yourLongestPath": -34.5416666666668, "my4Flip": 0.09895833333333334, "your6Flip": -0.1, "your1Empty": -0.03229166666666664, "your7Empty": 0.06979166666666668, "my3Empty": 0.596875000000004, "my1Flip": -1.504166666666667, "my6Flip": 0.1, "myLongestPath": 57.150000000000546, "myCols": 26.93333333333583, "your6Empty": 0.055208333333333366, "your5Flip": -0.09687500000000002, "my6Empty": 0.0697916666666667, "my7Flip": 0.1, "my7Empty": -0.05000000000000005, "your4Empty": -0.06874999999999995, "your7Flip": -0.1, "my5Flip": 0.1, "yourTotal": -2.364583333333319, "your3Flip": -0.07708333333333331, "my1Empty": 0.35937499999999944, "my2Empty": 1.27187500000002}
    return weights

def initSmartOpponentWeights():
    #weights = dict(float)
    weights = {"yourTurnsAwayMid": 217.5669936760614, "diffLongestPath": 15013.415941931396, "my3EmptyEnd": -56.98086974755125, "your2PathExtensionMid": -45.722207225856096, "diffLongestPermPath": 15532.663438758429, "your4FlipMid": -4.825422130412166, "blockedMeEarly": 72.75289717746845, "myTurnsAwayEarly": -460.47097296284284, "diff1EdgeEmpty": 77.03328733394876, "myTotalEnd": 1942.7114444698575, "yourLongestSafePathSquaredEnd": -4296.584618578756, "yourClosedPathFlexMid": -133.06802461998342, "your8Empty": 0, "myLongestPermPathSquaredEarly": 0.9081676101095164, "amTurnsAheadMid": 410.2704496427704, "myLongestEvenPathSquaredMid": -80.01249182852244, "your1FlipEnd": -91.64358751992845, "myLongestSafePath": 6059.318505107663, "myLongestEvenPathEarly": -14.290720593484972, "yourOneTurnAwayEarly": 0.0, "my1EmptyEarly": -3.0864191467372204, "your5Empty": 0, "diffLongestSafePathEnd": 10596.729349374236, "myLongestEvenPathSquared": 9075.448014410476, "futureAheadEnd": 20113.96581796395, "my3EdgeEmptyEnd": 7.249228665849321, "yourClosedPathFlexEnd": -513.2465103743647, "diff4FlipEarly": 1.0814157651670944, "yourLongestPath": -4822.031580284883, "futureAhead": 20063.125500124577, "your2PathExtension": -88.01195789761108, "diff3FlipMid": 20.799424237607692, "diffLongestPathSquaredEnd": 5507.942493741861, "diff3FlipEnd": 180.66851201693473, "myPermMid": -189.4742723825262, "yourPermEnd": -1256.6657786290255, "your4EdgeEmptyEarly": 2.067629808413787, "diff3EmptyEnd": -133.31252054211373, "yourLongestFuturePath": -6495.888781355024, "my3EmptyMid": -41.44353043102558, "diff1FlipEnd": -289.6056854226995, "my6Empty": 0, "yourTurnsAwaySquared": 1406.0342968996856, "your1FlipEarly": -169.38223397478203, "yourColsEnd": 514.7443633783677, "diff4Flip": 26.449933498579405, "your4Empty": 97.58368967218586, "yourLongestExtensionEarly": -171.9306194294323, "diffLongestPermPathEarly": 147.7348103753336, "diffLongestEvenPathSquaredMid": 312.9424604903454, "yourTurnsAwayEarly": -789.3175070728257, "your3Flip": -89.74364392764853, "diffLongestSafePathEarly": -186.10596176429402, "yourLongestPermPathSquared": -7697.798612698168, "my3PathExtension": 82.79657727972814, "diffTotalEarly": -57.328801078939556, "myLongestPermPathSquared": 8480.277367185661, "diff1EdgeEmptyMid": 33.259104607796566, "yourLongestPathSquaredEnd": -4319.06231849227, "diffPermEarly": 48.11674400734055, "yourClosedPathFlex": -641.7900248988254, "myOneTurnAway": 45856.86187103466, "yourLongestEvenPathEnd": -4960.85992203528, "myLongestFuturePathSquaredEnd": 18845.33828272426, "blockedMyLeftEnd": -4036.3201686186103, "myLongestFuturePathEnd": 11722.539982043903, "myLongestExtensionEnd": -421.36060677293926, "blockedMyRightMid": -815.6421170330424, "diff3FlipEarly": 8.835837394187587, "turnsAhead": 18310.365792456156, "yourLongestSafePathSquaredMid": -1110.5795680274045, "your1EmptyMid": -45.419342803955956, "yourTotal": -1562.630208873833, "diffLongestSafePathMid": 838.1704248920721, "diff2FlipMid": 15.09933130939728, "myLongestPathSquaredEnd": 16569.139188327437, "behind": -19518.414954263542, "your1FlipMid": -318.41721085588927, "blockedMyLeft": -4155.097659653071, "diffLongestSafePathSquaredMid": 253.33692868850264, "your3EdgeEmpty": 16.36456368637668, "your2EdgeEmptyEarly": 1.298696700109425, "my4FlipMid": -0.4578354749490522, "myTurnsAwayMid": -1722.157572981146, "your4EdgeEmptyMid": 0.9775186231841196, "your3PathExtension": -226.61290606059964, "diffLongestFuturePathSquared": 5287.834467579524, "yourLongestPermPathSquaredEarly": -22.03283936902007, "my3EmptyEarly": -5.457268058665229, "my2PathExtensionMid": -16.367405526474098, "yourPermEarly": -26.30078545129056, "my1FlipEnd": -91.85943450798445, "yourLongestEvenPathEarly": -65.04093600920997, "yourLongestPermPath": -8050.449558865587, "ahead": 18450.181536447726, "your2PathExtensionEarly": -3.7440722128203485, "diff4EmptyEnd": -148.52164841065905, "diffPermEnd": 2991.575624026244, "yourLongestPermPathEarly": -107.92722071294482, "diff3EdgeEmpty": -9.717859954984771, "myLongestPathSquared": 15816.912084392066, "my2EmptyEarly": -6.855199105295753, "yourLongestFuturePathSquared": -9025.615795987564, "myLongestExtension": -725.8170584195013, "my3FlipMid": 8.866121569219262, "behindEarly": 2068.092648268146, "myLongestSafePathEnd": 7416.3938425215, "myLongestPermPath": 7543.021379892886, "your2FlipEnd": -11.581610966498182, "yourTotalEnd": -803.7403095458801, "your1Flip": -577.1094906839329, "your3FlipMid": -23.632742818950714, "yourPermMid": -600.7699511565064, "yourLongestSafePath": -5198.083640727706, "myPerm": 1578.9842399040617, "diff1EdgeEmptyEarly": -4.49500484278212, "myLongestSafePathSquaredEnd": 8989.074962183242, "myLongestFuturePathMid": -1926.2478735648249, "my8Empty": 0, "your4Flip": -15.331902803353769, "blockedYourRightEarly": -56.67694552619545, "diffCols": 3447.4734884349386, "diff1EmptyMid": 27.809327320273496, "yourLongestEvenPathSquared": -7025.476518362022, "your2EmptyEarly": 5.771600412806242, "my4EdgeEmptyMid": -2.926707968987763, "amTurnsBehindEnd": -28559.680166270504, "blockedMyLeftMid": -115.03166628253976, "onlyTurnAwayEnd": 21226.32233957107, "diff1EdgeEmptyEnd": 48.26918756893425, "your4EmptyEarly": 3.5057408562755574, "yourOpenPathFlexEnd": 215.9754103445665, "diffLongestFuturePathEnd": 14443.235002961825, "diffLongestSafePathSquaredEnd": 4353.225274859486, "myLongestPermPathSquaredMid": 24.223932188879076, "diffLongestFuturePath": 15935.561084582028, "yourOpenPathFlexEarly": -16.789389513924547, "blockedMyLeftEarly": 8.854175248078182, "your2EdgeEmpty": -3.591511781238535, "myLongestPathSquaredEarly": -118.83388889340188, "yourLongestPathSquared": -5770.304586320543, "myClosedPathFlexEnd": 934.7821170918664, "my4EmptyEnd": -117.3308188703575, "diff3EdgeEmptyMid": -1.2966235434124207, "myLongestSafePathSquaredMid": -284.51123543965406, "aheadMid": -320.0731866944002, "your6Empty": 0, "my1PathExtension": 60.82440407762451, "myLongestFuturePathSquaredEarly": -156.38598264576856, "my3PathExtensionMid": 26.657979216480452, "yourLongestPathEarly": 66.08476044196395, "diffLongestEvenPathMid": 1110.4556111879988, "yourLongestSafePathSquared": -5425.294918012042, "your2FlipMid": -65.97866022224432, "amTurnsAheadEarly": -432.875112587467, "diff1EmptyEarly": -6.01516597992177, "diff2Flip": 336.2426554278908, "myTotalEarly": -45.09521942106472, "yourLongestExtensionMid": -1483.4373230235012, "blockedMeMid": -930.6737833155826, "my1EdgeEmptyEarly": -3.094274151043162, "my2PathExtensionEnd": 173.89177310245003, "blockedYouEnd": 5776.564385558303, "diff2Empty": -161.093224585815, "my3FlipEnd": 168.72400194966173, "yourOpenPathFlexMid": 5.5607742493619945, "your2Flip": -104.80249968788581, "diffPerm": 3460.494400974237, "yourLongestFuturePathSquaredEnd": -5282.295354189657, "yourOpenPathFlex": 204.74679508000403, "my4EdgeEmptyEnd": -16.168488529334795, "your2PathExtensionEnd": -38.54567845893463, "diffColsEnd": 3173.434527490144, "your3FlipEarly": -5.4417983514628006, "my2PathExtensionEarly": 11.208210321227307, "your1EdgeEmpty": -14.077141923599475, "your4FlipEnd": -10.254257293438654, "diff1Empty": 316.517789096255, "onlyTurnAway": 22630.08884460779, "diff4EdgeEmpty": -30.64431646148529, "blockedYourRightMid": 117.43411508137827, "diff2EmptyMid": 3.868853194009724, "yourTotalEarly": 12.233581657874478, "yourTurnsAwaySquaredEnd": 1873.5949657709045, "diff2FlipEnd": 275.22979036950034, "myClosedPathFlex": 918.1991205309615, "your3EdgeEmptyEnd": 19.40864114195895, "diff4EdgeEmptyMid": -3.073534851397457, "your1PathExtensionMid": -40.44479241135185, "diff2EdgeEmptyMid": -13.562666880441926, "futureAheadEarly": -421.3355509153697, "myOpenPathFlexEarly": 1.9952744639047777, "blockedMeEnd": -7459.2021561244865, "behindEnd": -19652.725421901254, "diffLongestFuturePathSquaredEarly": -29.908072906149417, "myLongestFuturePathSquaredMid": -831.4414678496264, "diff2EdgeEmpty": 35.44544546954163, "diff4Empty": -180.85066942039887, "blockedYourLeftEnd": 3713.2674147000766, "myTurnsAwaySquaredEnd": -4717.354932657996, "onlyTurnAwayMid": 1223.80650503672, "myPermEarly": 21.81595855604995, "your3EdgeEmptyMid": -5.378067844250867, "myTurnsAway": -14153.783528928532, "yourLongestExtensionEnd": -47.9459252838638, "diffLongestEvenPathSquared": 5392.6080876762235, "your3EmptyMid": -5.613512943412475, "yourLongestEvenPathSquaredEarly": -9.966229390779478, "futureBehind": -30146.185459996475, "diffLongestEvenPathSquaredEnd": 5074.009163846885, "my4FlipEnd": 21.366924715234994, "myClosedPathFlexEarly": -4.282237657817136, "your3Empty": 100.7409679049545, "my2FlipEnd": 426.0038716036725, "yourOneTurnAwayEnd": -14941.57827187486, "your1PathExtensionEarly": -16.184952449249998, "my1PathExtensionEarly": -5.418537432820195, "yourLongestFuturePathEnd": -2720.6950209179213, "your3EmptyEarly": 12.211307841016161, "your1PathExtension": -230.14532454200307, "futureBehindMid": -3112.631587279232, "my2EmptyMid": -26.824843388866594, "diff1Flip": -282.85839231740124, "your3EmptyEnd": 94.40983967401814, "turnsAheadSquaredMid": 907.4912613246343, "yourLongestFuturePathMid": -3654.9970681162827, "myTurnsAwaySquaredEarly": -192.92112310242328, "futureAheadMid": 192.53523307603783, "diffLongestFuturePathSquaredMid": 677.2494035990866, "my1FlipMid": -339.6612844389652, "diff3Flip": 210.30377364873016, "yourLongestSafePathMid": -1907.9664539692392, "diff2EdgeEmptyEarly": -1.7637401597026192, "turnsAheadEarly": -328.8465341099841, "my4EmptyMid": -90.58732036077039, "yourLongestEvenPath": -6917.7002030498315, "myColsMid": -2270.41722961637, "my2PathExtension": 168.732577897204, "yourTurnsAwayEnd": 4701.241110257703, "my4Empty": -248.88680575180058, "my3PathExtensionEarly": 2.056857655448325, "blockedYouMid": 335.178449318923, "myLongestEvenPathEnd": 8130.473649138999, "aheadEarly": -933.8694281401578, "my1EdgeEmptyMid": 0.6757876714926115, "myLongestPathMid": -1655.9116730284156, "diffLongestPathEnd": 14816.649684450926, "myTurnsAwaySquaredMid": -579.645545607317, "my1EmptyMid": -25.409150564621132, "myOpenPathFlex": -616.982652744021, "your7Empty": 0, "diffLongestEvenPathSquaredEarly": 2.359935561213527, "myLongestPathEarly": -380.5528874752204, "my2EdgeEmpty": 14.718444988927743, "my2Flip": 449.27884655910134, "amTurnsBehindEarly": 1737.7920578351152, "my7Empty": 0, "futureBehindEarly": 1718.4719741658969, "diffLongestEvenPathEnd": 13091.333571174258, "myTotal": 1513.0684777025122, "your2EdgeEmptyMid": -2.1938738945859058, "diff2EdgeEmptyEnd": 50.771852509686134, "blockedMyRightEnd": -3422.8819875058675, "diffPermMid": 411.29567877397955, "your3FlipEnd": -60.78931109056832, "my3EdgeEmptyMid": -7.538855463781753, "my4FlipEarly": 1.2142973589563038, "myLongestEvenPathMid": -776.5687338173485, "my3FlipEarly": 8.084082745627853, "myClosedPathFlexMid": -12.300758903086615, "yourClosedPathFlexEarly": 4.52451009552248, "blockedYourLeftEarly": 9.314315631162462, "my3Flip": 185.692227097842, "my4EdgeEmpty": -22.58531058544378, "diffLongestPermPathSquaredEnd": 5235.262428540669, "yourColsEarly": 33.402137146930805, "yourLongestPermPathMid": -1755.9007331567302, "diffLongestPathSquaredEarly": -52.967875399819846, "diffTotalEnd": 2746.4517540157462, "your1EdgeEmptyEarly": 3.1688258739489044, "my2FlipMid": -16.802138846071408, "diff3EdgeEmptyEnd": -4.991886499510672, "yourTurnsAway": 4158.32393019428, "diff3EmptyEarly": -10.9031880761523, "amTurnsBehindMid": -3012.1914986141783, "my2EdgeEmptyEnd": 30.974492215742394, "yourLongestPathEnd": -2672.749095634069, "onlyTurnAwayEarly": 0.0, "myTurnsAwayEnd": -11947.954982984564, "diffLongestSafePath": 11257.402145835396, "diffLongestPermPathSquared": 5566.010094194956, "diffColsMid": 483.2899299480263, "diff2FlipEarly": 45.913533748993565, "my2EdgeEmptyMid": -14.391354457212065, "myOneTurnAwayEnd": 44285.591901934225, "diff4EmptyMid": -5.6883547203656475, "myOneTurnAwayEarly": 0.0, "myLongestPathSquaredMid": -757.3497428197055, "my5Empty": 0, "diffTotal": 3075.1504574096693, "yourTurnsAwaySquaredMid": 215.4137192910122, "myOpenPathFlexEnd": -546.726720227578, "my3EdgeEmpty": -2.31125426924224, "yourLongestPathMid": -2171.5597450927817, "yourLongestFuturePathSquaredEarly": -10.179146711228768, "your4EmptyMid": -58.30995134514935, "your1EdgeEmptyMid": -31.519147379426602, "myLongestEvenPathSquaredEarly": -16.122183596437484, "your2EdgeEmptyEnd": -2.7109179200954343, "diff4FlipMid": 1.977175709406602, "blockedYourRightEnd": 2063.2969708582277, "diffLongestSafePathSquared": 4587.222523363114, "diff3EmptyMid": -25.35532443358534, "yourLongestPermPathEnd": -6166.61327166257, "myOpenPathFlexMid": -72.2512069803468, "diff2EmptyEarly": -8.386315885237682, "myLongestPermPathMid": -562.8971687887539, "myLongestFuturePathEarly": -414.67313858536903, "diffLongestPathSquaredMid": 166.4744363019543, "your4EdgeEmpty": 21.024576893951753, "your2EmptyEnd": 250.1791732124023, "diffLongestEvenPath": 14260.697731111328, "my4EmptyEarly": -41.10512485400647, "yourLongestPathSquaredMid": -1418.4923059094435, "my3PathExtensionEnd": 54.081740407799586, "myColsEarly": -297.42119084510784, "myLongestExtensionMid": -270.33620053641215, "myLongestPath": 10199.3843616466, "blockedMyRight": -4188.625382609519, "yourCols": -2259.5895090335, "diff1EmptyEnd": 294.7236277559034, "myColsEnd": 4644.7686753524185, "diff2EmptyEnd": -156.575761894587, "diffLongestFuturePathSquaredEnd": 4628.776470219912, "my3EdgeEmptyEarly": -1.9955858046431552, "yourPerm": -1886.5101610701538, "diff3EdgeEmptyEarly": -3.4293499120616846, "blockedYourLeft": 3955.5260645687863, "diff4EdgeEmptyEnd": -23.268027946594408, "my4EdgeEmptyEarly": -3.4484474204545297, "diffTotalMid": 372.08448363952294, "blockedMyRightEarly": 63.89872192939032, "myLongestExtensionEarly": -34.12025111014984, "blockedYou": 6125.580204982193, "diff1FlipMid": -95.2149721223272, "diffLongestEvenPathEarly": 50.75021541572506, "futureBehindEnd": -28752.025846883167, "your3PathExtensionMid": -95.67531047326716, "my4Flip": 22.22078243257556, "my1FlipEarly": 2.6548233074531176, "yourLongestFuturePathEarly": -105.84585898746855, "myOneTurnAwayMid": 1390.429969100472, "blockedYouEarly": -47.362629895032995, "aheadEnd": 19463.814151282284, "turnsAheadSquared": 7361.016690190623, "myCols": 2120.9860882242374, "blockedMe": -8362.443042262597, "yourLongestEvenPathSquaredMid": -1094.2687326113873, "myLongestFuturePath": 9446.672303226993, "your1EdgeEmptyEnd": 14.347137915211464, "turnsAheadEnd": 16649.19609324228, "amTurnsAhead": 20028.84572189983, "myLongestPermPathSquaredEnd": 8430.293878497754, "diffLongestSafePathSquaredEarly": -22.96676351821334, "your2EmptyMid": -21.77840224171934, "your3EdgeEmptyEarly": 2.289198722001954, "blockedYourRight": 2145.3541404134107, "diffLongestPathMid": 515.6480720643655, "yourOneTurnAwayMid": -2490.2642206282717, "myPermEnd": 1734.9098453972117, "yourOneTurnAway": -10000000, "my1EdgeEmptyEnd": 59.57693631679188, "myLongestEvenPathSquaredEnd": 9166.56463427982, "diff4EmptyEarly": -26.640666289373417, "amTurnsBehind": -29834.079607049553, "myLongestSafePathMid": -1069.7960290771628, "myTurnsAwaySquared": -5498.170212478837, "my2EdgeEmptyEarly": -1.8688594362692281, "yourLongestPermPathSquaredEnd": -6739.403608789763, "your2Empty": 233.56747555015596, "turnsAheadSquaredEarly": -35.83112104310647, "diffLongestPathSquared": 5646.731693532875, "myLongestFuturePathSquared": 17938.88736000665, "diffLongestPermPathSquaredEarly": 14.312215834398335, "blockedYourLeftMid": 217.74433423754385, "my2EmptyEnd": 53.791100247587345, "diff3Empty": -169.57103305185134, "my1EmptyEnd": 246.6900187739156, "amTurnsAheadEnd": 19958.150384844554, "yourLongestSafePathEarly": -104.78167990574624, "yourLongestPermPathSquaredMid": -919.1475812060711, "diffLongestFuturePathMid": 1728.749194551457, "your4EdgeEmptyEnd": 17.934636795687176, "diffLongestPermPathSquaredMid": 313.9194775976638, "diff4FlipEnd": 23.391342024005723, "yourLongestSafePathSquaredEarly": -11.804342516977117, "diffLongestPathEarly": -446.637647917183, "myTotalMid": -397.9202473462986, "your4FlipEarly": -0.19024421283628212, "yourLongestExtension": -2860.4181374028503, "my1PathExtensionEnd": 168.61728597477818, "diffLongestFuturePathEarly": -308.8272795979, "myLongestSafePathEarly": -290.8876416700407, "your1EmptyEarly": 8.221366894593414, "yourLongestFuturePathSquaredMid": -3692.4248367533883, "myLongestPathEnd": 12143.900588816838, "yourTotalMid": -770.0047309858242, "turnsAheadMid": 1939.7245666572082, "yourLongestEvenPathSquaredEnd": -5915.581139693195, "your4EmptyEnd": 152.14050432772436, "myLongestSafePathSquared": 8628.315584537866, "diff1FlipEarly": 101.96226522762575, "your1Empty": -130.39198030646088, "my1PathExtensionMid": -102.37434446433176, "myLongestSafePathSquaredEarly": -81.86411442803607, "your3PathExtensionEarly": -5.800990965847759, "yourColsMid": -2807.115176225486, "myLongestPermPathEarly": 39.807589662388914, "my1EdgeEmpty": 7.461596647735594, "my3Empty": -103.42948073724187, "my1Flip": -427.2046456394963, "your2FlipEarly": -29.038686832476653, "diff4EdgeEmptyEarly": -4.302753663493496, "myLongestEvenPath": 7342.997528061498, "diffLongestPermPathEnd": 14184.916730681807, "yourLongestEvenPathMid": -1887.0243450053538, "your1EmptyEnd": -92.78354606376489, "my2FlipEarly": 40.66909296816344, "behindMid": -1933.7821806304128, "diffColsEarly": -209.25096900323118, "your1PathExtensionEnd": -173.51557968140128, "your3PathExtensionEnd": -125.1366046214846, "yourLongestPathSquaredEarly": 52.62732974783529, "yourLongestSafePathEnd": -3180.335506852734, "turnsAheadSquaredEnd": 6469.693355464642, "my1Empty": 25.339804580156635, "yourTurnsAwaySquaredEarly": -694.3889714955675, "diffLongestPermPathMid": 1193.0035643679787, "my2Empty": 21.546682753424772, "myLongestPermPathEnd": 8018.303459019255}
    return weights

def smartEvaluationFunction(game, board, player):
    features = game.smartFeatures(board, player)
    weights = initSmartFeatureWeights()
    value = sum([features[k] * weights[k] for k in features.keys()])
    if game.isEnd((board, player)):
        return game.utility((board, player)) + value
    return value

def TDLevaluationFunction(game, board, player):
    #features = game.TDLfeatures(board, player)
    features = game.smartFeaturesTDL(board, player)
    #weights = initOpponentWeights()
    weights = initSmartOpponentWeights()
    value = sum([features[k] * weights[k] for k in weights.keys()])
    if game.isEnd((board, player)):
        return game.utility((board, player)) + value
    return value

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
        _, player = state
        return self.isWinner(state, player) \
            or self.isWinner(state, self.otherPlayer(player)) \
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
        return self.longestPath(board, player, checkWinner = True) == 12

    def utility(self, state):
        # Takes in a state and returns 1e+6 if player is winner, -1e+6 if player
        # is loser, or 0 otherwise
        _, player = state
        if self.isWinner(state, player):
            return 10000000000
        elif self.isWinner(state, self.otherPlayer(player)):
            return -10000000000
        else:
            return 0

    def actions(self, state):
        # Returns all valid moves for the given state
        actions = []
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if self.emptyPlace(state, i, j):
                actions.append((i,j,True))
                actions.append((i,j,False))
        return actions

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

    def player(self, state):
        # Returns the player of the state
        return state[1]

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

    def longestPath(self, board, player, checkWinner = False):
        # Takes in a board and player and returns the longest contiguous
        # path (in terms of length of columns traversed) by the player
        self.alreadyChecked = [[False for i in range(12)] for j in range(8)]
        longestPath = -1
        for i,j in [(i, j) for j in (range(12) if not checkWinner else range(0)) for i in range(8)]:
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

    def TDLfeatures(self, board, player):
        featureNames = ['myLongestPath','yourLongestPath','diffLongestPath', 'myCols','yourCols','myPerm','yourPerm','diffPerm', 'myTotal','yourTotal','diffTotal', 'my1Empty','your1Empty','my2Empty','your2Empty','my3Empty','your3Empty','my4Empty','your4Empty','my5Empty','your5Empty','my6Empty','your6Empty','my7Empty','your7Empty','my8Empty','your8Empty','my1Flip','your1Flip','my2Flip','your2Flip','my3Flip','your3Flip','my4Flip','your4Flip','my5Flip','your5Flip','my6Flip','your6Flip','my7Flip','your7Flip','my8Flip','your8Flip']
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
                    if flipPotential == 1:
                        features['my1Flip'] += 1
                    elif flipPotential == 2:
                        features['my2Flip'] += 1
                    elif flipPotential == 3:
                        features['my3Flip'] += 1
                    elif flipPotential == 4:
                        features['my4Flip'] += 1
                    elif flipPotential == 5:
                        features['my5Flip'] += 1
                    elif flipPotential == 6:
                        features['my6Flip'] += 1
                    elif flipPotential == 7:
                        features['my7Flip'] += 1
                    elif flipPotential == 8:
                        features['my8Flip'] += 1
                elif flipPotential < 0:
                    if flipPotential == -1:
                        features['your1Flip'] += 1
                    elif flipPotential == -2:
                        features['your2Flip'] += 1
                    elif flipPotential == -3:
                        features['your3Flip'] += 1
                    elif flipPotential == -4:
                        features['your4Flip'] += 1
                    elif flipPotential == -5:
                        features['your5Flip'] += 1
                    elif flipPotential == -6:
                        features['your6Flip'] += 1
                    elif flipPotential == -7:
                        features['your7Flip'] += 1
                    elif flipPotential == -8:
                        features['your8Flip'] += 1
        features['diffPerm'] = features['myPerm'] - features['yourPerm']
        features['diffTotal'] = features['myTotal'] - features['yourTotal']
        features = {k:v/96.0 for k, v in features.items()}
        features['myCols'] = sum(myCols)/12.0
        features['yourCols'] = sum(yourCols)/12.0
        myLongestPath = game.longestPath(board, player)
        yourLongestPath = game.longestPath(board, game.otherPlayer(player))
        features['myLongestPath'] = myLongestPath / 12.0
        features['yourLongestPath'] = yourLongestPath / 12.0
        features['diffLongestPath'] = (myLongestPath - yourLongestPath) / 12.0
        # ADD FEATURE FOR NUM PLACES TO FLIP PATH (+1?) / LONGESTPATH + 1
        # ADD FEATURE FOR LONGEST PATH AFTER FLIP
        return features

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

    def findEvenPathLength(self, board, player, row, col):
        # Checks for the longest path (in terms of columns) from the left
        farthestCol = -1
        for i, j in self.surroundingPlaces(row, col):
            if self.evenSpaces[i][j] == player:
                if j > farthestCol:
                    farthestCol = j
                if j == 11:
                    return 11
                elif not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    maxCol = self.findEvenPathLength(board, player, i, j)
                    if maxCol > farthestCol:
                        farthestCol = maxCol
        return farthestCol

    def findLongestEvenPath(self, board, player):
        # Takes in a board and player and returns the longest contiguous
        # path (in terms of length of columns traversed) by the player
        self.alreadyChecked = [[False for i in range(12)] for j in range(8)]
        longestPath = -1
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if self.evenSpaces[i][j] == player:
                if not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    newPath = self.findEvenPathLength(board, player, i, j) - j
                    if newPath > longestPath:
                        longestPath = newPath
            # Complete path
            if longestPath == 11:
                return 12
        return longestPath + 1

    def findSafePathLength(self, board, player, row, col):
        # Checks for the longest path (in terms of columns) from the left
        farthestCol = -1
        for i, j in self.surroundingPlaces(row, col):
            if self.safeSpaces[i][j] == player:
                if j > farthestCol:
                    farthestCol = j
                if j == 11:
                    return 11
                elif not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    maxCol = self.findSafePathLength(board, player, i, j)
                    if maxCol > farthestCol:
                        farthestCol = maxCol
        return farthestCol

    def findLongestSafePath(self, board, player):
        # Takes in a board and player and returns the longest contiguous
        # path (in terms of length of columns traversed) by the player
        self.alreadyChecked = [[False for i in range(12)] for j in range(8)]
        longestPath = -1
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if self.safeSpaces[i][j] == player:
                if not self.alreadyChecked[i][j]:
                    self.alreadyChecked[i][j] = True
                    newPath = self.findSafePathLength(board, player, i, j) - j
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
        leftFrontierPlaces = []
        rightFrontierPlaces = []
        leftFrontierFlips = []
        rightFrontierFlips = []
        for i,j in self.leftEdges:
            for row,col in self.surroundingPlaces(i,j):
                if not frontierSpacesChecked[row][col]:
                    frontierSpacesChecked[row][col] = True
                    if board[row][col] == '-':
                        leftFrontierPlaces.append((row,col))
                    elif board[row][col] == self.otherPlayer(player):
                        # must be regular piece
                        leftFrontierFlips.append((row,col))
        for i,j in self.rightEdges:
            for row,col in self.surroundingPlaces(i,j):
                if not frontierSpacesChecked[row][col]:
                    frontierSpacesChecked[row][col] = True
                    if board[row][col] == '-':
                        rightFrontierPlaces.append((row,col))
                    elif board[row][col] == self.otherPlayer(player):
                        # must be regular piece
                        rightFrontierFlips.append((row,col))
        return (leftFrontierPlaces, rightFrontierPlaces, leftFrontierFlips, rightFrontierFlips)

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
        #numPathMoves = 0
        leftFrontierMoves = 0
        rightFrontierMoves = 0
        leftFrontierPlaces, rightFrontierPlaces, leftFrontierFlips, rightFrontierFlips = self.findFrontierMoves(board, player)
        pathExtensionCount = [0 for _ in range(3)]

        for frontier in leftFrontierPlaces:
            self.alreadyChecked = [[False for x in range(12)] for y in range(8)]
            i, j = frontier
            self.leftCol = j
            self.rightCol = j
            self.findPathFromSquare(board, player, i, j)
            futurePath = self.rightCol - self.leftCol + 1
            pathExtension = futurePath - longestPath
            if pathExtension > 0:
                #numPathMoves += 1
                leftFrontierMoves += 1
                pathExtensionCount[min(pathExtension - 1, 2)] += 1
                if futurePath > longestFuturePath:
                    longestFuturePath = futurePath

        for frontier in rightFrontierPlaces:
            self.alreadyChecked = [[False for x in range(12)] for y in range(8)]
            i, j = frontier
            self.leftCol = j
            self.rightCol = j
            self.findPathFromSquare(board, player, i, j)
            futurePath = self.rightCol - self.leftCol + 1
            pathExtension = futurePath - longestPath
            if pathExtension > 0:
                #numPathMoves += 1
                rightFrontierMoves += 1
                pathExtensionCount[min(pathExtension - 1, 2)] += 1
                if futurePath > longestFuturePath:
                    longestFuturePath = futurePath

        alreadyFlipped = [[False for x in range(12)] for y in range(8)]

        for frontier in leftFrontierFlips:
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
                    pathExtension = futurePath - longestPath
                    if pathExtension > 0:
                        leftFrontierMoves += 1
                        pathExtensionCount[min(pathExtension - 1, 2)] += 1
                        if futurePath > longestFuturePath:
                            longestFuturePath = futurePath

        for frontier in rightFrontierFlips:
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
                    pathExtension = futurePath - longestPath
                    if pathExtension > 0:
                        rightFrontierMoves += 1
                        pathExtensionCount[min(pathExtension - 1, 2)] += 1
                        if futurePath > longestFuturePath:
                            longestFuturePath = futurePath

        return (longestFuturePath, leftFrontierMoves, rightFrontierMoves, pathExtensionCount)

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

    def isCorner(self, i, j):
        return ((i == 0 or i == 7) and (j == 0 or j == 11))

    def isEdge(self, i, j):
        return (i == 0 or i == 7)


    def smartFeaturesTDL(self, board, player):
        featureNames = ['diffLongestPermPathSquared', 'your8Empty', 'your5Empty', 'myLongestEvenPathSquared', 'yourLongestPath', 'futureAhead', 'your2PathExtension', 'my6Empty', 'diff4Flip', 'yourLongestPermPathSquared', 'my3PathExtension', 'yourClosedPathFlex', 'turnsAhead', 'my3EdgeEmpty', 'blockedMyLeft', 'diffLongestFuturePathSquared', 'ahead', 'myLongestPathSquared', 'yourLongestFuturePathSquared', 'myLongestExtension', 'myLongestPermPath', 'your1Flip', 'my8Empty', 'your4Flip', 'diffCols', 'diffLongestSafePath', 'diffLongestFuturePath', 'your2EdgeEmpty', 'yourLongestPathSquared', 'your6Empty', 'my1PathExtension', 'diff2Flip', 'diff2Empty', 'your2Flip', 'yourOpenPathFlex', 'diff1Empty', 'onlyTurnAway', 'diff4Empty', 'myTurnsAway', 'diffLongestPermPath', 'myLongestEvenPath', 'my2PathExtension', 'my4Empty', 'yourTurnsAwaySquared', 'myOpenPathFlex', 'my2Flip', 'my4EdgeEmpty', 'yourTurnsAway', 'my5Empty', 'diffTotal', 'diffLongestSafePathSquared', 'diffLongestEvenPath', 'yourCols', 'blockedYourLeft', 'myCols', 'blockedMe', 'myLongestFuturePath', 'amTurnsAhead', 'blockedYourRight', 'amTurnsBehind', 'myTurnsAwaySquared', 'myPerm', 'diffLongestPathSquared', 'myLongestFuturePathSquared', 'diff3Empty', 'myLongestSafePathSquared', 'my1EdgeEmpty', 'my3Empty', 'my1Flip', 'my1Empty', 'yourLongestFuturePath', 'my2Empty', 'myLongestSafePath', 'diff1EdgeEmpty', 'my7Empty', 'your4Empty', 'myLongestPermPathSquared', 'myOneTurnAway', 'behind', 'your3EdgeEmpty', 'your3PathExtension', 'diff3EdgeEmpty', 'your2Empty', 'yourLongestEvenPathSquared', 'diffPerm', 'your1EdgeEmpty', 'your3Empty', 'myClosedPathFlex', 'my3Flip', 'diff2EdgeEmpty', 'diffLongestEvenPathSquared', 'futureBehind', 'your1PathExtension', 'diff1Flip', 'diff3Flip', 'yourLongestEvenPath', 'yourLongestSafePathSquared', 'your7Empty', 'my2EdgeEmpty', 'yourLongestSafePath', 'diff4EdgeEmpty', 'diffLongestPath', 'your4EdgeEmpty', 'blockedYou', 'blockedMyRight', 'yourPerm', 'yourLongestPermPath', 'my4Flip', 'your3Flip', 'yourTotal', 'yourOneTurnAway', 'yourLongestExtension', 'myTotal', 'your1Empty', 'myLongestPath', 'turnsAheadSquared']
        features = {feature:0 for feature in featureNames}
        # features = []
        myCols = [0 for _ in range(12)]
        yourCols = [0 for _ in range(12)]
        self.permSpaces = [['-' for i in range(12)] for j in range(8)]
        self.evenSpaces = [['-' for i in range(12)] for j in range(8)]
        self.safeSpaces = [['-' for i in range(12)] for j in range(8)]
        #myLongestPath = self.longestPath(board, player)
        #yourLongestPath = self.longestPath(board, self.otherPlayer(player))
        #myFlipPath = myLongestPath
        #yourFlipPath = yourLongestPath
        for i,j in [(i, j) for j in range(12) for i in range(8)]:
            if board[i][j] == player.upper():
                features['myPerm'] += 1
                features['myTotal'] += 1
                self.permSpaces[i][j] = player
                self.evenSpaces[i][j] = player
                self.safeSpaces[i][j] = player
                if myCols[j] == 0:
                    myCols[j] = 1
            elif board[i][j] == self.otherPlayer(player).upper():
                features['yourPerm'] += 1
                features['yourTotal'] += 1
                self.permSpaces[i][j] = self.otherPlayer(player)
                self.evenSpaces[i][j] = self.otherPlayer(player)
                self.safeSpaces[i][j] = self.otherPlayer(player)
                if yourCols[j] == 0:
                    yourCols[j] = 1
            elif board[i][j] == player:
                features['myTotal'] += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    features['myPerm'] += 1
                    self.permSpaces[i][j] = player
                    self.evenSpaces[i][j] = player
                    self.safeSpaces[i][j] = player
                    """
                    elif self.isCorner(i, j):
                    if numEmptyNeighbors == 1:
                        features['my1CornerEmpty'] += 1
                    elif numEmptyNeighbors == 2:
                        features['my2CornerEmpty'] += 1
                    elif numEmptyNeighbors == 3:
                        features['my3CornerEmpty'] += 1
                    """
                elif self.isEdge(i, j):
                    if numEmptyNeighbors == 1:
                        features['my1EdgeEmpty'] += 1
                    elif numEmptyNeighbors == 2:
                        features['my2EdgeEmpty'] += 1
                        self.evenSpaces[i][j] = player
                        self.safeSpaces[i][j] = player
                    elif numEmptyNeighbors == 3:
                        features['my3EdgeEmpty'] += 1
                    elif numEmptyNeighbors >= 4:
                        features['my4EdgeEmpty'] += 1
                        self.safeSpaces[i][j] = player
                else:
                    if numEmptyNeighbors == 1:
                        features['my1Empty'] += 1
                    elif numEmptyNeighbors == 2:
                        features['my2Empty'] += 1
                        self.evenSpaces[i][j] = player
                        self.safeSpaces[i][j] = player
                    elif numEmptyNeighbors == 3:
                        features['my3Empty'] += 1
                    elif numEmptyNeighbors >= 4:
                        features['my4Empty'] += 1
                        self.safeSpaces[i][j] = player
                if myCols[j] == 0:
                    myCols[j] = 1
            elif board[i][j] == self.otherPlayer(player):
                features['yourTotal'] += 1
                numEmptyNeighbors = self.getNumEmptyNeighbors(i, j, board)
                if numEmptyNeighbors == 0:
                    features['yourPerm'] += 1
                    self.permSpaces[i][j] = self.otherPlayer(player)
                    self.evenSpaces[i][j] = self.otherPlayer(player)
                    self.safeSpaces[i][j] = self.otherPlayer(player)
                    """
                    elif self.isCorner(i, j):
                    if numEmptyNeighbors == 1:
                        features['your1CornerEmpty'] += 1
                    elif numEmptyNeighbors == 2:
                        features['your2CornerEmpty'] += 1
                    elif numEmptyNeighbors == 3:
                        features['your3CornerEmpty'] += 1
                    """
                elif self.isEdge(i, j):
                    if numEmptyNeighbors == 1:
                        features['your1EdgeEmpty'] += 1
                    elif numEmptyNeighbors == 2:
                        features['your2EdgeEmpty'] += 1
                        self.evenSpaces[i][j] = self.otherPlayer(player)
                        self.safeSpaces[i][j] = self.otherPlayer(player)
                    elif numEmptyNeighbors == 3:
                        features['your3EdgeEmpty'] += 1
                    elif numEmptyNeighbors >= 4:
                        features['your4EdgeEmpty'] += 1
                        self.safeSpaces[i][j] = self.otherPlayer(player)
                else:
                    if numEmptyNeighbors == 1:
                        features['your1Empty'] += 1
                    elif numEmptyNeighbors == 2:
                        features['your2Empty'] += 1
                        self.evenSpaces[i][j] = self.otherPlayer(player)
                        self.safeSpaces[i][j] = self.otherPlayer(player)
                    elif numEmptyNeighbors == 3:
                        features['your3Empty'] += 1
                    elif numEmptyNeighbors >= 4:
                        features['your4Empty'] += 1
                        self.safeSpaces[i][j] = self.otherPlayer(player)
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
        features['diff1Empty'] = features['my1Empty'] - features['your1Empty']
        features['diff2Empty'] = features['my2Empty'] - features['your2Empty']
        features['diff3Empty'] = features['my3Empty'] - features['your3Empty']
        features['diff4Empty'] = features['my4Empty'] - features['your4Empty']
        features['diff1EdgeEmpty'] = features['my1EdgeEmpty'] - features['your1EdgeEmpty']
        features['diff2EdgeEmpty'] = features['my2EdgeEmpty'] - features['your2EdgeEmpty']
        features['diff3EdgeEmpty'] = features['my3EdgeEmpty'] - features['your3EdgeEmpty']
        features['diff4EdgeEmpty'] = features['my4EdgeEmpty'] - features['your4EdgeEmpty']
        features['diff1Flip'] = features['my1Flip'] - features['your1Flip']
        features['diff2Flip'] = features['my2Flip'] - features['your2Flip']
        features['diff3Flip'] = features['my3Flip'] - features['your3Flip']
        features['diff4Flip'] = features['my4Flip'] - features['your4Flip']
        features = {k:v/96.0 for k, v in features.items()}

        numMyCols = sum(myCols)
        numYourCols = sum(yourCols)
        features['myCols'] = numMyCols / 12.0
        features['yourCols'] = numYourCols / 12.0
        features['diffCols'] = (numMyCols - numYourCols) / 12.0

        myLongestPermPath = self.findLongestPermPath(board, player)
        features['myLongestPermPath'] = myLongestPermPath / 12.0
        features['myLongestPermPathSquared'] = (myLongestPermPath**2) / 144.0
        myLongestEvenPath = self.findLongestEvenPath(board, player)
        features['myLongestEvenPath'] = myLongestEvenPath / 12.0
        features['myLongestEvenPathSquared'] = (myLongestEvenPath**2) / 144.0
        myLongestSafePath = self.findLongestSafePath(board, player)
        features['myLongestSafePath'] = myLongestSafePath / 12.0
        features['myLongestSafePathSquared'] = (myLongestSafePath**2) / 144.0

        yourLongestPermPath = self.findLongestPermPath(board, self.otherPlayer(player))
        features['yourLongestPermPath'] = yourLongestPermPath / 12.0
        features['yourLongestPermPathSquared'] = (yourLongestPermPath**2) / 144.0
        yourLongestEvenPath = self.findLongestEvenPath(board, self.otherPlayer(player))
        features['yourLongestEvenPath'] = yourLongestEvenPath / 12.0
        features['yourLongestEvenPathSquared'] = (yourLongestEvenPath**2) / 144.0
        yourLongestSafePath = self.findLongestSafePath(board, self.otherPlayer(player))
        features['yourLongestSafePath'] = yourLongestSafePath / 12.0
        features['yourLongestSafePathSquared'] = (yourLongestSafePath**2) / 144.0

        diffLongestPermPath = myLongestPermPath - yourLongestPermPath
        diffLongestEvenPath = myLongestEvenPath - yourLongestEvenPath
        diffLongestSafePath = myLongestSafePath - yourLongestSafePath

        features['diffLongestPermPath'] = diffLongestPermPath / 12.0
        features['diffLongestEvenPath'] = diffLongestEvenPath / 12.0
        features['diffLongestSafePath'] = diffLongestSafePath / 12.0
        features['diffLongestPermPathSquared'] = diffLongestPermPath * abs(diffLongestPermPath) / 144.0
        features['diffLongestEvenPathSquared'] = diffLongestEvenPath * abs(diffLongestEvenPath) / 144.0
        features['diffLongestSafePathSquared'] = diffLongestSafePath * abs(diffLongestSafePath) / 144.0



        myLongestPath = self.findLongestPathEdges(board, player)
        features['myLongestPath'] = myLongestPath / 12.0
        features['myLongestPathSquared'] = myLongestPath**2 / 144.0
        myLongestFuturePath, myLeftFrontierFlex, myRightFrontierFlex, myPathExtensionCount = self.findLongestFuturePath(board, player, myLongestPath)
        myPathFlex = myLeftFrontierFlex + myRightFrontierFlex
        features['myLongestFuturePath'] = myLongestFuturePath / 12.0
        features['myLongestFuturePathSquared'] = myLongestFuturePath**2 / 144.0
        myOneTurnAway = (myLongestFuturePath == 12)
        features['myOneTurnAway'] = myOneTurnAway
        myPathOnLeftEdge = len(self.leftEdges) > 0 and self.leftEdges[0][1] == 0
        myPathOnRightEdge = len(self.rightEdges) > 0 and self.rightEdges[0][1] == 11
        features['blockedMyLeft'] = False
        features['blockedMyRight'] = False
        if myLongestPath <= 1 or myLongestPath == 12:
            blockedMe = False
        elif myLeftFrontierFlex == 0 and len(self.leftEdges) > 0 and not myPathOnLeftEdge:
            blockedMe = True
            features['blockedMyLeft'] = True
        elif myRightFrontierFlex == 0 and len(self.rightEdges) > 0 and not myPathOnRightEdge:
            blockedMe = True
            features['blockedMyRight'] = True
        else:
            blockedMe = False
        features['blockedMe'] = blockedMe
        myTurnsAway = 12.0 - myLongestFuturePath + 2.0 * (features['blockedMyLeft'] + features['blockedMyRight'])
        features['myTurnsAway'] = myTurnsAway / 12.0
        features['myTurnsAwaySquared'] = (myTurnsAway**2) / 144.0
        if (myPathOnLeftEdge or myPathOnRightEdge) and myLongestPath != 12:
            features['myOpenPathFlex'] = 0
            features['myClosedPathFlex'] = (myLongestPath / 12.0) * myPathFlex / 96.0
        elif myLongestPath != 12:
            features['myOpenPathFlex'] = (myLongestPath / 12.0) * myPathFlex / 96.0
            features['myClosedPathFlex'] = 0
        else:
            features['myOpenPathFlex'] = 0
            features['myClosedPathFlex'] = 0
        features['my1PathExtension'] = ((myLongestPath + 1) / 12.0) * myPathExtensionCount[0] / 96.0
        features['my2PathExtension'] = ((myLongestPath + 2) / 12.0) * myPathExtensionCount[1] / 96.0
        features['my3PathExtension'] = (myLongestFuturePath / 12.0) * myPathExtensionCount[2] / 96.0
        features['myLongestExtension'] = (myLongestFuturePath - myLongestPath) / 12.0

        yourLongestPath = self.findLongestPathEdges(board, self.otherPlayer(player))
        features['yourLongestPath'] = yourLongestPath / 12.0
        features['yourLongestPathSquared'] = yourLongestPath**2 / 144.0
        yourLongestFuturePath, yourLeftFrontierFlex, yourRightFrontierFlex, yourPathExtensionCount = self.findLongestFuturePath(board, self.otherPlayer(player), yourLongestPath)
        yourPathFlex = yourLeftFrontierFlex + yourRightFrontierFlex
        features['yourLongestFuturePath'] = yourLongestFuturePath / 12.0
        features['yourLongestFuturePathSquared'] = yourLongestFuturePath**2 / 144.0
        yourOneTurnAway = (yourLongestFuturePath == 12)
        features['yourOneTurnAway'] = yourOneTurnAway
        yourPathOnLeftEdge = len(self.leftEdges) > 0 and self.leftEdges[0][1] == 0
        yourPathOnRightEdge = len(self.rightEdges) > 0 and self.rightEdges[0][1] == 11
        features['blockedYourLeft'] = False
        features['blockedYourRight'] = False
        if yourLongestPath <= 1 or yourLongestPath == 12:
            blockedYou = False
        elif yourLeftFrontierFlex == 0 and len(self.leftEdges) > 0 and not yourPathOnLeftEdge:
            blockedYou = True
            features['blockedYourLeft'] = True
        elif yourRightFrontierFlex == 0 and len(self.rightEdges) > 0 and not yourPathOnRightEdge:
            blockedYou = True
            features['blockedYourRight'] = True
        else:
            blockedYou = False
        features['blockedYou'] = blockedYou
        yourTurnsAway = 12.0 - yourLongestFuturePath + 2.0 * (features['blockedYourLeft'] + features['blockedYourRight'])
        features['yourTurnsAway'] = yourTurnsAway / 12.0
        features['yourTurnsAwaySquared'] = (yourTurnsAway**2) / 144.0
        if (yourPathOnLeftEdge or yourPathOnRightEdge) and yourLongestPath != 12:
            features['yourOpenPathFlex'] = 0
            features['yourClosedPathFlex'] = (yourLongestPath / 12.0) * yourPathFlex / 96.0
        elif yourLongestPath != 12:
            features['yourOpenPathFlex'] = (yourLongestPath / 12.0) * yourPathFlex / 96.0
            features['yourClosedPathFlex'] = 0
        else:
            features['yourOpenPathFlex'] = 0
            features['yourClosedPathFlex'] = 0
        features['your1PathExtension'] = ((yourLongestPath + 1) / 12.0) * yourPathExtensionCount[0] / 96.0
        features['your2PathExtension'] = ((yourLongestPath + 2) / 12.0) * yourPathExtensionCount[1] / 96.0
        features['your3PathExtension'] = (yourLongestFuturePath / 12.0) * yourPathExtensionCount[2] / 96.0
        features['yourLongestExtension'] = (yourLongestFuturePath - yourLongestPath) / 12.0

        diffLongestPath = myLongestPath - yourLongestPath
        features['diffLongestPath'] = diffLongestPath / 12.0
        features['diffLongestPathSquared'] = diffLongestPath * abs(diffLongestPath) / 144.0
        diffLongestFuturePath = myLongestFuturePath - yourLongestFuturePath
        features['diffLongestFuturePath'] = diffLongestFuturePath / 12.0
        features['diffLongestFuturePathSquared'] = diffLongestFuturePath * abs(diffLongestFuturePath) / 144.0
        features['ahead'] = myLongestPath > yourLongestPath
        features['behind'] = myLongestPath < yourLongestPath
        features['futureAhead'] = myLongestFuturePath > yourLongestFuturePath
        features['futureBehind'] = myLongestFuturePath < yourLongestFuturePath
        features['onlyTurnAway'] = myOneTurnAway and not yourOneTurnAway
        turnsAhead = yourTurnsAway - myTurnsAway
        features['turnsAhead'] = turnsAhead / 12.0
        features['turnsAheadSquared'] = turnsAhead * abs(turnsAhead) / 144.0
        features['amTurnsAhead'] = turnsAhead > 0
        features['amTurnsBehind'] = turnsAhead < 0

        maxPath = max(myLongestPath, yourLongestPath)
        early = False
        mid = False
        end = False
        if maxPath <= 4:
            early = True
        elif maxPath <= 8:
            mid = True
        else:
            end = True

        for featureName, featureValue in features.items():
            earlyFeature = featureName + 'Early'
            features[earlyFeature] = featureValue * early
            midFeature = featureName + 'Mid'
            features[midFeature] = featureValue * mid
            endFeature = featureName + 'End'
            features[endFeature] = featureValue * end

        # NEED TO UPDATE FEATURE NAMES WHEN CONVERTING TO PATHWAYZGAME

        return features

class GameManager():
    def __init__(self):
        # Initializes GameManager object
        self.game = PathwayzGame()
        self.state = game.startState()
        self.policies = {'Human':None, 'PAI Random':randomMove, 'PAI Baseline':baselineMove, 'PAI Advanced Baseline':advancedBaselineMove, 'PAI Features':featuresMove, 'PAI Advanced Features':smartFeaturesMove, 'PAI TDL':TDLfeaturesMove, 'PAI Minimax':advancedMinimax, 'PAI Beam Minimax':beamMinimax, 'PAI Advanced Beam Minimax':beamMinimaxMoreFeatures, 'PAI TDL Beam Minimax':beamMinimaxTDL, 'PAI Expectimax':advancedExpectimax, 'PAI MCS':monteCarloSearch, 'PAI MCTS':monteCarloTreeSearch}
        self.displayBoard()
        self.isAI = {'w':False, 'b':False}

    def setPlayers(self):
        # Initializes player policies and names
        player1Policy = document.getElementById("player1").value
        player1Name = document.getElementById("player1name").value
        player2Policy = document.getElementById("player2").value
        player2Name = document.getElementById("player2name").value
        self.playerNames = {'w':player1Name, 'b':player2Name}
        self.isAI = {'w':player1Policy!='Human', 'b':player2Policy!='Human'}
        self.policy = {'w':self.policies[player1Policy], 'b':self.policies[player2Policy]}

    def isAITurn(self):
        return self.isAI[self.game.player(self.state)]

    def AITurn(self):
        # Make's AI's move
        if not self.isAITurn() or self.game.isEnd(self.state): return
        player = self.game.player(self.state)
        policy = self.policy[player]
        action = policy(self.game, self.state)
        self.state = game.succ(self.state, action)
        self.displayBoard(self.coordinatesToSqNo(action))
        curBoard, curPlayer = self.state
        curFeatures = game.smartFeaturesTDL(curBoard, game.otherPlayer(curPlayer))
        if self.game.isEnd(self.state):
            if self.game.isWinner(self.state, player):
                self.displayWinner(player)
            elif self.game.isWinner(self.state, self.game.otherPlayer(player)):
                self.displayWinner(self.game.otherPlayer(player))
            else:
                self.displayDraw()

    def humanMove(self, sqNo):
        # Takes in the square number selected by the player and if able, plays
        # the player's piece at the square
        if self.game.isEnd(self.state):
            print('Game is over.')
            return
        if self.isAITurn():
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
        self.isAI = {'w':False, 'b':False}
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
        document.getElementById("modalInformation").innerHTML = "<h2>Player 1</h2><br><select class=\"soflow\" id=\"player1\"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Features</option><option>PAI Advanced Features</option><option>PAI TDL</option><option>PAI Minimax</option><option>PAI Beam Minimax</option><option>PAI Advanced Beam Minimax</option><option>PAI TDL Beam Minimax</option><option>PAI Expectimax</option><option>PAI MCS</option><option>PAI MCTS</option></select><input type=\"text\" style=\"display: inline;\" id=\"player1name\" value=\"Player 1\"><br><h2>Player 2</h2><br><select class=\"soflow\" id=\"player2\"><option>Human</option><option>PAI Random</option><option>PAI Baseline</option><option>PAI Advanced Baseline</option><option>PAI Features</option><option>PAI Advanced Features</option><option>PAI TDL</option><option>PAI Minimax</option><option>PAI Beam Minimax</option><option>PAI Advanced Beam Minimax</option><option>PAI TDL Beam Minimax</option><option>PAI Expectimax</option><option>PAI MCS</option><option>PAI MCTS</option></select><input type=\"text\" style=\"display: inline;\" id=\"player2name\" value=\"Player 2\"><br><a href=\"#\" onclick=\"closeModal(); pathwayzGame.gameManager.setPlayers();\">Start Game</a></div>";

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

game = PathwayzGame()
gameManager = GameManager()
