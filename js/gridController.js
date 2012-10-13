/**
 * @author Alejo S Fernandez
 */
$namespace('GameOfLife.Controllers', function ($, root) {
	
	var GridController = Class.create({
		
		initialize: function (width, height, timeInterval, el) {
			var that = this;

			this.timeInterval = timeInterval;
			this.el = $(el);
			
			this.intervalHandler = null;
			this.startButton = null;
			this.stopButton = null;
			this.resetButton = null;
			this.generationLabel = null;
			this.cells = null;
			this.cellRefs = [];
			
			this.grid = new GameOfLife.Models.Grid(width, height);			
			this.grid.onCellUpdated(that.cellUpdated.bind(that));
		},
		
		initializeControls: function () {
			this.startButton = $('#startButton');
			this.stopButton = $('#stopButton');
			this.resetButton = $('#resetButton');
			this.cells = $(this.el).find('div.cell');
			this.generationLabel = $('#generationLabel');
			
			this.bindCells();
			this.bindButtons();
		},
		
		bindCells: function () {
			var that = this;
			
			this.cells.each(function(index, cell) {
				that.cellRefs.push({ id: $(cell).data('cellid'), cell: $(cell) })
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
			
			resetButton.on('click', function () {
				that.reset.bind(that)();
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
		
		cellClicked: function (uiCell) {
			var cellId = $(uiCell).data('cellid');
			this.grid.toggleCellById(cellId);
		},
		
		cellUpdated: function (eventArgs) {
			var alive = eventArgs.status === 'alive',
				cellId = eventArgs.cell.getId(),
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
				this.intervalHandler = root.setInterval(that.nextGeneration.bind(that), this.timeInterval);
			}
		},
		
		stop: function () {
			if (this.intervalHandler) {
				root.clearInterval(this.intervalHandler);	
				this.intervalHandler = null;
			}
		},
		
		reset: function () {
			this.grid.resetStatus();
			this.generationLabel.text(this.grid.generation);			
		},
		
		exportData: function () {
			return this.grid.exportData();
		},
		
		importData: function (data) {
			
		}
	});
	
	return { 
		GridController: GridController
	}
	
}(jQuery, window));
