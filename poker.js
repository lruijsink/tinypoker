function Suit() {
    this.name = undefined;
    this.unicode = undefined;
    this.order = undefined;
}

function Rank() {
    this.name = undefined;
    this.character = undefined;
    this.order = undefined;
}

function Card() {
    this.suit = undefined;
    this.rank = undefined;
}

function randomB(lb, ub) {
    return Math.floor((Math.random() * ub) + lb);
}

function Deck() {
    this.cards = new Array();
    
    this.clear = function() {
        this.cards = new Array();
    };
    
    this.add = function(card) {
        this.cards[this.cards.length] = card;
    };
    
    this.find = function(card) {
        for(var i = 0; i < this.cards.length; i++) {
            if(this.cards[i].rank == card.rank && this.cards[i].suit == card.suit) {
                return i;
            }
        }
        return -1;
    };
    
    this.remove = function(card) {
        var i = this.find(card);
        if(i >= 0) {
            this.cards.splice(i, 1);
        }
    };
    
    this.pop = function() {
        if(this.cards.length == 0) {
            return undefined;
        }
        
        var topCard = this.cards[0];
        this.remove(topCard);
        return topCard;
    };
    
    this.shuffle = function() {
        for(var i = this.cards.length - 1; i > 0; i--) {
            var r = randomB(0, i);
            var tmp = this.cards[i];
            this.cards[i] = this.cards[r];
            this.cards[r] = tmp;
        }
    };
    
    this.count = function() {
        return this.cards.length;
    }
    
    this.at = function(index) {
        return this.cards[index];
    }
}

function Player() {
    this.id = undefined;
    this.key = undefined;
    this.cards = new Deck();
}

function cardsToRanks(cards) {
    var ranks = new Array();
    for(var i = 0; i < cards.length; i++)
        ranks.push(cards[i].rank);
    return ranks;
}

function ranksToOrders(ranks) {
    var orders = new Array();
    for(var i = 0; i < ranks.length; i++)
        orders.push(ranks[i].order);
    return orders;
}

function ordersToRanks(orders) {
    var ranks = new Array();
    for(var i = 0; i < ranks.length; i++)
        ranks[i] = Poker.getRank(orders[i]);
    return ranks;
}

function sortOrders(orders) {
    return bubbleSort(orders, compareRank);
}

function sortRanks(ranks) {
    return bubbleSort(ranks, compareRank);
}

function compareCard(card1, card2) {
    return compareRank(card1.rank, card2.rank);
}

function sortCards(cards) {
    return bubbleSort(cards, compareCard);
}

var ACE_RANK_ORDER = 1;
var DEUCE_RANK_ORDER = 2;
var KING_RANK_ORDER = 13;

function compareRank(rank1, rank2) {
    if(!rank1 || !rank2) {
        var lskjhsdf = 0;
    }
    if(rank1.order == ACE_RANK_ORDER)
        return rank2.order == ACE_RANK_ORDER;
    else if(rank2.order == ACE_RANK_ORDER)
        return true;
    else
        return rank1.order <= rank2.order;
}

function rankEquals(rank1, rank2) {
    return rank1.order == rank2.order;
}

function compareRanks(ranks1, ranks2) {
    ranks1 = sortRanks(ranks1);
    ranks2 = sortRanks(ranks2);
    for(var i = ranks1.length - 1; i >= 0; i--) {
        if(!rankEquals(ranks1[i], ranks2[i]))
            return compareRank(ranks1[i], ranks2[i]);
    }
    return true;
}

function ranksToString(ranks) {
    var rankChars = new Array();
    ranks = sortRanks(ranks).reverse();
    for(var i = 0; i < ranks.length; i++)
        rankChars.push(ranks[i].character);
    return rankChars.join(' ');
}

var HandStrength = {
    HighCard: function(ranks) {
        this.ranks = ranks;
        this.order = 0;
        
        this.compare = function(comp) {
            return compareRanks(this.ranks, comp.ranks);
        };
        
        this.toString = function() {
            return sortRanks(this.ranks)[this.ranks.length - 1].name + "-high (" + ranksToString(this.ranks) + ")";
        };
    },
    
    OnePair: function(pairRank, kickerRanks) {
        this.pairRank = pairRank;
        this.kickerRanks = kickerRanks;
        this.order = 1;
        
        this.compare = function(comp) {
            if(!rankEquals(this.pairRank, comp.pairRank))
                return compareRank(this.pairRank, comp.pairRank);
            else
                return compareRanks(this.kickerRanks, comp.kickerRanks);
        };
        
        this.toString = function(useSuffix) {
            return (useSuffix ? "a " : "") + "pair of " + this.pairRank.name + "s (" + ranksToString(this.kickerRanks) + " kickers)";
        };
    },
    
    TwoPair: function(highPairRank, lowPairRank, kickerRank) {
        this.highPairRank = highPairRank;
        this.lowPairRank = lowPairRank;
        this.kickerRank = kickerRank;
        this.order = 2;
        
        this.compare = function(comp) {
            if(!rankEquals(this.highPairRank, comp.highPairRank))
                return compareRank(this.highPairRank, comp.highPairRank);
            else if(!rankEquals(this.lowPairRank, comp.lowPairRank))
                return compareRank(this.lowPairRank, comp.lowPairRank);
            else
                return compareRank(this.kickerRank, comp.kickerRank);
        };
        
        this.toString = function() {
            return "two pair, " + this.highPairRank.name + "s and " + this.lowPairRank.name + "s (" + this.kickerRank.character + " kicker)";
        };
    },
    
    Set: function(setRank, kickerRanks) {
        this.setRank = setRank;
        this.kickerRanks = kickerRanks;
        this.order = 3;
        
        this.compare = function(comp) {
            if(!rankEquals(this.setRank, comp.setRank))
                return compareRank(this.setRank, comp.setRank);
            else
                return compareRanks(this.kickerRanks, comp.kickerRanks);
        };
        
        this.toString = function(useSuffix) {
            return (useSuffix ? "a " : "") + "set of " + this.setRank.name + "s (" + ranksToString(this.kickerRanks) + " kickers)";
        };
    },
    
    Straight: function(highestRank) {
        this.highestRank = highestRank;
        this.order = 4;
        
        this.compare = function(comp) {
            return compareRank(this.highestRank, comp.highestRank);
        };
        
        this.toString = function(useSuffix) {
            return (useSuffix ? "a " : "") + this.highestRank.name + "-high straight";
        };
    },
    
    Flush: function(ranks) {
        this.ranks = ranks;
        this.order = 5;
        
        this.compare = function(comp) {
            return compareRanks(this.ranks, comp.ranks);
        };
        
        this.toString = function(useSuffix) {
            return (useSuffix ? "a " : "") + sortRanks(this.ranks)[this.ranks.length - 1].name + "-high flush";
        };
    },
    
    FullHouse: function(setRank, pairRank) {
        this.setRank = setRank;
        this.pairRank = pairRank;
        this.order = 6;
        
        this.compare = function(comp) {
            if(!rankEquals(this.setRank, comp.setRank))
                return compareRank(this.setRank, comp.setRank);
            else
                return compareRank(this.pairRank, comp.pairRank);
        };
        
        this.toString = function(useSuffix) {
            return (useSuffix ? "a " : "") + "full house, " + this.setRank.name + "s full of " + this.pairRank.name + "s";
        };
    },
    
    Quads: function(quadsRank, kickerRank) {
        this.quadsRank = quadsRank;
        this.kickerRank = kickerRank;
        this.order = 7;
        
        this.compare = function(comp) {
            if(!rankEquals(this.quadsRank, comp.quadsRank))
                return compareRank(this.quadsRank, comp.quadsRank);
            else
                return compareRank(this.kickerRank, comp.kickerRank);
        };
        
        this.toString = function() {
            return "quad " + this.quadsRank.name + "s (" + this.kickerRank.name + " kicker)";
        };
    },
    
    StraightFlush: function(highestRank) {
        this.highestRank = highestRank;
        this.order = 8;
        
        this.compare = function(comp) {
            return compareRank(this.highestRank, comp.highestRank);
        };
        
        this.toString = function(useSuffix) {
            if(this.highestRank.order == ACE_RANK_ORDER)
                return (useSuffix ? "a " : "") + "royal flush";
            return (useSuffix ? "a " : "") + this.highestRank.name + "-high straight flush";
        };
    }
};

function patternEquals(pattern1, pattern2) {
    if(pattern1.length != pattern2.length)
        return false;
    for(var i = 0; i < pattern1.length; i++)
        if(pattern1[i] != pattern2[i])
            return false;
    return true;
}

function categorizeCards(cards) {
    if(cards.length == 0)
        return undefined;
    else if(cards.length == 1)
        return {pattern: [1], ranks: [cards[0].rank], suits: [[cards[0].suit]]};
    
    cards = sortCards(cards).reverse();
    
    var categorized = {
        pattern: new Array(),
        ranks: new Array(),
        suits: new Array()
    };
    
    var prevRankOrder = -1;
    var j = -1;
    for(var i = 0; i < cards.length; i++) {
        if(prevRankOrder != cards[i].rank.order) {
            j++;
            categorized.pattern.push(1);
            categorized.ranks.push(cards[i].rank);
            categorized.suits.push([cards[i].suit]);
            prevRankOrder = cards[i].rank.order;
        }
        else {
            categorized.pattern[j]++;
            categorized.suits[j].push(cards[i].suit);
        }
    }
    
    var sorted = {
        pattern: new Array(),
        ranks: new Array(),
        suits: new Array()
    };
    
    // Sort based on pattern
    for(var j = cards.length; j > 0; j--) {
        for(var i = 0; i < cards.length; i++) {
            if(categorized.pattern[i] == j) {
                sorted.pattern.push(categorized.pattern[i]);
                sorted.ranks.push(categorized.ranks[i]);
                sorted.suits.push(categorized.suits[i]);
            }
        }
    }
    
    return sorted;
}

function patternsMatch(pattern1, pattern2) {
    if(pattern1.length != pattern2.length)
        return false;
    for(var i = 0; i < pattern1.length; i++)
        if(pattern1[i] != pattern2[i])
            return false;
    return true;
}

function categorizeCards(cards) {
    if(cards.length == 0)
        return undefined;
    else if(cards.length == 1)
        return {pattern: [1], ranks: [cards[0].rank], suits: [[cards[0].suit]]};
    
    cards = sortCards(cards).reverse();
    
    var categorized = {
        pattern: new Array(),
        ranks: new Array(),
        suits: new Array()
    };
    
    var prevRankOrder = -1;
    var j = -1;
    for(var i = 0; i < cards.length; i++) {
        if(prevRankOrder != cards[i].rank.order) {
            j++;
            categorized.pattern.push(1);
            categorized.ranks.push(cards[i].rank);
            categorized.suits.push([cards[i].suit]);
            prevRankOrder = cards[i].rank.order;
        }
        else {
            categorized.pattern[j]++;
            categorized.suits[j].push(cards[i].suit);
        }
    }
    
    var sorted = {
        pattern: new Array(),
        ranks: new Array(),
        suits: new Array()
    };
    
    // Sort based on pattern
    for(var j = cards.length; j > 0; j--) {
        for(var i = 0; i < cards.length; i++) {
            if(categorized.pattern[i] == j) {
                sorted.pattern.push(categorized.pattern[i]);
                sorted.ranks.push(categorized.ranks[i]);
                sorted.suits.push(categorized.suits[i]);
            }
        }
    }
    
    return sorted;
}

function isAceLowStraight(ranks) {
    return ranks[0].order == ACE_RANK_ORDER
        && ranks[1].order == ranks[2].order + 1
        && ranks[2].order == ranks[3].order + 1
        && ranks[3].order == ranks[4].order + 1
        && ranks[4].order == DEUCE_RANK_ORDER;
}

function isAceHighStraight(ranks) {
    return ranks[0].order == ACE_RANK_ORDER
        && ranks[1].order == KING_RANK_ORDER
        && ranks[1].order == ranks[2].order + 1
        && ranks[2].order == ranks[3].order + 1
        && ranks[3].order == ranks[4].order + 1;
}

var HandRanking = {
    rankers: [
        {
            pattern: [1,1,1,1,1],
            handler: function(ranks, suits) {
                var flush = true;
                for(var i = 1; i < 5; i++) {
                    if(suits[i - 1][0] != suits[i][0]) {
                        flush = false;
                        break;
                    }
                }
                
                var straight = true;
                if(isAceLowStraight(ranks)) {
                    if(flush)
                        return new HandStrength.StraightFlush(ranks[1]);
                    else
                        return new HandStrength.Straight(ranks[1]);
                }
                else if(!isAceHighStraight(ranks)) {
                    for(var i = 1; i < 5; i++) {
                        if(ranks[i - 1].order != ranks[i].order + 1) {
                            straight = false;
                            break;
                        }
                    }
                }
                
                if(straight && flush)
                    return new HandStrength.StraightFlush(ranks[0]);
                else if(straight)
                    return new HandStrength.Straight(ranks[0]);
                else if(flush)
                    return new HandStrength.Flush(ranks);
                else
                    return new HandStrength.HighCard(ranks);
            }
        },
        {
            pattern: [2,1,1,1],
            handler: function(ranks) {
                return new HandStrength.OnePair(ranks[0], ranks.slice(1));
            }
        },
        {
            pattern: [2,2,1],
            handler: function(ranks) {
                return new HandStrength.TwoPair(ranks[0], ranks[1], ranks[2]);
            }
        },
        {
            pattern: [3,1,1],
            handler: function(ranks) {
                return new HandStrength.Set(ranks[0], ranks.slice(1));
            }
        },
        {
            pattern: [3,2],
            handler: function(ranks) {
                return new HandStrength.FullHouse(ranks[0], ranks[1]);
            }
        },
        {
            pattern: [4,1],
            handler: function(ranks) {
                return new HandStrength.Quads(ranks[0], ranks[1]);
            }
        }
    ],
    
    cardsToStrength: function(cards) {
        var cat = categorizeCards(cards);
        for(var i = 0; i < this.rankers.length; i++) {
            if(patternEquals(cat.pattern, this.rankers[i].pattern)) {
                return this.rankers[i].handler(cat.ranks, cat.suits);
            }
        }
        return undefined;
    },
    
    compare: function(hand1, hand2) {
        if(hand1.order != hand2.order)
            return hand1.order < hand2.order;
        return hand1.compare(hand2);
    },
    
    equals: function(hand1, hand2) {
        return this.compare(hand1, hand2) && this.compare(hand2, hand1);
    }
};

var Poker = {
    allRanks: new Array({name: "Ace",    character: "A",       order: 1},
                        {name: "2",      character: "2",       order: 2},
                        {name: "3",      character: "3",       order: 3},
                        {name: "4",      character: "4",       order: 4},
                        {name: "5",      character: "5",       order: 5},
                        {name: "6",      character: "6",       order: 6},
                        {name: "7",      character: "7",       order: 7},
                        {name: "8",      character: "8",       order: 8},
                        {name: "9",      character: "9",       order: 9},
                        {name: "10",     character: "10",      order: 10},
                        {name: "Jack",   character: "J",       order: 11},
                        {name: "Queen",  character: "Q",       order: 12},
                        {name: "King",   character: "K",       order: 13}),
    
    allSuits: new Array({name: "Spades",   unicode: undefined, order: 1},
                        {name: "Clubs",    unicode: undefined, order: 2},
                        {name: "Hearts",   unicode: undefined, order: 3},
                        {name: "Diamonds", unicode: undefined, order: 4}),
    
    getRank: function(order) {
        return this.allRanks[order - 1];
    },
    
    getSuit: function(order) {
        return this.allSuits[order - 1];
    },
    
    getCardIndex: function(card) {
        return card.rank.order + 13 * (card.suit.order - 1);
    },
    
    getCardFromIndex: function(index) {
        var rankIndex = (index - 1) % 13;
        var suitIndex = (index - rankIndex - 1) / 13;
        return {rank: this.allRanks[rankIndex], suit: this.allSuits[suitIndex]};
    },
    
    getDefaultDeck: function() {
        var deck = new Deck();
        for(var i = 0; i < this.allSuits.length; i++) {
            for(var j = 0; j < this.allRanks.length; j++) {
                deck.add({rank: this.allRanks[j],
                          suit: this.allSuits[i]});
            }
        }
        return deck;
    }
};