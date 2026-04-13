  let score = JSON.parse(localStorage.getItem('score')) || {
            wins: 0,
            losses: 0,
            tie: 0
        };

            updateScoreElement()
    /* if(!score){
        score = {
            wins: 0,
            losses: 0,
            tie: 0
        };
    }
*/

        document.querySelector('.js-score').innerHTML = `Wins: ${score.wins}, Losses: ${score.losses}, Ties: ${score.tie}`

     let computersMove = '';
    
    function getComputersMove(){
        const randomNumber = Math.random();
       
        if(randomNumber >= 0 && randomNumber <1/3){
            computersMove = 'Scissors';  
        }else if (randomNumber >= 1/3 && randomNumber < 2/3){
            computersMove = 'Paper';        
        }else{  
            computersMove = 'Rock';
        }
        return computersMove;
        
    }

    function playGame(playersMove){
        const computersMove = getComputersMove();
        let result = '';
        if(playersMove === computersMove){
            result = 'Tie';
        }else if (
            (playersMove === 'Rock' && computersMove === 'Paper')||
            (playersMove === 'Scissors' && computersMove === 'Rock')||
            (playersMove === 'Paper' && computersMove === 'Scissprs')
        ){
            result = 'You Lose!';
        }else{
            result = 'You Win!';
        }
 
        if(result === 'You Win!'){
            score.wins += 1;
        }else if(result === 'You Lose!'){
            score.losses += 1;
        }else if(result === 'Tie'){
            score.tie += 1;
        }

                updateScoreElement() 

        localStorage.setItem('score',JSON.stringify(score))
        document.querySelector('.js-moves').innerHTML = `You  <img src="image/${playersMove}-emoji.png" alt="" class="move-icon"><img src="image/${computersMove}-emoji.png" alt="" class="move-icon"> computer`
        document.querySelector('.js-result').innerHTML = `The Result is ${result}`

  
    }

    function updateScoreElement(){
         document.querySelector('.js-score').innerHTML = `Wins: ${score.wins}, Losses: ${score.losses}, Ties: ${score.tie}`
    }
