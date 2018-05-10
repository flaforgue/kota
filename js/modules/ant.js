
function Ant(anthill) {
	this.shape = new createjs.Shape();
	game.stage.addChild(this.shape);
	this.shape.x = anthill.shape.x;
	this.shape.y = anthill.shape.y;
	this.anthill = anthill;
	this.carrying = false;
	var defaultAction = ManagementPanel.getDefaultAntAction();
	this.startAction(defaultAction);
	this.resource_carried = new createjs.Shape();
}

Ant.prototype.startAction = function(action) {
	switch (action) {
		case 'waiting' :
			this.startWaiting();
			break;

		case 'exploring' :
			this.startExploring();
			break;

		case 'collecting' :
			this.startCollecting();
			break;

		default :
			console.log('ERROR : unknown action');
			break;
	}
	ManagementPanel.updateNbAntsForAction(action);
};

Ant.prototype.startWaiting = function(action) {
	this.changeActivityTo('waiting');

	this.xT = this.anthill.shape.x;
	this.yT = this.anthill.shape.y;
};

Ant.prototype.startExploring = function() {
	this.changeActivityTo('exploring');
	this.smoothCoordinates();
	this.findNewExploringTarget();
}

Ant.prototype.startCollecting = function() {
	this.smoothCoordinates();	
	this.findResourceToCollect();
	
	if (this.action != "collecting") {
		this.changeActivityTo('collecting');
	}
};

Ant.prototype.findResourceToCollect = function() {
	var resource = this.anthill.findCollectableResource();
	if (resource != false) {
	    this.collected_resource = resource;
	}
};

Ant.prototype.smoothCoordinates = function() {
	this.shape.x = Math.ceil(this.shape.x);
	this.shape.y = Math.ceil(this.shape.y);
};

Ant.prototype.changeActivityTo = function(newAction) {
	if (this.action == "collecting") {
		game.stage.removeChild(this.resource_carried);
	} else if (newAction == "collecting") {
		game.stage.addChild(this.resource_carried);
	}
	this.updateAnthillActivitiesDone(false);
	this.action = newAction;
	this.updateAnthillActivitiesDone(true);

	this.shape.graphics.clear();
	this.shape.graphics.beginFill(ANT_COLORS[newAction]).drawCircle(0, 0, 3);
};

Ant.prototype.updateAnthillActivitiesDone = function(addAnt) {
	if (typeof this.action != "undefined") {
		if (addAnt) {
			this.anthill.activities_done[this.action] ++;
		} else {
			this.anthill.activities_done[this.action] --;
		}
	}
};

Ant.prototype.stopCollecting = function() {
	this.startWaiting();
};

Ant.prototype.isNearFromTarget = function() {return this.isNear(this.xT, this.yT);};
Ant.prototype.isNearFromAnthill = function() {return this.isNear(this.anthill.shape.x, this.anthill.shape.y);};
Ant.prototype.isNear = function(x, y) {
	return (Math.abs(this.shape.x - x) == 0) && (Math.abs(this.shape.y - y) == 0)
};

Ant.prototype.moveToTarget = function() {this.moveTo(this.xT, this.yT);};
Ant.prototype.moveToAnthill = function() {this.moveTo(this.anthill.shape.x, this.anthill.shape.y);};
Ant.prototype.moveTo = function(targetX, targetY) {
	if (this.hasToMove('x', targetX) && ! this.hasToMove('y', targetX)) {
		this.moveToBy('x', targetX);
	} else if (this.hasToMove('y', targetX) && ! this.hasToMove('x', targetX)) {
		this.moveToBy('y', targetY);
	} else {
		var axeIsX = Math.floor(Math.random() * 2);
		if (axeIsX) {
			this.moveToBy('x', targetX);
		} else {
			this.moveToBy('y', targetY);
		}
	}
};

Ant.prototype.hasToMove = function(axe, target) {
	return this.shape[axe] != target;
};

Ant.prototype.moveToBy = function(coordinate, target) {
	if (this.shape[coordinate] < target) {
		this.shape[coordinate] += 1;
	} else if (this.shape[coordinate] > target) {
		this.shape[coordinate] -= 1;
	}
};

Ant.prototype.update = function() {
	switch(this.action) {
		case 'waiting' :
			this.updateWaiting();
			break;

		case 'exploring' :
			this.updateExploring();
			break;

		case 'collecting' :
			this.updateCollecting();
			break;

		default :
			console.log('ERROR : unknown action');
			break;
	}
};

Ant.prototype.updateWaiting = function() {
	if (this.isNearFromTarget() || ! this.hasTarget()) {
		this.findTargetInAnthill();
	}

	this.moveToTarget();
};

Ant.prototype.findTargetInAnthill = function() {
	do {
		this.xT = (this.anthill.shape.x - this.anthill.size / 2) + Math.ceil(Math.random() * this.anthill.size);
		this.yT = (this.anthill.shape.y - this.anthill.size / 2) + Math.ceil(Math.random() * this.anthill.size);
	} while (! this.anthill.containsCoordinate(this.xT, this.yT));
}

Ant.prototype.updateCollecting = function() {
	if (this.hasCollectedResource()) {
    	this.collectResourceIfPossible();
	} else if (this.anthill.found_resources.length > 0) {
		this.findResourceToCollect();
	} else {
		this.actLikeWaitingAnt();
	}
};

Ant.prototype.collectResourceIfPossible = function() {
	if (this.collected_resource.life <= 0 && ! this.carrying) {
		delete this.collected_resource;
		this.findResourceToCollect();
	} else {
		this.pickOrStoreResource();	
		this.moveCollecting();
	}
};
Ant.prototype.actLikeWaitingAnt = function() {
	if (! this.anthill.containsCoordinate(this.xT, this.yT)) {
		this.forgetTarget();
	}
	this.updateWaiting();
};

Ant.prototype.forgetTarget = function() {
	delete this.xT;
	delete this.yT;
};

Ant.prototype.hasCollectedResource = function() {
	return typeof this.collected_resource != "undefined";
};

Ant.prototype.pickOrStoreResource = function() {
	if (this.canStoreFood()) {
		this.storeFood();
	} else if (this.canPickResource()) {
		this.pickResource();
	}
};

Ant.prototype.moveCollecting = function() {
	if (! this.carrying) {
		this.moveTo(this.collected_resource.shape.x, this.collected_resource.shape.y);
	} else {
		this.moveToAnthill();
	}

	this.updateResourceCarried();
};

Ant.prototype.updateResourceCarried = function() {
	this.resource_carried.x = this.shape.x;
	this.resource_carried.y = this.shape.y;
};

Ant.prototype.canStoreFood = function() {
	return this.carrying && this.isNearFromAnthill();
};

Ant.prototype.storeFood = function() {
	this.carrying = false;
	game.stage.removeChild(this.resource_carried);
	if (this.anthill.food_stock < this.anthill.max_food_stock) {
		this.anthill.increaseFood(1);
	}
};

Ant.prototype.canPickResource = function() {
	return ! this.carrying && this.isNear(this.collected_resource.shape.x, this.collected_resource.shape.y);
};

Ant.prototype.pickResource = function() {
	this.collected_resource.life --;
	this.collected_resource.shape.graphics.clear();
	
	if (this.collected_resource.life > 0) {
		this.collected_resource.shape.graphics.beginFill("#F00").drawCircle(0, 0, this.collected_resource.life/2);
	}
	
	this.carrying = true;
	game.stage.addChild(this.resource_carried);
	this.resource_carried.graphics.beginFill("#F00").drawCircle(0, 0, 2);
};

Ant.prototype.updateExploring = function() {
	if (! this.hasTarget()) {
		this.findNewExploringTarget();
	}

	if (this.isNearFromTarget()) {
		this.findResourceIfPossible();
	}

	this.moveToTarget();
};

Ant.prototype.findResourceIfPossible = function() {
	if (this.canFindResource() && this.hasFoundResource()) {
		this.saveResource();
	}
	this.findNewExploringTarget();
};

Ant.prototype.hasTarget = function() {
	return typeof this.xT != "undefined" && typeof this.yT != "undefined";
};

Ant.prototype.findNewExploringTarget = function() {
	var minX = this.anthill.shape.x - this.anthill.territory.size;
	var minY = this.anthill.shape.y - this.anthill.territory.size;
	var maxX = this.anthill.shape.x + this.anthill.territory.size;
	var maxY = this.anthill.shape.y + this.anthill.territory.size;

	do {
		this.xT = Math.ceil(Math.random() * maxX) + minX;
		this.yT = Math.ceil(Math.random() * maxY) + minY;
	} while (! this.anthill.isInTerritory(this.xT, this.yT, 30));
};

Ant.prototype.canFindResource = function() {
	return this.anthill.found_resources.length < 25;
};

Ant.prototype.hasFoundResource = function() {
	var chances = ((this.anthill.found_resources.length) + 1) * 2;
	return Math.ceil(Math.random() * chances) == chances;
};

Ant.prototype.saveResource = function() {
	resourceX = Math.ceil(this.xT);
	resourceY = Math.ceil(this.yT);
	var resource = new Resource(resourceX, resourceY);
	this.anthill.found_resources.push(resource);
};
