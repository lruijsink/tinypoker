function showHiddenCard() {
    var playerKey = parseInt(document.getElementById("playerKey").value);
    var cardKey = parseInt(document.getElementById("cardKey").value);
    var card = Crypto.decrypt(playerKey, cardKey);
    document.getElementById("hiddenCard").innerHTML = card.rank.name + " of " + card.suit.name;
}

function showCodeTable() {
    var playerKey = parseInt(document.getElementById("playerKey").value);
    var deck = Poker.getDefaultDeck();
    var html = "";
    
    while(deck.cards.length > 0) {
        var card = deck.pop();
        var key = Crypto.encrypt(playerKey, card);
        
        html += Poker.getCardIndex(card);
        html += " - ";
        html += card.rank.name + " of " + card.suit.name;
        html += " - ";
        html += key;
        html += "<br />";
    }
    
    document.getElementById("codeTable").innerHTML = html;
}

function checkFirstN() {
    N = 100;
    
    for(var i = 0; i <= N; i++) {
        var deck = Poker.getDefaultDeck();
        var keys = new Array();
        while(deck.cards.length > 0) {
            var card = deck.pop();
            var key = Crypto.encrypt(i, card);
            
            for(var j = 0; j < keys.length; j++) {
                if(keys[j] == key) {
                    alert(i + ", " + key + ", " + j + " == " + keys.length);
                    return false;
                }
            }
            keys.push(key);
        }
    }
    return true;
}

function processInput() {
    var input = document.getElementById("hostInput").value;
    document.getElementById("hostInput").value = "";
    
    var lines = input.split('.');
    for(var i = 0; i < lines.length; i++) {
        processLine(lines[i].trim());
    }
}

function processLine(line) {
    if(line.charAt(0) == '/') {
        var i = line.indexOf(':');
        if(i < 0) {
            processCommand(line.substring(1).trim(), undefined);
        }
        else {
            var type = line.substring(1, i).trim();
            var args = line.substring(i + 1).split(',');
            for(var j = 0; j < args.length; j++) {
                args[j] = args[j].trim();
            }
            processCommand(type, args);
        }
    }
}

function resetHoleCards() {
    document.getElementById("holeCards").innerHTML = "";
}

function addHoleCard(card) {
    if(card == undefined) {
        return;
    }
    
    var br = "";
    if(document.getElementById("holeCards").innerHTML != "") {
        br = "<br />";
    }
    document.getElementById("holeCards").innerHTML += br + card.rank.name + " of " + card.suit.name;
}

var clientCommunityCards;

function resetCommunityCards() {
    clientCommunityCards = new Array();
    
    document.getElementById("communityCards").innerHTML = "";
}

function addCommunityCard(card) {
    clientCommunityCards.push(card);
    
    if(card == undefined) {
        return;
    }
    
    var br = "";
    if(document.getElementById("communityCards").innerHTML != "") {
        br = "<br />";
    }
    document.getElementById("communityCards").innerHTML += br + card.rank.name + " of " + card.suit.name;
}

function processCommand(type, args) {
    switch(type) {
    case "HReset":
        var targetID = parseInt(args[0]);
        var playerID = parseInt(document.getElementById("playerID").value);
        if(targetID == playerID) {
            resetHoleCards();
        }
        break;
    case "H":
        var targetID = parseInt(args[0]);
        var playerID = parseInt(document.getElementById("playerID").value);
        var playerKey = parseInt(document.getElementById("playerKey").value);
        
        if(targetID == playerID) {
            for(var i = 1; i < args.length; i++) {
                addHoleCard(Crypto.decrypt(playerKey, parseInt(args[i])));
            }
        }
        break;
    case "CReset":
        resetCommunityCards();
        break;
    case "C":
        for(var i = 0; i < args.length; i++) {
            addCommunityCard(Poker.getCardFromIndex(parseInt(args[i])));
        }
        break;
    case "SReset":
        resetShowdown();
        break;
    case "S":
        var playerID = parseInt(args[0]);
        var cards = new Array();
        for(var i = 1; i < args.length; i++) {
            cards.push(Poker.getCardFromIndex(args[i]));
        }
        showHand(playerID, cards);
    }
}

function resetShowdown() {
    document.getElementById("showdown").innerHTML = "";
}

function showHand(playerID, cards) {
    var html = "";
    if(document.getElementById("showdown").innerHTML) {
        html += "<br />";
    }
    
    html += "Player " + playerID + " has: ";
    for(var i = 0; i < cards.length; i++) {
        if(i > 0) {
            html += ", ";
        }
        html += cards[i].rank.name + " of " + cards[i].suit.name;
    }
    html += ". ";
    
    var best = clientCommunityCards;
    for(var j = 0; j < 5; j++) {
        for(var k = 0; k < 5; k++) {
            if(j != k) {
                var tmp = clientCommunityCards.slice();
                tmp[j] = cards[0];
                tmp[k] = cards[1];
                if(HandRanking.compare(HandRanking.cardsToStrength(best), HandRanking.cardsToStrength(tmp))) {
                    best = tmp;
                }
            }
            else {
                var tmp = clientCommunityCards.slice();
                tmp[j] = cards[0];
                if(HandRanking.compare(HandRanking.cardsToStrength(best), HandRanking.cardsToStrength(tmp))) {
                    best = tmp;
                }
                
                tmp = clientCommunityCards.slice();
                tmp[j] = cards[1];
                if(HandRanking.compare(HandRanking.cardsToStrength(best), HandRanking.cardsToStrength(tmp))) {
                    best = tmp;
                }
            }
        }
    }
    
    html += "They made " + HandRanking.cardsToStrength(best).toString(true) + ".";
    
    document.getElementById("showdown").innerHTML += html;
}

function swapButtons(current, next) {
    document.getElementById(current + "Button").disabled = true;
    document.getElementById(next + "Button").disabled = false;
}

function postCommand(type, args) {
    if(args == undefined) {
        document.getElementById("hostOutput").value += "/" + type + ".";
    }
    else {
        document.getElementById("hostOutput").value += "/" + type + ":" + args.join(',') + ".";
    }
}
var currentPlayers;
function resetPlayers() {
    currentPlayers = new Array();
    for(var i = 1; i <= 2; i++) {
        currentPlayers.push({id: i, key: parseInt(document.getElementById("player" + i + "key").value), cards: new Deck()});
    }
}

var currentDeck;
var currentCommunityCards;

function shuffleDeck() {
    document.getElementById("hostOutput").value = "";
    
    resetPlayers();
    
    currentDeck = Poker.getDefaultDeck();
    currentDeck.shuffle();
    
    swapButtons("shuffleDeck", "dealHoleCards");
    
    postCommand("CReset");
    postCommand("SReset");
    currentCommunityCards = new Array();
}

function dealHoleCards() {
    var currentNumberOfPlayers = 2;
    
    for(var i = 1; i <= currentNumberOfPlayers; i++) {
        var playerID = i;
        var playerKey = parseInt(document.getElementById("player" + playerID + "key").value);
        var args = [playerID];
        
        for(var j = 0; j < 2; j++) {
            var card = currentDeck.pop();
            currentPlayers[playerID - 1].cards.add(card);
            
            args.push(Crypto.encrypt(playerKey, card));
        }
        
        postCommand('HReset', [playerID]);
        postCommand('H', args);
    }
    
    swapButtons("dealHoleCards", "dealFlop");
}

function dealFlop() {
    var cardIndices = new Array();
    for(var i = 0; i < 3; i++) {
        var card = currentDeck.pop();
        cardIndices.push(Poker.getCardIndex(card));
        currentCommunityCards.push(card);
    }
    
    postCommand('C', cardIndices);
    
    swapButtons("dealFlop", "dealTurn");
}

function dealTurn() {
    var card = currentDeck.pop();
    postCommand('C', [Poker.getCardIndex(card)]);
    currentCommunityCards.push(card);
    
    swapButtons("dealTurn", "dealRiver");
}

function dealRiver() {
    var card = currentDeck.pop();
    postCommand('C', [Poker.getCardIndex(card)]);
    currentCommunityCards.push(card);
    
    swapButtons("dealRiver", "showdown");
}

function showdown() {
    for(var i = 0; i < currentPlayers.length; i++) {
        var args = [currentPlayers[i].id];
        for(var j = 0; j < currentPlayers[i].cards.count(); j++) {
            args.push(Poker.getCardIndex(currentPlayers[i].cards.at(j)));
        }
        
        postCommand('S', args);
    }
    
    swapButtons("showdown", "shuffleDeck");
}