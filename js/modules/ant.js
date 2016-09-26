
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
	if (typeof this.action != "undefined") {
		this.anthill.activities_done[this.action] --;
	}
	
	this.action = "waiting";
	this.anthill.activities_done['waiting'] ++;
	this.xT = this.anthill.shape.x;
	this.yT = this.anthill.shape.y;

	this.shape.graphics.clear();
	this.shape.graphics.beginFill("#621").drawCircle(0, 0, 3);
};

Ant.prototype.startExploring = function() {
	if (typeof this.action != "undefined") {
    	this.anthill.activities_done[this.action] --;
	}
	this.wait_before_finding_resource = 500;
	this.shape.x = Math.ceil(this.shape.x);
	this.shape.y = Math.ceil(this.shape.y);
	this.action = "exploring";
	this.anthill.activities_done['exploring'] ++;
	this.shape.graphics.clear();
	this.shape.graphics.beginFill("#4949ff").drawCircle(0, 0, 3);
}

Ant.prototype.startCollecting = function() {
	this.shape.x = Math.ceil(this.shape.x);
	this.shape.y = Math.ceil(this.shape.y);
	var resource = this.anthill.findCollectableResource();
	if (resource != false) {
	    this.collected_resource = resource;
	}
	if (this.action != "collecting") {
		if (typeof this.action != "undefined") {
    		this.anthill.activities_done[this.action] --;
	    }

		this.anthill.activities_done['collecting'] ++;
		this.shape.graphics.clear();
		this.shape.graphics.beginFill("#008400").drawCircle(0, 0, 3);
		this.action = "collecting";
	}
};

Ant.prototype.stopCollecting = function() {
	this.startWaiting();
};

Ant.prototype.isNearFromTarget = function() {return this.isNear(this.xT, this.yT);};
Ant.prototype.isNearFromAnthill = function() {return this.isNear(this.anthill.shape.x, this.anthill.shape.y);};
Ant.prototype.isNear = function(x, y) {
	return (Math.abs(this.shape.x - x) < 2) && (Math.abs(this.shape.y - y) < 2)
};

Ant.prototype.moveToTarget = function() {this.moveTo(this.xT, this.yT);};
Ant.prototype.moveToAnthill = function() {this.moveTo(this.anthill.shape.x, this.anthill.shape.y);};
Ant.prototype.moveTo = function(targetX, targetY) {
	if (this.shape.x < targetX) this.shape.x += 1;
	else if (this.shape.x > targetX) this.shape.x -= 1;

	else if (this.shape.y < targetY) this.shape.y += 1;
	else if (this.shape.y > targetY) this.shape.y -= 1;
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
		var tagetX, targetY;
		do {
			targetX = (this.anthill.shape.x - this.anthill.size/2) + Math.ceil(Math.random() * this.anthill.size);
			targetY = (this.anthill.shape.y - this.anthill.size/2) + Math.ceil(Math.random() * this.anthill.size);
		} while (! this.anthill.containsCoordinate(targetX, targetY));
		this.xT = targetX;
    	this.yT = targetY;
	}

	this.moveToTarget();
};

Ant.prototype.updateCollecting = function() {
	if (typeof this.collected_resource != "undefined") {
    	if (this.collected_resource.life <= 0) {
    		delete this.collected_resource;
	    	this.startCollecting();
		} else {
			this.updateCollectingDirection();	
			this.moveCollecting();
		}
	} else if (this.anthill.found_resources.length > 0) {
		this.startCollecting();
	} else {
		if (! this.anthill.containsCoordinate(this.xT, this.yT)) {
			this.xT = this.anthill.shape.x;
			this.yT = this.anthill.shape.y;
		}
		this.updateWaiting();
	}
};
Ant.prototype.updateCollectingDirection = function() {
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
		this.findNewTarget();
	}

	if (this.isNearFromTarget()) {
		if (this.canFindResource() && this.hasFoundResource()) {
			this.wait_before_finding_resource = 500;
			this.saveResource();
		}
		this.findNewTarget();
	}

	this.moveToTarget();
};
Ant.prototype.hasTarget = function() {
	return typeof this.xT != "undefined" && typeof this.yT != "undefined";
};
Ant.prototype.findNewTarget = function() {
	var tagetX, targetY;
	do {
		targetX = Math.ceil(Math.random() * 800);
		targetY = Math.ceil(Math.random() * 600);
	} while (! game.containsCoordinates(targetX, targetY, 0));
	this.xT = targetX;
	this.yT = targetY;
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
