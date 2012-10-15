/**
 * @author Alejo S Fernandez
 */
$namespace('GameOfLife.Models', function () {
    var Grid, Cell;
    
    Grid = Class.create({
        initialize: function (width, height, cells) {
            var that = this;
            this.bindAll(that);
            
            this.width = width;
            this.height = height;
            this.generation = 0;
            this.cells = [];
            this.cellUpdatedSubscribers = [];
            this.mediator = new Mediator();
            
            this.initializeCells(cells);
            this.initializeNeighbours();
            
            this.mediator.Subscribe('cell:updated', this.cellUpdated, null, this);
        },
        
        initializeCells: function (initialCells) {
            var x, y;

            for (x = 0; x < this.width; x++) {
                for (y = 0; y < this.height; y++) {
                    this.cells.push(new Cell(x, y, this.mediator));
                }
            }
            
            if (initialCells) {
                this.importStatus(initialCells.findAll(function (c) { return c.status === 'alive'; }));
            }

            return this;
        },
        
        importStatus: function (status) {
            var found;
            
            status.each(function (c) {
                 found = this.getCell(c.x, c.y);
                 if (found) {
                     found.toggleStatus(0);
                 }
            }, this);
        },
        
        initializeNeighbours: function () {
            this.cells.each(function (cell) {
                cell.addNeighbours(this.cells.findAll(function (c) {
                    return (c.y === cell.y - 1  && ( c.x === cell.x - 1 || c.x === cell.x || c.x === cell.x + 1)) ||
                           (c.y === cell.y && (c.x === cell.x - 1 || c.x === cell.x + 1)) ||
                           (c.y === cell.y + 1 && ( c.x === cell.x - 1 || c.x === cell.x || c.x === cell.x + 1));
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
        
        offCellUpdated: function() {
            this.cellUpdatedSubscribers.clear();
        },
        
        exportData: function () {
            var data = [], cell, cells, x, y;
            
            for (x = 0; x < this.width; x++) {
                cells = [];
                data.push({ row: x.toString(), cells: cells });
                for (y = 0; y < this.height; y++) {
                    cell = this.getCell(x, y);
                    cells.push({
                        x: x.toString(),
                        y: y.toString(),
                        id: cell.getId(),
                        status: cell.getStatus(this.generation)
                    });
                }
            }
            
            return data;
        },
        
        bindAll: function (grid) {
            this.initializeCells.bind(grid);
            this.initializeNeighbours.bind(grid);
            this.getCell.bind(grid);
            this.toggleCell.bind(grid);
            this.nextGeneration.bind(grid);
            this.resetStatus.bind(grid);
            this.cellUpdated.bind(grid);
            this.onCellUpdated.bind(grid);
            this.exportData.bind(grid);
        }
    });

    Cell = Class.create({
        initialize: function (x, y, mediator) {
            var that = this;
            this.bindAll(that);
            
            this.x = x;
            this.y = y;
            this.neighbours = [];
            this.mediator = mediator;
            
            status ? this.setStatus(0, status) : this.resetStatus();
            
            this.mediator.Subscribe('grid:nextGeneration', this.evolve, null, this);
            this.mediator.Subscribe('grid:reset', this.resetStatus, null, this);
        },
        
        addNeighbours: function (neighbours) {
            neighbours.each(function (neighbour) {
                this.neighbours.push(neighbour);
            }, this);
            
            return this;
        },
        
        resetStatus: function () {
            this.status = [];
            this.setStatus(0, 'dead');
            
            return this;
        },
        
        getStatus: function (generation) {
            if (!generation && generation !== 0) {
                generation = this.status.last().generation;
            }
            
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
            
            if (forceEvent || generation === 0 || this.getPreviousStatus(generation) !== status) {
                generationStatus.status = status;
                this.mediator.Publish('cell:updated', { cell: this, x: this.x, y: this.y, generation: generationStatus.generation, status: generationStatus.status });
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
            var aliveNeighboursCount = 0, status;
            
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
        
        serialize: function () {
            return { x: this.x, y: this.y, status: this.getStatus() };
        },
        
        bindAll: function (cell) {
            this.addNeighbours.bind(cell);
            this.resetStatus.bind(cell);
            this.getStatus.bind(cell);
            this.getPreviousStatus.bind(cell);
            this.getGenerationStatus.bind(cell);
            this.setStatus.bind(cell);
            this.toggleStatus.bind(cell);
            this.evolve.bind(cell);
            this.serialize.bind(cell);
        }
    });
    
    return {
        Grid: Grid
    };
    
}());