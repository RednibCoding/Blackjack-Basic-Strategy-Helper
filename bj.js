function calculateBestAction(dealerCard, playerCards) {
    const dealerValue = getCardValue(dealerCard);
    const playerTotal = calculateHandTotal(playerCards);
    const soft = isHandSoft(playerCards);

    if (playerTotal > 21) {
        return "BUST"
    }

    // Handle pair splitting scenarios
    if (isPair(playerCards)) {
        const cardValue = getCardValue(playerCards[0]); // Both cards have the same value in a pair
        switch (cardValue) {
            case 2:
            case 3:
                if (dealerValue <= 3) return 'Split if Double Down after Split is possible, otherwise Hit';
                if (dealerValue <= 7) return 'Split';
                return 'Hit';
            case 4:
                if (dealerValue >= 5 && dealerValue <= 6) return 'Split if Double Down after Split is possible, otherwise Hit';
                return 'Hit';
            case 5:
                if (dealerValue <= 9) return 'Double Down if possible, otherwise Hit';
                return 'Hit';
            case 6:
                if (dealerValue === 2) return 'Split if Double Down after Split is possible, otherwise Hit';
                if (dealerValue <= 6) return 'Split';
                return 'Hit';
            case 7:
                if (dealerValue <= 7) return 'Split';
                return 'Hit';
            case 8:
                return 'Split';
            case 9:
                if (dealerValue <= 6 || dealerValue === 8 || dealerValue === 9) return 'Split';
                return 'Stand';
            case 10:
                return 'Stand'; // Typically we don't split tens
            case 11: // Aces
                return 'Split';
            default:
                return 'Hit'; // Default action for unexpected cases
        }
    }

    // Handle soft totals
    if (soft) {
        const aceValue = 11; // Value of Ace when soft
        const nonAceTotal = playerTotal - aceValue; // Subtract Ace value to get the total of the other card
        switch (nonAceTotal) {
            case 2:
            case 3:
                if (dealerValue <= 4 || dealerValue >= 7) return 'Hit';
                return 'Double Down if possible, otherwise Hit';
            case 4:
            case 5:
                if (dealerValue <= 3 || dealerValue >= 7) return 'Hit';
                return 'Double Down if possible, otherwise Hit';
            case 6:
                if (dealerValue === 2 || dealerValue >= 7) return 'Hit';
                return 'Double Down if possible, otherwise Hit';
            case 7:
                if (dealerValue <= 2 || (dealerValue >= 7 && dealerValue <= 8)) return 'Stand';
                if (dealerValue >= 9) return 'Hit';
                return 'Double Down if possible, otherwise Stand';
            case 8:
            case 9:
            case 10:
                return 'Stand';
            default:
                return 'Hit'; // Default action for unexpected cases
        }
    }

    // Handle hard totals
    if (!soft) {
        switch (playerTotal) {
            case 8:
                return 'Hit';
            case 9:
                if (dealerValue <= 2 || dealerValue >= 7) return 'Hit';
                return 'Double Down if possible, otherwise Hit';
            case 10:
                if (dealerValue <= 9) return 'Double Down if possible, otherwise Hit';
                return 'Hit';
            case 11:
                return 'Double Down if possible, otherwise Hit';
            case 12:
                if (dealerValue <= 3 || dealerValue >= 7) return 'Hit';
                return 'Stand';
            case 13:
            case 14:
                if (dealerValue <= 6) return 'Stand';
                return 'Hit';
            case 15:
                if (dealerValue <= 6) return 'Stand';
                if (dealerValue === 10) return 'Surrender if possible, otherwise Hit';
                return 'Hit';
            case 16:
                if (dealerValue <= 6) return 'Stand';
                if (dealerValue <= 8) return 'Hit';
                return 'Surrender if possible, otherwise Hit';
            case 17:
                return 'Stand';
            default:
                return playerTotal >= 18 ? 'Stand' : 'Hit'; // Stand on 18 or higher, hit otherwise
        }
    }

    // Fallback action if none of the above conditions are met
    return 'Hit';
}

function getCardValue(card) {
    if (card === 'A') {
        return 11;
    } else if (['J', 'Q', 'K'].includes(card)) {
        return 10;
    } else {
        return parseInt(card);
    }
}

function calculateHandTotal(cards) {
    let total = 0;
    let aceCount = 0;
    cards.forEach(card => {
        let value = getCardValue(card);
        if (card === 'A') {
            aceCount += 1;
        }
        total += value;
    });
    // Adjust for Aces
    while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount -= 1;
    }
    return total;
}

function isHandSoft(cards) {
    return cards.includes('A') && calculateHandTotal(cards) <= 21;
}

function isPair(cards) {
    return cards.length === 2 && cards[0] === cards[1];
}

function testCalculateBestAction() {
    const dealerCards = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A'];
    let allTestsPassed = true;

    function runTest(playerCards, dealerCard, expectedAction, description) {
        const action = calculateBestAction(dealerCard, playerCards);
        const passed = action === expectedAction;
        if (!passed) allTestsPassed = false;
        const resultText = passed ? '%cPASS' : '%cFAIL';
        const color = passed ? 'color: green;' : 'color: red;';
        console.log(resultText + ` ${description} | Expected: ${expectedAction}, Got: ${action}`, color);
    }


    /////////////////// Single card and hard hand scenarios  ///////////////////

    // Player hand: 8
    dealerCards.forEach(dealerCard => {
        runTest(['8'], dealerCard, 'Hit', "Player: 8 | Dealer: " + dealerCard);
    });

    // Player hand: 9
    runTest(['9'], '2', 'Hit', "Player: 9 | Dealer: 2");
    runTest(['9'], '7', 'Hit', "Player: 9 | Dealer: 7");
    dealerCards.filter(card => ['3', '4', '5', '6'].includes(card)).forEach(dealerCard => {
        runTest(['9'], dealerCard, 'Double Down if possible, otherwise Hit', "Player: 9 | Dealer: " + dealerCard);
    });

    // Player hand: 10
    dealerCards.filter(card => ['2', '3', '4', '5', '6', '7', '8', '9'].includes(card)).forEach(dealerCard => {
        runTest(['10'], dealerCard, 'Double Down if possible, otherwise Hit', "Player: 10 | Dealer: " + dealerCard);
    });
    runTest(['10'], '10', 'Hit', "Player: 10 | Dealer: 10");
    runTest(['10'], 'A', 'Hit', "Player: 10 | Dealer: A");

    // Player hand: 11
    dealerCards.forEach(dealerCard => {
        runTest(['11'], dealerCard, 'Double Down if possible, otherwise Hit', "Player: 11 | Dealer: " + dealerCard);
    });

    // Player hand: 12
    dealerCards.filter(card => ['2', '3', '7', '8', '9', '10', 'A'].includes(card)).forEach(dealerCard => {
        runTest(['12'], dealerCard, 'Hit', "Player: 12 | Dealer: " + dealerCard);
    });
    dealerCards.filter(card => ['4', '5', '6'].includes(card)).forEach(dealerCard => {
        runTest(['12'], dealerCard, 'Stand', "Player: 12 | Dealer: " + dealerCard);
    });

    // Player hand: 13 or 14
    dealerCards.filter(card => ['2', '3', '4', '5', '6'].includes(card)).forEach(dealerCard => {
        runTest(['13'], dealerCard, 'Stand', "Player: 13 | Dealer: " + dealerCard);
        runTest(['14'], dealerCard, 'Stand', "Player: 14 | Dealer: " + dealerCard);
    });
    dealerCards.filter(card => ['7', '8', '9', '10', 'A'].includes(card)).forEach(dealerCard => {
        runTest(['13'], dealerCard, 'Hit', "Player: 13 | Dealer: " + dealerCard);
        runTest(['14'], dealerCard, 'Hit', "Player: 14 | Dealer: " + dealerCard);
    });

    // Player hand: 15
    dealerCards.filter(card => ['2', '3', '4', '5', '6'].includes(card)).forEach(dealerCard => {
        runTest(['15'], dealerCard, 'Stand', "Player: 15 | Dealer: " + dealerCard);
    });
    runTest(['15'], '10', 'Surrender if possible, otherwise Hit', "Player: 15 | Dealer: 10");
    dealerCards.filter(card => ['7', '8', '9', 'A'].includes(card)).forEach(dealerCard => {
        runTest(['15'], dealerCard, 'Hit', "Player: 15 | Dealer: " + dealerCard);
    });

    // Player hand: 16
    dealerCards.filter(card => ['2', '3', '4', '5', '6'].includes(card)).forEach(dealerCard => {
        runTest(['16'], dealerCard, 'Stand', "Player: 16 | Dealer: " + dealerCard);
    });
    runTest(['16'], '9', 'Surrender if possible, otherwise Hit', "Player: 16 | Dealer: 9");
    runTest(['16'], '10', 'Surrender if possible, otherwise Hit', "Player: 16 | Dealer: 10");
    runTest(['16'], 'A', 'Surrender if possible, otherwise Hit', "Player: 16 | Dealer: A");
    dealerCards.filter(card => ['7', '8'].includes(card)).forEach(dealerCard => {
        runTest(['16'], dealerCard, 'Hit', "Player: 16 | Dealer: " + dealerCard);
    });

    // Player hand: 17
    dealerCards.forEach(dealerCard => {
        runTest(['17'], dealerCard, 'Stand', "Player: 17 | Dealer: " + dealerCard);
    });


    ///////////////////  Soft hand scenarios  ///////////////////

    // Player hand: A,2 and A,3
    ['A,2', 'A,3'].forEach(playerHand => {
        dealerCards.filter(card => ['2', '3', '4', '7', '8', '9', '10', 'A'].includes(card)).forEach(dealerCard => {
            runTest(playerHand.split(','), dealerCard, 'Hit', `Player: ${playerHand} | Dealer: ${dealerCard}`);
        });
        dealerCards.filter(card => ['5', '6'].includes(card)).forEach(dealerCard => {
            runTest(playerHand.split(','), dealerCard, 'Double Down if possible, otherwise Hit', `Player: ${playerHand} | Dealer: ${dealerCard}`);
        });
    });

    // Player hand: A,4 and A,5
    ['A,4', 'A,5'].forEach(playerHand => {
        dealerCards.filter(card => ['2', '3', '7', '8', '9', '10', 'A'].includes(card)).forEach(dealerCard => {
            runTest(playerHand.split(','), dealerCard, 'Hit', `Player: ${playerHand} | Dealer: ${dealerCard}`);
        });
        dealerCards.filter(card => ['4', '5', '6'].includes(card)).forEach(dealerCard => {
            runTest(playerHand.split(','), dealerCard, 'Double Down if possible, otherwise Hit', `Player: ${playerHand} | Dealer: ${dealerCard}`);
        });
    });

    // Player hand: A,6
    dealerCards.filter(card => ['2', '7', '8', '9', '10', 'A'].includes(card)).forEach(dealerCard => {
        runTest(['A', '6'], dealerCard, 'Hit', "Player: A,6 | Dealer: " + dealerCard);
    });
    dealerCards.filter(card => ['3', '4', '5', '6'].includes(card)).forEach(dealerCard => {
        runTest(['A', '6'], dealerCard, 'Double Down if possible, otherwise Hit', "Player: A,6 | Dealer: " + dealerCard);
    });

    // Player hand: A,7
    dealerCards.filter(card => ['2', '7', '8'].includes(card)).forEach(dealerCard => {
        runTest(['A', '7'], dealerCard, 'Stand', "Player: A,7 | Dealer: " + dealerCard);
    });
    dealerCards.filter(card => ['3', '4', '5', '6'].includes(card)).forEach(dealerCard => {
        runTest(['A', '7'], dealerCard, 'Double Down if possible, otherwise Stand', "Player: A,7 | Dealer: " + dealerCard);
    });
    dealerCards.filter(card => ['9', '10', 'A'].includes(card)).forEach(dealerCard => {
        runTest(['A', '7'], dealerCard, 'Hit', "Player: A,7 | Dealer: " + dealerCard);
    });

    // Player hand: A,8
    dealerCards.forEach(dealerCard => {
        runTest(['A', '8'], dealerCard, 'Stand', "Player: A,8 | Dealer: " + dealerCard);
    });

    // Player hand: A,9
    dealerCards.forEach(dealerCard => {
        runTest(['A', '8'], dealerCard, 'Stand', "Player: A,9 | Dealer: " + dealerCard);
    });

    // Player hand: A,10
    dealerCards.forEach(dealerCard => {
        runTest(['A', '8'], dealerCard, 'Stand', "Player: A,10 | Dealer: " + dealerCard);
    });



    ///////////////////  Pair scenarios  ///////////////////

    // Player hand: 2,2 and 3,3
    ['2,2', '3,3'].forEach(playerHand => {
        dealerCards.filter(card => ['2', '3'].includes(card)).forEach(dealerCard => {
            runTest(playerHand.split(','), dealerCard, 'Split if Double Down after Split is possible, otherwise Hit', `Player: ${playerHand} | Dealer: ${dealerCard}`);
        });
        dealerCards.filter(card => ['4', '5', '6', '7'].includes(card)).forEach(dealerCard => {
            runTest(playerHand.split(','), dealerCard, 'Split', `Player: ${playerHand} | Dealer: ${dealerCard}`);
        });
        dealerCards.filter(card => ['8', '9', '10', 'A'].includes(card)).forEach(dealerCard => {
            runTest(playerHand.split(','), dealerCard, 'Hit', `Player: ${playerHand} | Dealer: ${dealerCard}`);
        });
    });

    // Player hand: 4,4
    dealerCards.filter(card => ['2', '3', '4', '7', '8', '9', '10', 'A'].includes(card)).forEach(dealerCard => {
        runTest(['4', '4'], dealerCard, 'Hit', "Player: 4,4 | Dealer: " + dealerCard);
    });
    dealerCards.filter(card => ['5', '6'].includes(card)).forEach(dealerCard => {
        runTest(['4', '4'], dealerCard, 'Split if Double Down after Split is possible, otherwise Hit', "Player: 4,4 | Dealer: " + dealerCard);
    });

    // Player hand: 5,5
    dealerCards.filter(card => ['2', '3', '4', '5', '6', '7', '8', '9'].includes(card)).forEach(dealerCard => {
        runTest(['5', '5'], dealerCard, 'Double Down if possible, otherwise Hit', "Player: 5,5 | Dealer: " + dealerCard);
    });
    dealerCards.filter(card => ['10', 'A'].includes(card)).forEach(dealerCard => {
        runTest(['5', '5'], dealerCard, 'Hit', "Player: 5,5 | Dealer: " + dealerCard);
    });

    // Player hand: 6,6
    dealerCards.filter(card => ['2'].includes(card)).forEach(dealerCard => {
        runTest(['6', '6'], dealerCard, 'Split if Double Down after Split is possible, otherwise Hit', "Player: 6,6 | Dealer: " + dealerCard);
    });
    dealerCards.filter(card => ['3', '4', '5', '6'].includes(card)).forEach(dealerCard => {
        runTest(['6', '6'], dealerCard, 'Split', "Player: 6,6 | Dealer: " + dealerCard);
    });
    dealerCards.filter(card => ['7', '8', '9', '10', 'A'].includes(card)).forEach(dealerCard => {
        runTest(['6', '6'], dealerCard, 'Hit', "Player: 6,6 | Dealer: " + dealerCard);
    });

    // Player hand: 7,7
    dealerCards.filter(card => ['2', '3', '4', '5', '6', '7'].includes(card)).forEach(dealerCard => {
        runTest(['7', '7'], dealerCard, 'Split', "Player: 7,7 | Dealer: " + dealerCard);
    });
    dealerCards.filter(card => ['8', '9', '10', 'A'].includes(card)).forEach(dealerCard => {
        runTest(['7', '7'], dealerCard, 'Hit', "Player: 7,7 | Dealer: " + dealerCard);
    });

    // Player hand: 8,8
    dealerCards.forEach(dealerCard => {
        runTest(['8', '8'], dealerCard, 'Split', "Player: 8,8 | Dealer: " + dealerCard);
    });

    // Player hand: 9,9
    dealerCards.filter(card => ['2', '3', '4', '5', '6', '8', '9'].includes(card)).forEach(dealerCard => {
        runTest(['9', '9'], dealerCard, 'Split', "Player: 9,9 | Dealer: " + dealerCard);
    });
    dealerCards.filter(card => ['7', '10', 'A'].includes(card)).forEach(dealerCard => {
        runTest(['9', '9'], dealerCard, 'Stand', "Player: 9,9 | Dealer: " + dealerCard);
    });

    // Player hand: 10,10
    dealerCards.forEach(dealerCard => {
        runTest(['10', '10'], dealerCard, 'Stand', "Player: 10,10 | Dealer: " + dealerCard);
    });

    // Player hand: A,A
    dealerCards.forEach(dealerCard => {
        runTest(['A', 'A'], dealerCard, 'Split', "Player: A,A | Dealer: " + dealerCard);
    });


    ///////////////////  Summary  ///////////////////

    if (allTestsPassed) {
        console.log('%cAll tests passed!', 'color: green;');
    } else {
        console.log('%cSome tests failed.', 'color: red;');
    }
}

// Run the test
testCalculateBestAction();



/*
card points are like this: 2, 3, 4, 5, 6, 7, 8, 9, 10, A

situations when player has only one card:

when player: 8 
  dealer: does not matter -> hit

when player: 9 
  - dealer: 2 or 7-A -> hit
  - dealer: 3-6 -> double down if possible, otherwise hit

when player: 10
  - dealer: 2-9 -> double down if possible, otherwise hit
  - dealer: 10-A -> hit

when player: 11 and dealer: 2-A -> double down if possible, otherwise hit

when player: 12
  - dealer: 2-3 or 7-A -> hit
  - dealer: 4-6 -> stand

when player: 13 or 14
  - dealer: 2-6 -> stand
  - dealer: 7-A -> hit
  
when player: 15
  - dealer: 2-6 -> stand
  - dealer: 7-9 or A -> hit
  - dealer: 10 -> surrender if possible otherwise hit

when player: 16
  - dealer: 2-6 -> stand
  - dealer: 7-8 -> hit
  - dealer: 9-A -> surrender if possible otherwise hit

when player: 17
    - dealer: does not matter -> stand


situations when player has two cards:

when player: A,2
  - dealer: 2-4 or 7-A -> hit
  - dealer: 5-6 -> double down if possible, otherwise hit

when player: A,3
  - dealer: 2-4 or 7-A -> hit
  - dealer: 5-6 -> double down if possible, otherwise hit

when player: A,4
  - dealer: 2-3 or 7-A -> hit
  - dealer: 4-6 -> double down if possible, otherwise hit

when player: A,5
  - dealer: 2-3 or 7-A -> hit
  - dealer: 4-6 -> double down if possible, otherwise hit

when player: A,6
  - dealer: 2 or 7-A -> hit
  - dealer: 3-6 -> double down if possible, otherwise hit

when player: A,7
  - dealer: 2,7,8 -> stand
  - dealer: 9-A -> hit
  - dealer: 3-6 -> double down if possible, otherwise stand

when player: A,8
    dealer: does not matter -> stand


situations when player has two cards (pairs):

when player: 2,2
  - dealer: 2-3 -> split if double down after split is possible, otherwise hit (todo: please formulate it better)
  - dealer: 4-7 -> split
  - dealer: 8-A -> hit

when player: 3,3
  - dealer: 2-3 -> split if double down after split is possible, otherwise hit (todo: please formulate it better)
  - dealer: 4-7 -> split
  - dealer: 8-A -> hit

when player: 4,4
  - dealer: 2-4 or 7-A -> hit
  - dealer: 5-6 -> split if double down after split is possible, otherwise hit (todo: please formulate it better)

when player: 5,5
  - dealer: 2-9 -> double down if possible, otherwise hit
  - dealer: 10-A -> hit

when player: 6,6
  - dealer: 2 -> split if double down after split is possible, otherwise hit (todo: please formulate it better)
  - dealer: 3-6 -> split
  - dealer: 7-A -> hit

when player: 7,7
  - dealer: 2-7 -> split
  - dealer: 8-A -> hit

when player 8,8
  - dealer: doeas not matter -> split

when player 9,9
  - dealer: 2-6 or 8-9 -> split
  - dealer: 7 or 10-A -> stand

when player 10,10
  - dealer: does not matter -> stand

when player A,A
  - dealer: does not matter -> split
*/