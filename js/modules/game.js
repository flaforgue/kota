
function Game(width, height) {
	this.stage = new createjs.Stage("kota");
	this.background = new createjs.Bitmap("./img/background.png");
	this.stage.addChild(this.background);
	this.isPaused = false;
	this.width = width;
	this.height = height;
}

Game.prototype.createAnthill = function() {
	this.anthill = new Anthill();
	this.stage.regX = this.anthill.shape.x - ($('#kota').attr('width') / 2);
	this.stage.regY = this.anthill.shape.y - ($('#kota').attr('height') / 2);
	this.stage.addChild(this.anthill.shape);
	this.stage.addChild(this.anthill.territory.shape);
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
	    			game.stage.removeChild(resource);
	    			this.anthill.found_resources.splice(i, 1);
	    		} else {
	    			i ++;
	    		}
	    	}
    	} while (typeof resource != "undefined")
	}
};

Game.prototype.containsCoordinates = function(x, y, offset) {
	return x > offset && x < (this.width - offset) && y > offset && y < (this.height - offset);
};

Game.prototype.moveWorldView = function(axe, direction) {
	var worldMoveValue = 10;
	if (! direction) {
		worldMoveValue *= -1;
	}
	
	if (game.canMoveWorld(axe, direction)) {
		game.stage[axe] += worldMoveValue;
	}
};

Game.prototype.canMoveWorld = function(axe, direction) {
	if (axe == "regX") {
		var border = game.width - $('#kota').width() + 100;
	} else {
		var border = game.height - $('#kota').height() + 40;
	}
	return (this.stage[axe] >= 0 && ! direction) || (this.stage[axe] <= border && direction);
};

Game.prototype.zoomIn = function(value) {
	if (game.stage.scaleX < 2) {
		this.updateZoom(game.stage.scaleX + value);
	}
}

Game.prototype.zoomOut = function(value) {
	if (game.stage.scaleX > 0.25) {
		this.updateZoom(game.stage.scaleX - value);
	}
}

Game.prototype.updateZoom = function(newZoom) {
	this.stage.scaleX = newZoom;
	this.stage.scaleY = newZoom;
}