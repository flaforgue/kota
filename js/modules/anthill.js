function Anthill() {
	this.shape = new createjs.Shape();

  	this.size = 40;
  	this.territory = {
  		size: 100,
  		shape: new createjs.Shape()
  	}
	this.ants = new Array;
  	this.nb_ants_max = 100;

	this.shape.graphics.beginFill("#222").drawCircle(0, 0, this.size);
	this.shape.graphics.beginFill("#000").drawCircle(0, 0, this.size/1.2);
	this.shape.graphics.beginFill("#333").drawCircle(0, 0, this.size/1.3);
	this.shape.graphics.beginFill("#000").drawCircle(0, 0, this.size/1.6);
	this.shape.graphics.beginFill("#444").drawCircle(0, 0, this.size/1.8);
	this.shape.graphics.beginFill("#000").drawCircle(0, 0, this.size/2.2);
	this.shape.graphics.beginFill("#555").drawCircle(0, 0, this.size/2.6);
	this.shape.graphics.beginFill("#000").drawCircle(0, 0, this.size/5);

	var x, y;
	do {
		x = Math.ceil(Math.random() * game.width);
		y = Math.ceil(Math.random() * game.height);
	} while (! game.containsCoordinates(x, y, 0));

	this.shape.x = x;
	this.shape.y = y;
	this.territory.shape.x = this.shape.x;
	this.territory.shape.y = this.shape.y;

	this.food_stock = 0;
	this.max_food_stock = 1000;
	this.found_resources = new Array;
	this.activities_done = {
		'waiting': 0,
		'exploring': 0,
		'collecting': 0,
	};
}

Anthill.prototype.getDifficulty = function() {
	return 0.1 + (0.05 / Math.floor(this.ants.length) / this.nb_ants_max);
}

Anthill.prototype.canCreateAnt = function() {
	return this.ants.length < this.nb_ants_max && this.ants.length < this.food_stock
}

Anthill.prototype.createAnt = function() {
	var newAnt = new Ant(this);
	this.ants.push(newAnt);
	this.updateTerritory(5);
};

Anthill.prototype.increaseFood = function(amount) {this.updateFood(amount);};
Anthill.prototype.decreaseFood = function(amount) {this.updateFood(amount * (-1));};
Anthill.prototype.updateFood = function(amount) {
	this.food_stock += amount;

	if (this.food_stock < 0) {
		this.food_stock = 0;
	}

	ManagementPanel.updateFoodBarAndLabel();
};

Anthill.prototype.containsCoordinate = function(x, y) {
	return x > (this.shape.x - this.size) && x < (this.shape.x) + this.size
	&& y > (this.shape.y) - this.size && y < (this.shape.y) + this.size;
};

Anthill.prototype.isInTerritory = function(x, y) {
	var xIsInTerritory = x > (this.territory.shape.x - this.territory.size) && x < (this.territory.shape.x) + this.territory.size;

	if (xIsInTerritory) {

		// teta is the angle of a trigonometric circle
		var cosTeta = (x - this.territory.shape.x)/this.territory.size;
		var teta = Math.acos(cosTeta);
		var maxYOffset = Math.sin(teta) * this.territory.size;

		var minY = this.territory.shape.y - maxYOffset;
		var maxY = this.territory.shape.y + maxYOffset;
		
		var yIsInTerritory = y > minY && y < maxY;
		
		return xIsInTerritory && yIsInTerritory && game.containsCoordinates(x, y, 0);

	} else {

		return false;

	}
};

Anthill.prototype.findCollectableResource = function() {
	var posibleResources = new Array;
	for (var i = 0 ; i < this.found_resources.length ; i ++) {
		if (this.found_resources[i].life > 0)
			posibleResources.push(this.found_resources[i]);
	}

	if (posibleResources.length == 0) {
		return false;
	} else {
		var resourceToCollectIndex = Math.floor(Math.random() * (posibleResources.length));
		return posibleResources[resourceToCollectIndex];
	}
};

Anthill.prototype.hasWaitingAnt = function() {return this.hasAntOfActivity('waiting');};
Anthill.prototype.hasExploringAnt = function() {return this.hasAntOfActivity('exploring');};
Anthill.prototype.hasCollectingAnt = function() {return this.hasAntOfActivity('collecting');};
Anthill.prototype.hasAntOfActivity = function(activity) {
	return this.activities_done[activity] > 0;
};

Anthill.prototype.getWaitingAnt = function() {return this.getAntOfActivity('waiting');};
Anthill.prototype.getExploringAnt = function() {return this.getAntOfActivity('exploring');};
Anthill.prototype.getCollectingAnt = function() {return this.getAntOfActivity('collecting');};
Anthill.prototype.getAntOfActivity = function(activity) {
	for (var i = 0; i < this.ants.length ; i ++) {
		if (this.ants[i].action == activity)
			return this.ants[i];
	}
};

Anthill.prototype.isStarving = function() {
	return this.food_stock <= 0;
};

Anthill.prototype.decreasePopulation = function() {
	if (this.ants.length > 1) {
    	for (var i = 0 ; i < (Math.ceil(this.ants.length / 10)) ; i ++) {
    		this.killAnt(i);
    		this.increaseFood(1);
    	}
    }
};

Anthill.prototype.killAnt = function(antToKillIndex) {
	var antToKill = this.ants[antToKillIndex];
	if (antToKill.action == "collecting") {
		game.stage.removeChild(antToKill.resource_carried);
	}
	this.activities_done[antToKill.action] --;
	ManagementPanel.updateNbAntsForAction(antToKill.action);

	this.updateTerritory(-5);
	this.ants.splice(antToKillIndex, 1);
	game.stage.removeChild(antToKill.shape);
	game.stage.removeChild(antToKill.resource_carried);
}

Anthill.prototype.updateTerritory = function(delta) {
	this.territory.size += delta;
	this.territory.shape.graphics.clear();
	this.territory.shape.graphics.beginFill("rgba(0,170,255,0.2)").drawCircle(0, 0, this.territory.size);
}
