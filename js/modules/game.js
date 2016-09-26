
function Game() {
	this.stage = new createjs.Stage("kota");
	this.isPaused = false;
}

Game.prototype.createAnthill = function() {
	this.anthill = new Anthill();
	this.stage.addChild(this.anthill.shape);
};

Game.prototype.update = function() {
	if (! this.isPaused) {
  		this.updateAnts();
  		this.updateResources();
  		this.stage.update();
  	}
};
Game.prototype.updateAnts = function() {
    for (var i = 0 ; i < this.anthill.ants.length ; i ++) {
    	this.anthill.ants[i].update();
    }
};

Game.prototype.replayGameIfPaused = function() {
	if (this.isPaused) {
		this.replayGame();
	}
};
Game.prototype.replayGame = function() {
	this.isPaused = false;
};
Game.prototype.pauseGame = function() {
	this.isPaused = true;
};

Game.prototype.createAnts = function() {
	if (this.anthill.canCreateAnt()) {
		this.anthill.createAnt();
    }
};

Game.prototype.starvingCheck = function() {
	if (! this.isPaused) {
    	if (this.anthill.isStarving()) {
    		this.anthill.decreasePopulation();
    	}
	}
};

Game.prototype.makeAntsEat = function() {
	if (! this.isPaused) {
		var difficulty = this.anthill.getDifficulty();
    	var foodEaten = Math.floor(this.anthill.ants.length * difficulty);
    	this.anthill.decreaseFood(foodEaten);
	}
};

// raf : trouver meilleur moyen
Game.prototype.updateResources = function() {
	if (this.anthill.found_resources.length > 0) {
		var i = 0;
    	do {
    		resource = this.anthill.found_resources[i];
    		if (typeof resource != "undefined") {
	    		if (resource.life <= 0) {
	    			this.anthill.found_resources.splice(i, 1);
	    		} else {
	    			i ++;
	    		}
	    	}
    	} while (typeof resource != "undefined")
	}
};

// RAF : pas de valeurs en dur
Game.prototype.containsCoordinates = function(x, y, offset) {
	return x > offset && x < (800 - offset) && y > offset && y < (600 - offset);
}
