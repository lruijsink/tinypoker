String.prototype.hashCode = function(){
    var hash = 5381;
    for (var i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash << 5) + hash) + char; /* hash * 33 + c */
    }
    return hash;
}

var Crypto = {
    encrypt: function(playerKey, card) {
        var key = (playerKey.toString() + card.rank.name + " of " + card.suit.name).hashCode();
        key = key > 0 ? (2 * key - 1) : 2 * -key;
        return key % 99998;
    },
    
    decrypt: function(playerKey, key) {
        var deck = Poker.getDefaultDeck();
        while(deck.cards.length > 0) {
            var card = deck.pop();
            if(this.encrypt(playerKey, card) == key) {
                return card;
            }
        }
        return undefined;
    }
}

function bubbleSort(src, op) {
    var source = src.slice();
    for(var j = 0; j < source.length; j++) {
        var minValue = source[j], minIndex = j;
        for(var i = j + 1; i < source.length; i++) {
            if(op(source[i], minValue)) {
                minIndex = i;
                minValue = source[i];
            }
        }
        source[minIndex] = source[j];
        source[j] = minValue;
    }
    return source;
}