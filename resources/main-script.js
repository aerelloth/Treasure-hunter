/******************************************************************************/
/********************************* VARIABLES **********************************/
/******************************************************************************/

	var SCORE = 0;
	var MAXSCORE = 0;
	var MODE = true;		
	var CHRONOTIME = 60000;	//durée du mode chrono
	var COINTIME = 1000;	//fréquence d'apparition d'une nouvelle pièce en mode jackpot
	var TIME;				//temps restant en mode chrono
	var $COINS = [];		//pièces ajoutées en mode jackpot


/******************************************************************************/
/********************************* FONCTIONS **********************************/
/******************************************************************************/



	/*****************************[ DEMARRAGE ]********************************/

	function init() {	//réinitialisation du plateau de jeu
		SCORE = 0;
		//calcul de la largeur du plateau de jeu en fonction de la largeur de la fenêtre
		var bodyWidth = parseInt($('body').css('width'));
		if (bodyWidth > 1000)
		{
			var widthPercent = 0.98;
		}
		else if (bodyWidth < 1000)
		{
			var widthPercent = 0.9;
		}
		
		var widthCaseNumber = parseInt((bodyWidth*widthPercent)/64);
		$board.css('width', widthCaseNumber*64);

		//calcul de la hauteur du plateau de jeu en fonction de la hauteur de la fenêtre
		var arrowsTop = parseInt($('#arrows').offset().top);
		var heigthPercent = 0.8;
		var heightCaseNumber = parseInt((arrowsTop*heigthPercent)/64);
		$board.css('height', heightCaseNumber*64);

		//calcul de la surface où positionner les éléments :
		//position horizontale
		frameWidth = parseInt($board.css('width'));
		characterWidth = parseInt($character.css('width'));
		frameLeft = 0;
		frameRight = parseInt(frameWidth - characterWidth);

		//position verticale
		frameHeight = parseInt($board.css('height'));
		characterHeight = parseInt($character.css('height'));	
		frameUp = 0;	
		frameDown = parseInt(frameHeight - characterHeight);

		//placement aléatoire du personnage et de la pièce
		setCharacterPosition();
		setCoinPosition($coin);
		//récpération de la position du personnage et de la pièce
		characterLeft = $character.css('left');
		characterTop = $character.css('top');
		coinLeft = $coin.css('left');
		coinTop = $coin.css('top');
		//replacement de la pièce tant que les deux sont sur la même case
		while (characterLeft == coinLeft  && characterTop == coinTop)
		{
			setCoinPosition($coin);
		};
		//affichage de la pièce
		$coin.css('display','block');
		console.log('Jeu réinitialisé !');
	}


	/******************************[ MODES DE JEU ]*****************************/

	function relaxMode() {
		stopTimer();	//pas de timer
		init();	//réinitialisation du plateau
		MODE = "relax";
		//activation des boutons des autres modes
		$('#relax').prop("disabled", true);
		$('#chrono').removeProp("disabled");
		$('#jackpot').removeProp("disabled");
	}

	function chronoMode() {
		stopTimer();	//fin des timers existants
		startTimer();	//début du chrono
		MODE = "chrono";
		//activation des boutons des autres modes
		$('#relax').removeProp("disabled");
		$('#chrono').prop("disabled", true);
		$('#jackpot').removeProp("disabled");
	}

	function jackpotMode(){
		stopTimer();	//fin des timers existants
		startTimer();	//début du chrono
		coinTimer = setInterval(newCoin, COINTIME);	//début du chrono d'apparition des pièces
		MODE = "jackpot";
		//activation des boutons des autres modes
		$('#relax').removeProp("disabled");
		$('#chrono').removeProp("disabled");
		$('#jackpot').prop("disabled", true);
	}


		/* -------------------- [ Timers ] -------------------- */

		function startTimer() {
			//réinitialisation du plateau
			init();
			//affichage du score
			$('#score').html(SCORE+' po');
			//affichage du temps restant au chrono
			TIME = CHRONOTIME;
			$('#timer').html(CHRONOTIME/1000);
			//affichage du résultat à la fin du temps imparti
			gameOverTimer = setInterval(result, TIME);
			//mise à jour de l'affichage du temps restant toutes les secondes
			displayTimer = setInterval(display, 1000);
		}

		function stopTimer() {	//suppression des différents timers
			//réinitialisation de l'affichage
			$('#timer').html('timer');
			//suppression du timer "chrono" si défini
			if (typeof(gameOverTimer) !== 'undefined')
			{
				clearInterval(gameOverTimer);
			}
			//suppression du timer de l'affichage "chrono" si défini
			if (typeof(displayTimer) !== 'undefined')
			{
				clearInterval(displayTimer);
			}
			//suppression du timer de l'apparition des pièces en mode "jackpot" si défini
			if (typeof(coinTimer) !== 'undefined')
			{
				clearInterval(coinTimer);
			}
			//suppression des pièces apparues en mode "jackpot"
			for (i=0; i<$COINS.length; i++)
			{
				$COINS[i].remove();
			}
			$COINS=[];
			//passage en mode "relax" et activation des boutons de changement de mode
			$('#relax').prop("disabled", true);
			$('#chrono').removeProp("disabled");
			$('#jackpot').removeProp("disabled");
		}

		function display() { //mise à jour de l'affichage du chrono
			TIME -= 1000;
			$('#timer').html(TIME/1000);
		}


	/******************************[ PERSONNAGE ]******************************/


	function setCharacterPosition() {	//placement aléatoire du personnage
		var leftPosition = getRandomInt(frameLeft/squareSize, frameRight/squareSize);
		leftPosition = leftPosition*squareSize;
		var topPosition = getRandomInt(frameUp/squareSize, frameDown/squareSize);
		topPosition = topPosition*squareSize;
		$character.css({left:leftPosition,top:topPosition});
	}

	function moveLeft() {	//déplacement du personnage vers la gauche
		if (!$character.hasClass('left'))
		{
			//affichage de la bonne direction en CSS
			$character.removeClass();
			$character.addClass('left');
		}
		// à dé-commenter pour que le personnage doive d'abord se tourner avant d'avancer
		// else 
		// {
			//position à atteindre
			leftPosition = parseInt($character.css('left')) - squareSize;
			//si la position est bien dans les limites du plateau
			if (leftPosition >= frameLeft)
			{
				//déplacement et vérification de la présence d'une pièce
				$character.css('left', leftPosition);
				amIRich();
			}
		// }
	}

	function moveUp() {	//déplacement du personnage vers le haut
		if (!$character.hasClass('up'))
		{
			//affichage de la bonne direction en CSS
			$character.removeClass();
			$character.addClass('up');
		}
		// à dé-commenter pour que le personnage doive d'abord se tourner avant d'avancer
		// else 
		// {
			//position à atteindre

			topPosition = parseInt($character.css('top')) - squareSize;
			console.log(topPosition, frameUp);
			//si la position est bien dans les limites du plateau
			if (topPosition >= frameUp)
			{
				//déplacement et vérification de la présence d'une pièce
				$character.css('top', topPosition);
				amIRich();
			}
		// }
	}

	function moveRight() {	//déplacement du personnage vers la droite
		if (!$character.hasClass('right'))
		{
			//affichage de la bonne direction en CSS
			$character.removeClass();
			$character.addClass('right');
		}
		// à dé-commenter pour que le personnage doive d'abord se tourner avant d'avancer
		// else 
		// {	
			//position à atteindre
			leftPosition = parseInt($character.css('left')) + squareSize;
			//si la position est bien dans les limites du plateau
			if (leftPosition <= frameRight)
			{
				//déplacement et vérification de la présence d'une pièce
				$character.css('left', leftPosition);
				amIRich();
			}
		// }
	}

	function moveDown() {	//déplacement du personnage vers le bas
		if (!$character.hasClass('down'))
		{
			//affichage de la bonne direction en CSS
			$character.removeClass();
			$character.addClass('down');
		}
		// à dé-commenter pour que le personnage doive d'abord se tourner avant d'avancer
		// else 
		// {
			//position à atteindre
			topPosition = parseInt($character.css('top')) + squareSize;
			//si la position est bien dans les limites du plateau
			if (topPosition <= frameDown)
			{
				//déplacement et vérification de la présence d'une pièce
				$character.css('top', topPosition);
				amIRich();
			}
		// }
	}		


	/********************************[ PIÈCE ]*********************************/

	
	function setCoinPosition($coin) {	//placement aléatoire d'une pièce
		var leftPosition = getRandomInt(frameLeft/squareSize, frameRight/squareSize);
		leftPosition = leftPosition*squareSize;
		var topPosition = getRandomInt(frameUp/squareSize, frameDown/squareSize);
		topPosition = topPosition*squareSize;
		$coin.css({left:leftPosition,top:topPosition});
	}	

	function newCoin() {	//apparition de nouvelles pièces en mode "jackpot"
		var horizontalSquares = (frameRight-frameLeft)/squareSize +1;
		var verticalSquares = (frameDown-frameUp)/squareSize +1;
		var squaresNumber = horizontalSquares * verticalSquares;
		var coinsNumber = $COINS.length +1;

		if (coinsNumber < squaresNumber)
		{
			//copie de la pièce
			var newCoin = $coin.clone(true).insertBefore($coin.prev());
			//ajout dans le tableau $COINS
			$COINS.push(newCoin);
			//placement de la nouvelle pièce
			setCoinPosition(newCoin);
		}
	}	


	/********************************[ SCORE ]*********************************/

	
	function amIRich() {	//vérification de la présence d'une pièce
		//récupération de la position du personnage et de la pièce
		characterLeft = $character.css('left');
		characterTop = $character.css('top');
		coinLeft = $coin.css('left');
		coinTop = $coin.css('top');

		//si le personnage est sur une case avec une pièce
		if (characterLeft == coinLeft  && characterTop == coinTop)
		{
			collect($coin);
		};

		if (MODE == 'jackpot')
		{
			//en mode jackpot, vérification de la position de toutes les pièces
			for (i=0; i<$COINS.length; i++)
			{
				coinLeft = $COINS[i].css('left');
				coinTop = $COINS[i].css('top');
				//si le personnage est sur une case avec une pièce
				if (characterLeft == coinLeft  && characterTop == coinTop)
				{
					collect($COINS[i]);
				};
			}
		}
	}

	function collect($coin) {	//récupération de la pièce
		SCORE++;	//augmentation du score
		$('#score').html(SCORE+' po');	//affichage du score
		setCoinPosition($coin);	//déplacement aléatoire de la pièce
	}

	function result()	//obtention du score à la fin du chrono
	{
		//définition du meilleur score
		if (SCORE >= MAXSCORE)
		{
			MAXSCORE = SCORE;
		}
		//message en fonction du score obtenu
		if (SCORE == 0)
		{
			alert('Vous n\'avez collecté aucune pièce d\'or... Vous avez fait voeu de pauvreté ?\n\nLe record actuel est de '+MAXSCORE+' pièces d\'or.');
		}
		else if (SCORE == 1)
		{
			alert('Vous avez collecté une pièce d\'or. C\'est le début de la richesse :)\n\nLe record actuel est de '+MAXSCORE+' pièces d\'or.') 
		}
		else {
			alert('Vous avez collecté '+SCORE+' pièces d\'or. Vous voilà riche !\n\nLe record actuel est de '+MAXSCORE+' pièces d\'or.');
		}
		//réinitialisation du plateau
		init();
		
		//fin du chrono pour les modes "chrono" et "jackpot"
		if (MODE == 'chrono' || MODE == 'jackpot')
		{
			stopTimer();
		}
		//affichage du score
		$('#score').html(SCORE+' po');
	}

	


/******************************************************************************/
/******************************* CODE PRINCIPAL *******************************/
/******************************************************************************/


$(function()	//au chargement du DOM
{
	//récupération des éléments HTML
	$character = $('#character');
	$coin = $('#coin');
	$board = $('#board');
	$left = $('#left');
	$right = $('#right');
	$up = $('#up');
	$down = $('#down');
	squareSize = parseInt($('html').css('font-size'));

	//changement du mode de jeu au clic sur le bouton correspondant
	$('#relax').on('click', relaxMode);
	$('#chrono').on('click', chronoMode);
	$('#jackpot').on('click', jackpotMode);

	$('#left').on('click', moveLeft);
	$('#right').on('click', moveRight);
	$('#up').on('click', moveUp);
	$('#down').on('click', moveDown);

	//récupération de la touche appuyée
	$(document).keydown(function (event) {
		//flèche gauche
		if (event.which == 37) {
			console.log('Gauche !');
			moveLeft();
		}
		//flèche haut
		if (event.which == 38) {
			console.log('Haut !');
			moveUp();
		}
		//flèche droite
		if (event.which == 39) {
			console.log('Droite !');
			moveRight();
		}
		//flèche bas
		if (event.which == 40) {
			console.log('Bas !');
			moveDown();
		}
	})

	var gameOverTimer, displayTimer, coinTimer;	//déclaration des chronos pouvant être utilisés dans les différents modes
	init();	//réinitialisation du plateau
	relaxMode();	//mode relax par défaut

});