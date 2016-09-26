
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

ManagementPanel.addAntActionButtonHandler = function(action) {ManagementPanel.addOrRemoveAntActionButtonHandler(action, true);};
ManagementPanel.removeAntActionButtonHandler = function(action) {ManagementPanel.addOrRemoveAntActionButtonHandler(action, false);};
ManagementPanel.addOrRemoveAntActionButtonHandler = function(action, actionIsAdd) {
	ManagementPanel.addOrRemoveAction(action, actionIsAdd);
	ManagementPanel.changeAntActionInterval = setInterval(function() {
		ManagementPanel.addOrRemoveAction(action, actionIsAdd);
	}, 200, actionIsAdd);
};
ManagementPanel.addOrRemoveAction = function(action, actionIsAdd) {
	if (actionIsAdd) {
		ManagementPanel.addAntAction(action);
	} else {
		ManagementPanel.removeAntAction(action);
	}
};
ManagementPanel.addAntAction = function(action) {
	if (game.anthill.hasWaitingAnt()) {
		var ant = game.anthill.getWaitingAnt();
    	ant.startAction(action);
		
		ManagementPanel.updateNbAntsForAction(action);
    	ManagementPanel.updateNbAntsForAction('waiting');
	}
};
ManagementPanel.removeAntAction = function(action) {
	if (game.anthill.hasAntOfActivity(action)) {
		var ant = game.anthill.getAntOfActivity(action);
    	ant.startWaiting();

    	ManagementPanel.updateNbAntsForAction(action);
    	ManagementPanel.updateNbAntsForAction('waiting');
	}
};

ManagementPanel.clearChangeAntActionInterval = function() {
	clearInterval(ManagementPanel.changeAntActionInterval);
};

ManagementPanel.getDefaultAntAction = function() {
	return document.getElementById('default-action').value;
};

ManagementPanel.updateNbAntsBarAndLabel = function() {ManagementPanel.updateResourceBarAndLabel('ants', game.anthill.ants.length, game.anthill.nb_ants_max);};
ManagementPanel.updateFoodBarAndLabel = function() {ManagementPanel.updateResourceBarAndLabel('food', game.anthill.food_stock, game.anthill.max_food_stock);};
ManagementPanel.updateResourceBarAndLabel = function(resourceName, resourceAmount, maxResourceAmount) {
	var percentage = (resourceAmount / maxResourceAmount) * 100;
	document.getElementById(resourceName + '-bar').style.width = percentage + '%';
	document.getElementById(resourceName + '-label').innerHTML = resourceAmount + ' / ' + maxResourceAmount;
};

ManagementPanel.updateNbAntsForAction = function(action) {
	document.getElementById('nb-' + action + '-ants').innerHTML = game.anthill.activities_done[action];
};
