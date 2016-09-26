function Resource(x, y) {
	this.life = Math.ceil(Math.random() * 50);
	this.shape = new createjs.Shape();
	this.shape.x = x;
	this.shape.y = y;
	this.shape.graphics.beginFill("#F00").drawCircle(0, 0, this.life/2);
	game.stage.addChild(this.shape);
}