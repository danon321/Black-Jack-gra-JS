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
    getDeck() {
        xhr.open("GET", "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1",false);
        xhr.onload = function(){
            if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                blackJack.deckId = JSON.parse(xhr.response).deck_id;
            }
        }
        xhr.send(null);
        this.getCards();
    },
    getCards(){
        for (let i = 0; i <= this.numberOfPlayers-1; i++) {
            const url = `https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=2`;
        
            xhr.open("GET", url,false);
            xhr.onreadystatechange = function() {
                if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    for (const el of JSON.parse(xhr.response).cards) {
                        blackJack.players[i].cards.push(el.code);
                        blackJack.players[i].points.push(blackJack.valueFilter(el.value));   
                    } 
                }
            }
            xhr.send();
            
            if(blackJack.players[i].points[0]==="11" && blackJack.players[i].points[1]==="11"){
                blackJack.players[i].winner = true;
            }
        }
        this.createBoards(); 
    },
    addOneCard(){
            xhr.open("GET", `https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=1`,true);
            xhr.onreadystatechange = function(){
                if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    const JSONcardCode = JSON.parse(xhr.response).cards[0].code;
                    const JSONcardValue = JSON.parse(xhr.response).cards[0].value;
                    blackJack.players[blackJack.roundPlayer-1].cards.push(JSONcardCode);
                    blackJack.players[blackJack.roundPlayer-1].points.push(blackJack.valueFilter(JSONcardValue)); 
                    blackJack.createBoards();
                } 
            }
            xhr.send(null);
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
                return blackJack.valueFilter.pairs[c]
            })  
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

document.addEventListener("DOMContentLoaded", () => {
    const menuButtonsContainer = document.querySelector(".menu-button-container");
    const menuButtons = menuButtonsContainer.querySelectorAll("button");
    const addCard = document.getElementById("addCard");
    const pass = document.getElementById("pass");
    const playAgain = document.getElementById("playAgain");

    menuButtons.forEach(item => {
        item.addEventListener('click', () => {
            blackJack.numberOfPlayers = parseInt(item.value,10);
            blackJack.createPlayers();
        })
      })
    addCard.addEventListener("click", () => {
        blackJack.addOneCard();
    });
    pass.addEventListener("click", () => {
        blackJack.playerPass();
    });
    playAgain.addEventListener("click", () => {
        window.location.reload();
    });
});