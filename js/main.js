var ANT_COLORS = {
	"waiting" : "#621",
	"exploring" : "#4949ff",
	"collecting" : "#008400"
};
var NB_ANTS_INIT = 10;
var FOOD_INIT = 1;

var game = new Game();

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
	game.makeAntsEat();
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