
function Ant(anthill) {
	this.shape = new createjs.Shape()
	this.shape.x = anthill.shape.x;
	this.shape.y = anthill.shape.y;
	this.anthill = anthill;
	this.go_to_wild = true;
	this.wait_before_finding_resource = 500;
	this.exploring_efficiency = Math.ceil(Math.random() * 4) + 1;
	var defaultAction = ManagementPanel.getDefaultAntAction();
	this.startAction(defaultAction);

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

	this.wait_before_finding_resource = 500;
	this.smoothCoordinates();
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
	if (this.hasToMove('x', targetX)) {
		this.moveToBy('x', targetX);
	} else {
		this.moveToBy('y', targetY);
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
		this.xT = (this.anthill.shape.x - this.anthill.size/2) + Math.ceil(Math.random() * this.anthill.size);
		this.yT = (this.anthill.shape.y - this.anthill.size/2) + Math.ceil(Math.random() * this.anthill.size);
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
	if (this.collected_resource.life <= 0) {
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
}
Ant.prototype.pickOrStoreResource = function() {
	if (this.canStoreFood()) {
		this.storeFood();
	} else if (this.canPickResource()) {
		this.pickResource();
	}
};
Ant.prototype.moveCollecting = function() {
	if (this.go_to_wild) {
		this.moveTo(this.collected_resource.shape.x, this.collected_resource.shape.y);
	} else {
		this.moveToAnthill();
	}
};
Ant.prototype.canStoreFood = function() {
	return ! this.go_to_wild && this.isNearFromAnthill();
};
Ant.prototype.storeFood = function() {
	this.go_to_wild = true;
	if (this.anthill.food_stock < this.anthill.max_food_stock) {
		this.anthill.increaseFood(1);
	}
};
Ant.prototype.canPickResource = function() {
	return this.go_to_wild && this.isNear(this.collected_resource.shape.x, this.collected_resource.shape.y);
};
Ant.prototype.pickResource = function() {
	this.collected_resource.life --;
	this.collected_resource.shape.graphics.clear();
	
	if (this.collected_resource.life > 0) {
		this.collected_resource.shape.graphics.beginFill("#F00").drawCircle(0, 0, this.collected_resource.life/2);
	}
	
	this.go_to_wild = false;
};

Ant.prototype.updateExploring = function() {
	if (this.wait_before_finding_resource > 0) {
		this.wait_before_finding_resource --;
	}

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
		this.wait_before_finding_resource = 500;
		this.saveResource();
	}
	this.findNewExploringTarget();
}
Ant.prototype.hasTarget = function() {
	return typeof this.xT != "undefined" && typeof this.yT != "undefined";
};
Ant.prototype.findNewExploringTarget = function() {
	do {
		this.xT = Math.ceil(Math.random() * 800);
		this.yT = Math.ceil(Math.random() * 600);
	} while (! game.containsCoordinates(this.xT, this.yT, 0));
};
Ant.prototype.canFindResource = function() {
	return this.wait_before_finding_resource <= 0 && this.anthill.found_resources.length < 25;
};
Ant.prototype.hasFoundResource = function() {
	var chances = 6 - this.exploring_efficiency + (this.anthill.found_resources.length * 2);
	return Math.ceil(Math.random() * chances * 2) == chances * 2;
};
Ant.prototype.saveResource = function() {
	resourceX = Math.ceil(this.xT);
	resourceY = Math.ceil(this.yT);
	var resource = new Resource(resourceX, resourceY);
	this.anthill.found_resources.push(resource);
};
