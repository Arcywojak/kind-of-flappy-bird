const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const heroImage = document.getElementById('hero-image');
const deadHeroImage = document.getElementById('dead-hero-image');
const startGameAdvice = document.getElementById('start-game-advice');
const scoreWrapper = document.getElementById('score-wrapper');
const scoreBlock = document.getElementById('score');
const playAgainWrapper = document.getElementById('play-again')
const playAgainButton = document.getElementById('play-again-button')

// Jump sound downloaded from https://soundbible.com/1343-Jump.html
const jumpSound = new Audio('./sounds/jumpSound.mp3');

// Jump sound downloaded from https://www.myinstants.com/instant/minecraft-hurt/
const hurtSound = new Audio('./sounds/hurtSound.mp3');

let didGameStart = false;
let canGameBeStarted = true;
let gameInterval = null;
let score = 0;
let postToScoreIndex = 0;

// Constants, setting up the game
const IMAGE_WIDTH = 40,
      IMAGE_HEIGHT = 40,
      CANVAS_INITIAL_WIDTH = 480,
      CANVAS_INITIAL_HEIGHT = 640,
      HERO_FLY_RATIO_AFTER_JUMP = 4,
      THE_LOWEST_FLY_RATIO = -7,
      FLY_RATIO_DECREMENT = 0.2,
      REFRESH_CANVAS_PER_MILISECONDS = 20,
      POST_WIDTH = 80,
      CHANNEL_TO_JUMP_HEIGHT = 100,
      POST_COLOR = '#005c18';

class Hero {
    constructor(positionX, positionY, flyRatio = 0) {
        this.positionX = positionX;
        this.positionY = positionY;
        this.flyRatio = flyRatio
    }
}

class Post {
    constructor(topPostHeight = 0, bottomPostHeight = 0, positionX = 0) {
        this.topPostHeight = topPostHeight;
        this.bottomPostHeight = bottomPostHeight;
        this.positionX = positionX;
    }
};

const increaseScore = () => {
    if (
        posts[postToScoreIndex].positionX + POST_WIDTH/2 >= canvas.width/2 - 10 &&
        posts[postToScoreIndex].positionX + POST_WIDTH/2 <= canvas.width/2 + 10
       ) {
        postToScoreIndex = (postToScoreIndex === 0) ? 1 : 0;
        score += 1;
        scoreBlock.innerText = score;
    }
};

const togglePlayButton = () => {
    playAgainWrapper.classList.toggle('turned-off');
}

const hideStartAdvice = () => {
    startGameAdvice.classList.add('turned-off');
};

const showScore = () => {
    scoreWrapper.classList.remove('turned-off');
};

const drawHero = (isHeroAlive = true) => {
    if (isHeroAlive) {
        ctx.drawImage(heroImage, hero.positionX, hero.positionY , IMAGE_WIDTH, IMAGE_HEIGHT);
    } else {
        ctx.drawImage(deadHeroImage, hero.positionX, hero.positionY , IMAGE_WIDTH, IMAGE_HEIGHT);
    }
};

const resetDimensions = () => {
    canvas.width = Math.min(CANVAS_INITIAL_WIDTH, window.innerWidth - 8);
    canvas.height = Math.min(CANVAS_INITIAL_HEIGHT, window.innerHeight - 8);
    hero.positionX = (canvas.width / 2) - IMAGE_WIDTH/2;
    hero.positionY = (canvas.height / 2) - IMAGE_HEIGHT/2;
};

const hero = new Hero (
    position = {
        x: canvas.width / 2,
        y: canvas.height / 2
    }
);

//The game will be based on two posts rendering one after one repeadly
const posts = [
    new Post(),
    new Post()
];


/* Necessary event listeners to resize canvas */
window.addEventListener('resize', e => {
    resetDimensions();
    drawHero();
});

window.addEventListener('load', e => {
    resetDimensions();
    drawHero();
});

playAgainButton.addEventListener('click', e => {
    canGameBeStarted = true;
    hero.flyRatio = HERO_FLY_RATIO_AFTER_JUMP + 1;
    startGame();
    togglePlayButton();
})

/* ************************** */

const jump = () => {
    hero.flyRatio = HERO_FLY_RATIO_AFTER_JUMP;
    jumpSound.play();
};

const drawPosts = () => {
    for(let index = 0; index<=1; index++) {
        //top post
        ctx.fillStyle = POST_COLOR;
        ctx.fillRect(posts[index].positionX, 0, POST_WIDTH, posts[index].topPostHeight)

        //bottom post
        ctx.fillRect(posts[index].positionX, posts[index].bottomPostHeight, POST_WIDTH, canvas.height - posts[index].bottomPostHeight)
    }
};

const setRandomPostYPosition = (postIndex) => {
    posts[postIndex].topPostHeight = 
    Math.random()*(canvas.height - 4*CHANNEL_TO_JUMP_HEIGHT) + CHANNEL_TO_JUMP_HEIGHT*2;
    
    posts[postIndex].bottomPostHeight = 
    posts[postIndex].topPostHeight + CHANNEL_TO_JUMP_HEIGHT;
}

const setStartingPosition = () => {
    hero.positionX = canvas.width/2 - IMAGE_WIDTH/2;
    hero.positionY = canvas.height/2 - IMAGE_HEIGHT/2;

    posts[0].positionX = canvas.width + 100;
    posts[1].positionX = canvas.width*1.5 + POST_WIDTH/2 + 100;

    for(let index = 0; index <=1; index++) {
       setRandomPostYPosition(index)
    };
};

const resetPost = (postIndex) => {
    posts[postIndex].positionX = canvas.width;
    setRandomPostYPosition(postIndex);
};

const movePosts = () => {
    for(let index = 0; index<=1; index++) {
        posts[index].positionX -= 10*FLY_RATIO_DECREMENT

        if(posts[index].positionX + POST_WIDTH <= 0) {
            resetPost(index);
        }
    }
};

const draw = (shouldPostsBeMoved, isHeroAlive) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hero.positionY -= hero.flyRatio;
    drawPosts();
    drawHero(isHeroAlive);
    hero.flyRatio = Math.max(hero.flyRatio - FLY_RATIO_DECREMENT, THE_LOWEST_FLY_RATIO);

    if(shouldPostsBeMoved) {
        movePosts();
    }
};

const killHeroAnimation = () => {
    hero.flyRatio = HERO_FLY_RATIO_AFTER_JUMP + 1;
    hurtSound.play();

    const killHeroInterval = setInterval(() => {

        draw(false, false);

        if(hero.positionY >= canvas.height) {
            clearInterval(killHeroInterval);
            togglePlayButton();
        }
    }, REFRESH_CANVAS_PER_MILISECONDS)
};

const didGameEnd = () => {
    for(let index = 0; index<=1; index++) {
        if (
            (
             (
                hero.positionX + IMAGE_WIDTH >= posts[index].positionX &&
                hero.positionX + IMAGE_WIDTH <= posts[index].positionX + POST_WIDTH
             ) || (
                hero.positionX >= posts[index].positionX &&
                hero.positionX <= posts[index].positionX + POST_WIDTH
             ) 
            )  &&
            (
                hero.positionY <= posts[index].topPostHeight ||
                hero.positionY + IMAGE_HEIGHT >= posts[index].bottomPostHeight
            )
        ) {
            canGameBeStarted = false;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            clearInterval(gameInterval);
            killHeroAnimation();
        } 
    } 
};

const play = () => {
    draw(true);
    increaseScore();
    didGameEnd();    
};

const startGame = () => {
    showScore();
    hideStartAdvice();
    setStartingPosition();
    gameInterval = setInterval(play, REFRESH_CANVAS_PER_MILISECONDS);
};

document.body.onkeyup = (e) => {
    if(e.keyCode == 32 && canGameBeStarted) {
       if (!didGameStart) {
           didGameStart = true;
           startGame();
       }
       jump();
    }
};