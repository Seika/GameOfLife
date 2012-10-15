/**
 * @author Alejo S Fernandez
 */
$namespace('GameOfLife.Controllers', function ($, window, Tempo, JSON) {
	
	var GridController = Class.create({
		
		initialize: function (width, height, timeInterval, el) {
			var that = this;
			this.bindAll(that);

			this.timeInterval = timeInterval;
			this.el = $(el);
			
			this.width = width;
			this.height = height;
			
			this.intervalHandler = null;
			this.startButton = null;
			this.stopButton = null;
			this.resetButton = null;
			this.pulsarPatternButton = null;
			this.gliderPatternButton = null;
			this.lwssPatternButton = null;
			this.generationLabel = null;
			this.cells = null;
			this.cellRefs = [];
		},
		
		initializeModel: function (initialStatus) {
		    var that = this;
		    
		    if (!initialStatus) {
		        initialStatus = this.retrieveStatus();
		    }
		    
            this.grid = new GameOfLife.Models.Grid(this.width, this.height);
            this.grid.onCellUpdated(that.cellUpdated.bind(that));
            
            if (initialStatus && initialStatus.length) {
                this.grid.importStatus(initialStatus);
            }
		},
		
		initializeControls: function () {
			this.startButton = $('#startButton');
			this.stopButton = $('#stopButton');
			this.resetButton = $('#resetButton');
            this.pulsarPatternButton = $('#pulsarPatternButton');
            this.gliderPatternButton = $('#gliderPatternButton');
            this.lwssPatternButton = $('#lwssPatternButton');
			this.generationLabel = $('#generationLabel');
			
			
			this.renderGrid();
			this.bindCells();
			this.bindButtons();
		},
		
		renderGrid: function () {
		    Tempo.prepare($(this.el).attr('id')).render(this.emptyGrid());
            this.cells = $(this.el).find('div.cell');
		},
		
		bindCells: function () {
			var that = this;
			
			this.cells.each(function(index, cell) {
				that.cellRefs.push({ id: $(cell).data('cellid'), cell: $(cell) });
				cell.on('click', function () {
					that.cellClicked.bind(that)(cell);
				});
			});
		},
		
		bindButtons: function () {
			var that = this,
				startLabel = this.startButton.text(),
				stopLabel = this.stopButton.text();
			
			this.disableButton(this.stopButton, 'stopped');
			
			this.startButton.on('click', function () {
				that.disableButton(that.startButton, 'running');
				that.enableButton(that.stopButton, stopLabel);
				that.start.bind(that)();
			});
			
			this.stopButton.on('click', function () {
				that.disableButton(that.stopButton, 'stopped');
				that.enableButton(that.startButton, startLabel);
				that.stop.bind(that)();
			});
			
			this.resetButton.on('click', function () {
				that.reset.bind(that)();
			});
			
            this.pulsarPatternButton.on('click', function (e) {
                that.reset.bind(that)();
                that.grid.importStatus(GameOfLife.Patterns.pulsar);
            });
            
            this.gliderPatternButton.on('click', function (e) {
                that.reset.bind(that)();
                that.grid.importStatus(GameOfLife.Patterns.glider);
            });
            
            this.lwssPatternButton.on('click', function (e) {
                that.reset.bind(that)();
                that.grid.importStatus(GameOfLife.Patterns.lwss);
            });
		},
		
		disableButton: function (button, message) {
			button.text(message);
			button.addClass('disabled');
		},
		
		enableButton: function (button, label) {
			button.text(label);
			button.removeClass('disabled');
		},
		
		formatId: function (x, y) {
		    return '[' + x + '][' + y + ']';
		},
		
		parseId: function (id) {
		    var x, y;
		    
		    return {
		        x: parseInt(id.split(']')[0].replace('[', ''), 10),
		        y: parseInt(id.split(']')[1].replace('[', ''), 10)
            };
		},
		
		cellClicked: function (uiCell) {
			var id = this.parseId($(uiCell).data('cellid'));
			this.grid.toggleCell(id.x, id.y);
			this.storeStatus();
		},
		
		cellUpdated: function (eventArgs) {
			var alive = eventArgs.status === 'alive',
				cellId = this.formatId(eventArgs.cell.x, eventArgs.cell.y),
				ref = this.cellRefs.findAll(function (c) { return c.id === cellId; });
			
			if (ref && ref.length){
				if (alive) {
					ref[0].cell.addClass('alive');
				} else {
					ref[0].cell.removeClass('alive');
				}
			}
		},
		
		nextGeneration: function () {
			this.grid.nextGeneration();
			this.generationLabel.text(this.grid.generation);
		},
		
		start: function () {
			var that = this;
			if (!this.intervalHandler) {
				this.intervalHandler = window.setInterval(that.nextGeneration.bind(that), this.timeInterval);
			}
		},
		
		stop: function () {
			if (this.intervalHandler) {
				window.clearInterval(this.intervalHandler);
				this.intervalHandler = null;
				this.storeStatus();
			}
		},
		
		reset: function () {
			this.grid.resetStatus();
			this.generationLabel.text(this.grid.generation);
			this.storeStatus();
		},
		
		emptyGrid: function () {
            var that = this, data = [], cell, cells, x, y;
            
            for (x = 0; x < this.width; x++) {
                cells = [];
                data.push({ row: x.toString(), cells: cells });
                for (y = 0; y < this.height; y++) {
                    cells.push({
                        x: x.toString(),
                        y: y.toString(),
                        id: that.formatId(x, y)
                    });
                }
            }
            
            return data;
		},
		
		storeStatus: function () {
		    var aliveCells;
		    
		    if (window.localStorage) {
		        aliveCells = this.grid.cells.invoke('serialize').findAll(function (c) { return c.status === 'alive'; });
		        window.localStorage.setItem('cell-status', JSON.stringify(aliveCells));
		    }
		},
		
		retrieveStatus: function () {
		    var json, cells = null;
		    
            if (window.localStorage) {
                json = window.localStorage.getItem('cell-status');
                if (json) {
                    cells = JSON.parse(json);
                }
            }
            
            return cells;
		},
		
		bindAll: function (controller) {
		    this.renderGrid.bind(controller);
            this.initializeControls.bind(controller);
            this.bindCells.bind(controller);
            this.bindButtons.bind(controller);
            this.disableButton.bind(controller);
            this.enableButton.bind(controller);
            this.formatId.bind(controller);
            this.parseId.bind(controller);
            this.cellClicked.bind(controller);
            this.cellUpdated.bind(controller);
            this.nextGeneration.bind(controller);
            this.start.bind(controller);
            this.stop.bind(controller);
            this.reset.bind(controller);
		    this.emptyGrid.bind(controller);
		    this.storeStatus.bind(controller);
		    this.retrieveStatus.bind(controller);
		}
	});
	
	return {
		GridController: GridController
	};
	
}(jQuery, window, Tempo, JSON));
