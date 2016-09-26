
function ManagementPanel() {
	ManagementPanel.changeAntActionInterval = null;
}

ManagementPanel.startAction = function(action) {
	ManagementPanel.getNbAntsLabelsForAllActions().text('0');
	ManagementPanel.getNbAntsLabelForAction(action).text(game.anthill.ants.length);

	for (var i = 0 ; i < game.anthill.ants.length ; i ++) {
		if (game.anthill.ants[i].action != action) {
			game.anthill.ants[i].startAction(action);
		}
	}
};
ManagementPanel.getNbAntsLabelForAction = function(action) {
	return $('#nb-' + action + '-ants');
};
ManagementPanel.getNbAntsLabelsForAllActions = function() {
	return $('.action-nb-ants-label');
};
ManagementPanel.addAntActionButtonHandler = function(action) {
	ManagementPanel.addAntAction(action);
	ManagementPanel.changeAntActionInterval = setInterval(function() {
		ManagementPanel.addAntAction(action);
	}, 200);
};
ManagementPanel.addAntAction = function(action) {
	if (game.anthill.hasWaitingAnt()) {
		var ant = game.anthill.getWaitingAnt();
    	ant.startAction(action);
		
		ManagementPanel.getNbAntsLabelForAction('waiting').text(game.anthill.activities_done['waiting']);
    	ManagementPanel.getNbAntsLabelForAction(action).text(game.anthill.activities_done[action]);
	}
};
ManagementPanel.removeAntActionButtonHandler = function(action) {
	ManagementPanel.removeAntAction(action);
	ManagementPanel.changeAntActionInterval = setInterval(function() {
		ManagementPanel.removeAntAction(action);
	}, 200);
};
ManagementPanel.removeAntAction = function(action) {
	if (game.anthill.hasAntOfActivity(action)) {
		var ant = game.anthill.getAntOfActivity(action);
    	ant.startWaiting();

    	ManagementPanel.getNbAntsLabelForAction('waiting').text(game.anthill.activities_done['waiting']);
    	ManagementPanel.getNbAntsLabelForAction(action).text(game.anthill.activities_done[action]);
	}
};
ManagementPanel.clearChangeAntActionInterval = function() {
	clearInterval(ManagementPanel.changeAntActionInterval);
};
ManagementPanel.updateNbAntsBarAndLabel = function() {
	var antsLevel = (game.anthill.ants.length / game.anthill.nb_ants_max) * 100;
	document.getElementById('nb-ants-bar').style.width = antsLevel + '%';
	document.getElementById('nb-ants-label').innerHTML = game.anthill.ants.length + ' / ' + game.anthill.nb_ants_max;
};
ManagementPanel.updateFoodBarAndLabel = function() {
	var foodLevel = (game.anthill.food_stock / game.anthill.max_food_stock) * 100;
	document.getElementById('food-stock-bar').style.width = foodLevel + '%';
	document.getElementById('food-stock-label').innerHTML = game.anthill.food_stock + ' / ' + game.anthill.max_food_stock;
};
ManagementPanel.getDefaultAntAction = function() {
	return document.getElementById('default-action').value;
};
ManagementPanel.updateNbAntsForAction = function(action) {
	document.getElementById('nb-' + action + '-ants').innerHTML = game.anthill.activities_done[action];
};
