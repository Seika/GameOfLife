/**
 * @author Alejo S Fernandez
 */
var GridController = Class.create({
	
	initialize: function (width, height, timeInterval, el) {
		var that = this;
		
		this.el = el;
		this.grid = new Grid(width, height);
		this.timeInterval = timeInterval;
		this.intervalHandler = null;
		
		this.grid.onCellUpdated(that.cellUpdated.bind(that));
	},
	
	bindCells: function () {
		var that = this;
		
		jQuery('.cell').each(function(index, cell) {
			cell.on('click', function () {
				that.cellClicked.bind(that)(cell);
			});		  
		});
	},
	
	bindButtons: function () {
		var that = this;
			startButton = jQuery('#startButton'),
			stopButton = jQuery('#stopButton'),
			resetButton = jQuery('#resetButton'),
			startLabel = startButton.text(),
			stopLabel = stopButton.text();
		
		that.disableButton(stopButton, 'stopped');
		
		startButton.on('click', function () {
			that.disableButton(startButton, 'running');
			that.enableButton(stopButton, stopLabel);
			that.start.bind(that)();
		});
		
		stopButton.on('click', function () {
			that.disableButton(stopButton, 'stopped');
			that.enableButton(startButton, startLabel);
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
		var cellId = jQuery(uiCell).data('cellid');
		this.grid.toggleCellById(cellId);
	},
	
	cellUpdated: function (eventArgs) {
		var alive = eventArgs.status === 'alive'
			displayCell = jQuery('div[data-cellid=\'' + eventArgs.cell.getId() + '\']');
		
		if (alive) {
			displayCell.addClass('alive');
		} else {
			displayCell.removeClass('alive');
		}
	},
	
	nextGeneration: function () {
		this.grid.nextGeneration();
		jQuery('#generationLabel').text(this.grid.generation);
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
		}
	},
	
	reset: function () {
		this.grid.resetStatus();
		jQuery('#generationLabel').text(this.grid.generation);
	},
	
	gridData: function () {
		return this.grid.exportData();
	}
});
