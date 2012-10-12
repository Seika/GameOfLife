/**
 * @author Alejo S Fernandez
 */

var Grid = Class.create({
	initialize: function (width, height) {
		var that = this;
		
		this.width = width;
		this.height = height;
		this.cells = [];
		this.generation = 0;
		this.cellUpdatedSubscribers = [];
		this.mediator = new Mediator();
		
		this.initializeCells();
		this.initializeNeighbours();
		
		this.mediator.Subscribe('cell:updated', that.cellUpdated.bind(that));
	},
	
	initializeCells: function () {
		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
                this.cells.push(new Cell(x, y, this.mediator));
            }
		}
		
		return this;
	},
	
	initializeNeighbours: function () {
		this.cells.each(function (cell) {
			cell.addNeighbours(this.cells.findAll(function (c) { 
				return (c.y === cell.y - 1  && ( c.x === cell.x - 1 || c.x === cell.x || c.x === cell.x + 1)) ||
            		   (c.y === cell.y && (c.x === cell.x - 1 || c.x === cell.x + 1)) ||
            		   (c.y === cell.y + 1  && ( c.x === cell.x - 1 || c.x === cell.x || c.x === cell.x + 1));            	
          	}, this));
		}, this);
		
		return this;
	},
	
	getCell: function (x, y) {
		var cell = this.cells.findAll(function (c) { return c.x === x && c.y === y; });
		if (cell.length) {
			return cell[0];
		} else {
			return null;
		}
	},
	
	toggleCell: function (x, y) {
		var cell = this.getCell(x, y);
		if (cell) {
			cell.toggleStatus(this.generation);
		}
		
		return this;
	},
	
	getCellById: function (cellId) {
		var cell = this.cells.findAll(function (c) { return c.getId() === cellId; });
		if (cell.length) {
			return cell[0];
		} else {
			return null;
		}
	},
	
	toggleCellById: function (cellId) {
		var cell = this.getCellById(cellId);
		if (cell) {
			cell.toggleStatus(this.generation);
		}
		
		return this;
	},
	
	nextGeneration: function() {
		this.generation++;
		this.mediator.Publish('grid:nextGeneration', this.generation);
	},
	
	resetStatus: function() {
		this.generation = 0;
		this.mediator.Publish('grid:reset');
	},
	
	cellUpdated: function (cellUpdatedEventArgs) {
		this.cellUpdatedSubscribers.each(function (callback) {
			if (callback) {
				callback(cellUpdatedEventArgs);
			}
		}, this);
		
		return this;
	},
	
	onCellUpdated: function (callback) {
		this.cellUpdatedSubscribers.push(callback);
		
		return this;
	},
	
	exportData: function () {
		var data = [],
			cell,
			cells;
		
		for (var x = 0; x < this.width; x++) {
			cells = [];
			data.push({ 'row': x.toString(), 'cells': cells });
			for (var y = 0; y < this.height; y++) {
				cell = this.getCell(x, y);
                cells.push({ 'x': x.toString(), 'y': y.toString(), 'id': cell.getId(), 'status': cell.getStatus(this.generation) })
            }
		}
		
		return data;
	}
})

var Cell = Class.create({
	initialize: function (x, y, mediator) {
		var that = this;
		
		this.x = x;
		this.y = y;
		this.neighbours = [];
		this.status = [];
		this.mediator = mediator;
		this.resetStatus();
		
		this.mediator.Subscribe('grid:nextGeneration', that.evolve.bind(that));
		this.mediator.Subscribe('grid:reset', that.resetStatus.bind(that));
	},
	
	addNeighbours: function (neighbours) {
		neighbours.each(function (neighbour) {
			this.neighbours.push(neighbour);
		}, this);
		
		return this;	
	},
	 
	getId: function () {
		return '[' + this.x + '][' + this.y + ']';
	},
	
	resetStatus: function () {
		this.status = [];
		this.setStatus(0, 'dead');
		
		return this;
	},
	
	getStatus: function (generation) {
		return this.getGenerationStatus(generation).status;
	},
	
	getPreviousStatus: function (generation) {
		var previousGeneration = generation === 0 ? 0 : (generation - 1);
		
		return this.getStatus(previousGeneration);
	},
	
	getGenerationStatus: function (generation) {
		var generationStatus = this.status.findAll(function (s) { return s.generation === generation; });
		
		if (generationStatus && generationStatus.length) {
			return generationStatus[0];
		} else {
			return { generation: generation, status: null };
		}
	},
	
	setStatus: function (generation, status, forceEvent) {
		var generationStatus = this.getGenerationStatus(generation);
		
		if (!generationStatus.status) {
			generationStatus.status = status;
			this.status.push(generationStatus);
			
			if (this.status.length > 2) {
				this.status.shift();
			}
		}
		
		if (forceEvent || generation === 0 || this.getPreviousStatus(generation) != status) {
			generationStatus.status = status;
			this.mediator.Publish('cell:updated', { cell: this, generation: generationStatus.generation, status: generationStatus.status });			
		}
		
		return this;
	},
	
	toggleStatus: function (generation) {
		var generationStatus = this.getGenerationStatus(generation);
		
		if (generationStatus.status === 'alive') {
			this.setStatus(generation, 'dead', true);
		} else {
			this.setStatus(generation, 'alive', true);
		}
		
		return this;
	},
	
	evolve: function (generation) {
		var aliveNeighboursCount = 0,
			status = this.getPreviousStatus(generation);
			
		this.neighbours.each(function (neighbour) {
			aliveNeighboursCount += (neighbour.getPreviousStatus(generation) === 'alive' ? 1 : 0);
		});
		
		if (this.getPreviousStatus(generation) === 'alive' && (aliveNeighboursCount < 2 || aliveNeighboursCount > 3)) {
			status = 'dead';
		} else if (this.getPreviousStatus(generation) === 'alive' && (aliveNeighboursCount === 3 || aliveNeighboursCount === 2)) {
			status = 'alive';
		} else if (this.getPreviousStatus(generation) === 'dead' && aliveNeighboursCount === 3) {
			status = 'alive';
		}
		
		this.setStatus(generation, status);
		
		return this;
	},
});
