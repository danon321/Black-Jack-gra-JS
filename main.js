const xhr = new XMLHttpRequest();
const blackJack = {
    numberOfPlayers : 0,
    players : [],
    roundPlayer:1,
    divBoard : null,
    deckId : "",
    theEnd:false,
    createPlayers(){
        for(let i=1; i<=this.numberOfPlayers; i++){
            this.players.push(
                {
                    player: i,
                    cards: [],
                    points: [],
                    pointsSum: 0,
                    pass:false,
                    winner:false,
                    loser:false
                }  
            )
        }
        this.getDeck();
    },
    xhrFunction(url, cFunction){
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", url, false);
        xhttp.onreadystatechange = function() {
          if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            cFunction(this);
          }
       };
        xhttp.send(null);
    },
    getDeck() {
        this.xhrFunction("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1", xhttp => {
            this.deckId = JSON.parse(xhttp.response).deck_id;
        });
        this.getCards();
    },
    getCards(){
        for (let i = 0; i <= this.numberOfPlayers-1; i++) {
            this.xhrFunction(`https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=2`, xhttp => {
                for (const el of JSON.parse(xhttp.response).cards) {
                    this.players[i].cards.push(el.code);
                    this.players[i].points.push( this.valueFilter(el.value));   
                } 
            })
            if(this.players[i].points[0]==="11" && this.players[i].points[1]==="11"){
               this.players[i].winner = true;
            }
        }
        this.createBoards(); 
    },
    addOneCard(){
            this.xhrFunction(`https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=1`, xhttp => {
                const JSONcardCode = JSON.parse(xhttp.response).cards[0].code;
                const JSONcardValue = JSON.parse(xhttp.response).cards[0].value;
                this.players[this.roundPlayer-1].cards.push(JSONcardCode);
                this.players[this.roundPlayer-1].points.push(this.valueFilter(JSONcardValue)); 
                this.createBoards();
            })
    },
    endOfTheGame(){
        for(let el of this.players){
            el.winner?this.theEnd = true:null;
            if(el.player === this.numberOfPlayers){
                el.loser?this.theEnd = true:null;
            }
        } 
        if(this.theEnd){
            document.getElementById("pass").style.display="none";
            document.getElementById("addCard").style.display="none";
            document.getElementById("playAgain").style.display="block";
            const playerBoards = document.querySelectorAll(".player-board");
            for(let singlePlayerBoard of playerBoards){
                singlePlayerBoard.style.opacity="1";
                singlePlayerBoard.style.borderColor = "grey";
            }
            for(let el of this.players){
                if(!el.winner){
                    el.pass = true;
                    document.getElementById(`${el.player}`).classList.add("przegrany");
                }
            } 
        }
    },  
    playerWin(){
        let passPlayersPoints = [];
        for(let el of this.players){
            if(el.winner){
                document.getElementById(`${el.player}`).classList.add("winner");
            }
            else if((el.player === this.numberOfPlayers)&&((el.pass)||(el.loser))){
                for(let el2 of this.players){
                  if(el2.pass){
                    passPlayersPoints.push(el2.pointsSum)
                    }  
                }                     
            } 
        } 
        for(let el of this.players){
            if(el.pointsSum == Math.max.apply(null, passPlayersPoints)){
                el.winner = true;
                document.getElementById(`${el.player}`).classList.add("winner");
            }
        }
    },
    playerLost(){
            for(const el of this.players){
                if(el.player === this.roundPlayer){
                   if((el.pointsSum >=22)&&!(el.points[0]==="11" && el.points[1]==="11")){
                    el.loser = true;
                        if(this.roundPlayer < this.numberOfPlayers){
                            this.roundPlayer++;
                        }
                    }   
                }
            }
    },
    createBoards(){
        document.querySelector(".control-buttons-container").style.display="flex";
        this.sumPoints();
        this.playerLost(); 
        this.divBoard = document.querySelector(".board");
        this.divBoard.innerHTML = "";

        for (let i = 0; i <= this.numberOfPlayers-1; i++) {
            var board = document.createElement("div");
            board.classList.add("player-board");

            if(i+1 === this.players[this.roundPlayer-1].player){
                board.classList.add("player-round");
            }else{
                board.classList.remove("player-round");
            }
            board.setAttribute("id",`${i+1}`);
            
            const playerName = document.createElement("p");
            playerName.innerText = `Gracz ${i+1}`;
            board.appendChild(playerName);

            const cardBox = document.createElement("div");
            cardBox.classList.add("cards-container");
            cardBox.setAttribute("id",`player${i+1}-cards`);
            board.appendChild(cardBox);

            const playerScore = document.createElement("p");
            playerScore.innerText = `Punkty: ${this.players[i].pointsSum}`;
            board.appendChild(playerScore);
               for (let j = 0; j <= this.players[i].cards.length-1; j++) {
                    const card = document.createElement("img");
                    card.classList.add("single-card");
                    card.setAttribute("src",`https://deckofcardsapi.com/static/img/${this.players[i].cards[j]}.png`);
                    cardBox.appendChild(card);
                } 
            this.divBoard.appendChild(board); 
        }
        this.playerWin();
        for(const el of this.players){
            if(el.pass){
            document.getElementById(`${el.player}`).classList.add("pass");
            }
            if(el.loser){
                document.getElementById(`${el.player}`).classList.add("przegrany");
            }
        }
        this.endOfTheGame();
    },
    playerPass(){
            this.players[this.roundPlayer-1].pass = true;
            if(this.players[this.roundPlayer-1].player !== this.roundPlayer +1){
                if(this.roundPlayer < this.numberOfPlayers){
                this.roundPlayer ++; 
                }
            }
        this.createBoards();
    },
    valueFilter(value){
        if(value.length > 2){
          this.valueFilter.pairs = {
            JACK: 2,
            QUEEN: 3,
            KING: 4,
            ACE: 11
            }
            return value.replace(/[A-Z]{1,}/g, function(c) {
                return this.valueFilter.pairs[c]
            }.bind(this))  
        }return value;     
    },
    sumPoints(){
        for (const el of this.players) {
            let suma = el.points.reduce(function(prevVal, val) {
                 prevVal = parseInt(prevVal, 10);
                 val = parseInt(val, 10);
                return prevVal + val;
            });
        el.pointsSum = suma
        };    
    }
};

document.addEventListener("DOMContentLoaded", function(){
    const menuButtonsContainer = document.querySelector(".menu-button-container"),
    menuButtons = menuButtonsContainer.querySelectorAll("button"),
    addCard = document.getElementById("addCard"),
    pass = document.getElementById("pass"),
    playAgain = document.getElementById("playAgain");

    menuButtons.forEach(item => {
        item.addEventListener('click', () => {
            this.numberOfPlayers = parseInt(item.value,10);
            this.createPlayers();
        })
      })
    addCard.addEventListener("click", () => {
        this.addOneCard();
    });
    pass.addEventListener("click", () => {
        this.playerPass();
    });
    playAgain.addEventListener("click", () => {
        window.location.reload();
    });
}.bind(blackJack));