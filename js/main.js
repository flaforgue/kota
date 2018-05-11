var worldMovingIntervalX;
var worldMovingIntervalY;
var keyMapAttribute = {
	37: "regX",
	38: "regY",
	39: "regX",
	40: "regY"
};
var keyMapPositiveValue = {
	37: false,
	38: false,
	39: true,
	40: true
};

var ANT_COLORS = {
	"waiting" : "#621",
	"exploring" : "#4949ff",
	"collecting" : "#008400"
};
var NB_ANTS_INIT = 1;
var FOOD_INIT = 10;

var game = new Game(2000, 2000);

game.createAnthill();
for (var i = 0; i < NB_ANTS_INIT ; i ++) {
	game.anthill.createAnt();
}

ManagementPanel.updateNbAntsForAction('waiting');
ManagementPanel.updateNbAntsBarAndLabel();
game.anthill.updateFood(FOOD_INIT);

createjs.Ticker.framerate = 100;
createjs.Ticker.addEventListener("tick", function() {game.update()});

setInterval(function() {
	//game.makeAntsEat();
}, 2000);

setInterval(function() {
	game.createAnts();
	ManagementPanel.updateNbAntsBarAndLabel();
}, 5000);

setInterval(function() {
	game.starvingCheck();
	ManagementPanel.updateNbAntsBarAndLabel();
}, 10000);

$(window).focus(function() {game.replayGameIfPaused();});
$(window).blur(function() {game.pauseGame();});

$('.start-action').click(function() {
	var action = $(this).data('action');
	ManagementPanel.startAction(action);	
});

$('.add-ant-action').mousedown(function() {
	var action = $(this).data('action');
	ManagementPanel.addAntActionButtonHandler(action);
	return false;
});

$('.remove-ant-action').mousedown(function() {
	var action = $(this).data('action');
	ManagementPanel.removeAntActionButtonHandler(action);
	return false;
});

$('.add-ant-action, .remove-ant-action').mouseup(function() {
	ManagementPanel.clearChangeAntActionInterval();
});

// move the world view
$(window).keydown(function(event) {
	var keyPressed = event.which;
	if (keyMapAttribute.hasOwnProperty(keyPressed)) {
		var direction = keyMapAttribute[keyPressed];

		if (direction == 'regX') {
			clearInterval(worldMovingIntervalX);
			worldMovingIntervalX = setInterval(function() {
				game.moveWorldView(direction, keyMapPositiveValue[keyPressed]);
			}, 5);
		} else {
			clearInterval(worldMovingIntervalY);
			worldMovingIntervalY = setInterval(function() {
				game.moveWorldView(direction, keyMapPositiveValue[keyPressed]);
			}, 5);
		}

		event.preventDefault();
		event.stopPropagation();
		return false;
	}
});

$(window).keyup(function(event) {
	if (keyMapAttribute.hasOwnProperty(event.which)) {
		var direction = keyMapAttribute[event.which];

		if (direction == 'regX') {
			clearInterval(worldMovingIntervalX);
		} else {
			clearInterval(worldMovingIntervalY);
		}
		
		event.preventDefault();
		event.stopPropagation();
		return false;
	}
});

$(window).on('wheel', function(event) {
	if (event.originalEvent.wheelDeltaY > 0) {
		game.zoomIn(0.03);
	} else {
		game.zoomOut(0.03);
	}
});

// disable mac chrome backward/forward if scrolling with trackpad
history.pushState(null, null, location.href);
window.onpopstate = function(event) {
    history.go(1);
};