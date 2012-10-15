(function( $ ) {
	
	var TestHelpers = {};
	TestHelpers.testJshint = function( module ) {

		asyncTest("JSHint: " + module, function() {
			expect( 1 );
	
			$.when(
				$.ajax({
					url: "test/jshintconfig.json",
					dataType: "json"
				}),
				$.ajax({
					url: module,
					dataType: "text"
				})
			).done(function( hintArgs, srcArgs ) {
				var passed = JSHINT( srcArgs[ 0 ], hintArgs[ 0 ] ),
					errors = $.map( JSHINT.errors, function( error ) {
						// JSHINT may report null if there are too many errors
						if ( !error ) {
							return;
						}
	
						return "[L" + error.line + ":C" + error.character + "] " +
							error.reason + "\n" + error.evidence + "\n";
					}).join( "\n" );
				ok( passed, errors );
				start();
			})
			.fail(function() {
				ok( false, "error loading source" );
				start();
			});
		});
	};
	
    TestHelpers.testJshint( 'js/gridModel.js' );
    TestHelpers.testJshint( 'js/gridController.js' );
	
	test("should_return_alive_cell", function() {
	    var grid, cells, cell;
	    
	    // Arrange
	    cells = [
	       { x: 0, y: 0, status: 'dead' },
           { x: 0, y: 1, status: 'dead' },
           { x: 0, y: 2, status: 'dead' },
           { x: 1, y: 0, status: 'alive' },
           { x: 1, y: 1, status: 'dead' },
           { x: 1, y: 2, status: 'dead' },
           { x: 2, y: 0, status: 'dead' },
           { x: 2, y: 1, status: 'dead' },
           { x: 2, y: 2, status: 'dead' }
        ];
	    
	    grid = new GameOfLife.Models.Grid(3, 3, cells);
	    
	    // Act
	    cell = grid.getCell(1, 0);
	    
	    // Assert
        ok( cell, "Cell (1,0) found" );
	    ok( cell.getStatus() === 'alive', "Cell (1,0) is alive" );
	});
	
	test("should_return_dead_cell", function() {
        var grid, cells, cell;
        
        // Arrange
        cells = [
           { x: 1, y: 0, status: 'alive' }
        ];
        
        grid = new GameOfLife.Models.Grid(3, 3, cells);
        
        // Act
        cell = grid.getCell(1, 1);
        
        // Assert
        ok( cell, "Cell (1,1) found" );
        ok( cell.getStatus() === 'dead', "Cell (1,1) is dead" );
    });
    
    test("should_return_null_out_of_bounds_cell", function() {
        var grid, cells, cell;
        
        // Arrange
        cells = [
           { x: 0, y: 0, status: 'dead' },
           { x: 0, y: 1, status: 'dead' },
           { x: 0, y: 2, status: 'dead' },
           { x: 1, y: 0, status: 'alive' },
           { x: 1, y: 1, status: 'dead' },
           { x: 1, y: 2, status: 'dead' },
           { x: 2, y: 0, status: 'dead' },
           { x: 2, y: 1, status: 'dead' },
           { x: 2, y: 2, status: 'dead' }
        ];
        
        grid = new GameOfLife.Models.Grid(3, 3, cells);
        
        // Act
        cell = grid.getCell(4, 0);
        
        // Assert
        ok( cell == null, "Cell (4,0) not found" );
    });
    
    test("should_not_initialize_an_out_of_bounds_cell", function() {
        var grid, cells, cell;
        
        // Arrange
        cells = [
           { x: 4, y: 0, status: 'alive' }
        ];
        
        grid = new GameOfLife.Models.Grid(3, 3, cells);
        
        // Act
        cell = grid.getCell(4, 0);
        
        // Assert
        ok( cell == null, "Cell (4,0) not found" );
    });
    
    test("should_return_neighbours_for_cell_(1,1)", function() {
        var grid, cells, neighbours;
        
        // Arrange
        cells = [
           { x: 0, y: 0, status: 'alive' },
           { x: 2, y: 2, status: 'alive' }
        ];
        
        grid = new GameOfLife.Models.Grid(3, 3, cells);
        
        // Act
        neighbours = grid.getCell(1, 1).neighbours;
        
        // Assert
        ok( neighbours.length === 8, "Cell (1,1) has 8 neighbours" );
        ok( neighbours.find(function (c) { return c.x === 2 && c.y === 2; }).getStatus() === 'alive', "Neighbour Cell (2,2) is alive" );
        ok( neighbours.find(function (c) { return c.x === 0 && c.y === 0; }).getStatus() === 'alive', "Neighbour Cell (0,0) is alive" );
    });
    
    test("should_return_neighbours_for_cell_(0,0)", function() {
        var grid, cells, neighbours;
        
        // Arrange
        cells = [
           { x: 0, y: 0, status: 'alive' },
           { x: 1, y: 0, status: 'alive' }
        ];
        
        grid = new GameOfLife.Models.Grid(3, 3, cells);
        
        // Act
        neighbours = grid.getCell(0, 0).neighbours;
        
        // Assert
        ok( neighbours.length === 3, "Cell (0,0) has 3 neighbours" );
        ok( neighbours.find(function (c) { return c.x === 1 && c.y === 0; }).getStatus() === 'alive', "Neighbour Cell (1,0) is alive" );
    });
    
    test("should_return_alive_neighbours_for_cell_(1,1)", function() {
        var grid, cells, aliveNeighbours;
        
        // Arrange
        cells = [
           { x: 0, y: 0, status: 'alive' },
           { x: 2, y: 2, status: 'alive' }
        ];
        
        grid = new GameOfLife.Models.Grid(3, 3, cells);
        
        // Act
        aliveNeighbours = grid.getCell(1, 1).neighbours.findAll(function (c) { return c.getStatus.bind(c)() === 'alive'; });
        
        // Assert
        ok( aliveNeighbours.length === 2, "Cell (1,1) has 2 alive neighbours" );
        ok( aliveNeighbours.find(function (c) { return c.x === 2 && c.y === 2; }), "Neighbour Cell (2,2) is alive" );
        ok( aliveNeighbours.find(function (c) { return c.x === 0 && c.y === 0; }), "Neighbour Cell (0,0) is alive" );
    });

    test("should_return_dead_neighbours_for_cell_(1,1)", function() {
        var grid, cells, deadNeighbours;
        
        // Arrange
        cells = [
           { x: 0, y: 0, status: 'alive' },
           { x: 2, y: 2, status: 'alive' }
        ];
        
        grid = new GameOfLife.Models.Grid(3, 3, cells);
        
        // Act
        deadNeighbours = grid.getCell(1, 1).neighbours.findAll(function (c) { return c.getStatus.bind(c)() !== 'alive'; });
        
        // Assert
        ok( deadNeighbours.length === 6, "Cell (1,1) has 6 dead neighbours" );
        ok( !deadNeighbours.find(function (c) { return c.x === 2 && c.y === 2; }), "Neighbour Cell (2,2) is dead" );
        ok( !deadNeighbours.find(function (c) { return c.x === 0 && c.y === 0; }), "Neighbour Cell (0,0) is dead" );
    });
    
    test("should_process_first_generation_for_blinker_pattern", function() {
        var grid, cells, updated = [];
        
        // Arrange
        cells = [
           { x: 0, y: 1, status: 'alive' },
           { x: 1, y: 1, status: 'alive' },
           { x: 2, y: 1, status: 'alive' }
        ];
        
        grid = new GameOfLife.Models.Grid(3, 3, cells);
        
        grid.onCellUpdated(function (args) {
            updated.push(args);
        });
        
        // Act
        grid.nextGeneration();
        
        // Assert
        stop();
        setTimeout(function() {
            ok(updated.length == 4, "4 cells were updated");
            ok(updated.find(function (c) { return c.x === 0 && c.y === 1; }).status === 'dead', "Cell (0,1) is dead" );
            ok(updated.find(function (c) { return c.x === 1 && c.y === 0; }).status === 'alive', "Cell (1,0) is alive" );
            ok(updated.find(function (c) { return c.x === 1 && c.y === 2; }).status === 'alive', "Cell (1,2) is alive" );
            ok(updated.find(function (c) { return c.x === 2 && c.y === 1; }).status === 'dead', "Cell (2,1) is dead" );
            start();
        }, 500);
    });
    
    test("block_pattern_should_stay_still", function() {
        var grid, cells, updated = [];
        
        // Arrange
        cells = [
           { x: 1, y: 1, status: 'alive' },
           { x: 1, y: 2, status: 'alive' },
           { x: 2, y: 1, status: 'alive' },
           { x: 2, y: 2, status: 'alive' }
        ];
        
        grid = new GameOfLife.Models.Grid(4, 4, cells);
        
        grid.onCellUpdated(function (args) {
            updated.push(args);
        });
        
        // Act
        grid.nextGeneration();
        
        // Assert
        stop();
        setTimeout(function() {
            ok(updated.length == 0, "No cells were updated");
            start();
        }, 500);
    });
    
    test("beehive_pattern_should_stay_still", function() {
        var grid, cells, updated = [];
        
        // Arrange
        cells = [
           { x: 0, y: 0, status: 'dead' },
           { x: 0, y: 1, status: 'alive' },
           { x: 0, y: 2, status: 'alive' },
           { x: 0, y: 3, status: 'dead' },
           { x: 1, y: 0, status: 'alive' },
           { x: 1, y: 1, status: 'dead' },
           { x: 1, y: 2, status: 'dead' },
           { x: 1, y: 3, status: 'alive' },
           { x: 2, y: 0, status: 'dead' },
           { x: 2, y: 1, status: 'alive' },
           { x: 2, y: 2, status: 'alive' },
           { x: 2, y: 3, status: 'dead' }
        ];
        
        grid = new GameOfLife.Models.Grid(4, 4, cells);
        
        grid.onCellUpdated(function (args) {
            updated.push(args);
        });
        
        // Act
        grid.nextGeneration();
        
        // Assert
        stop();
        setTimeout(function() {
            ok(updated.length == 0, "No cells were updated");
            start();
        }, 500);
    });
    
    test("blinker_pattern_should_oscilate", function() {
        var grid, cells, gen1Updated = [], gen2Updated = [];
        
        // Arrange
        cells = [
           { x: 0, y: 1, status: 'alive' },
           { x: 1, y: 1, status: 'alive' },
           { x: 2, y: 1, status: 'alive' }
        ];
        
        grid = new GameOfLife.Models.Grid(4, 4, cells);
        
        // Act
        grid.onCellUpdated(function (args) {
            gen1Updated.push(args);
        });
        
        grid.nextGeneration();
        
        grid.offCellUpdated();
        grid.onCellUpdated(function (args) {
            gen2Updated.push(args);
        });

        grid.nextGeneration();
        
        // Assert
        stop();
        setTimeout(function() {
            ok(gen1Updated.length == 4, "4 cells were updated on generation 1");
            ok(gen1Updated.find(function (c) { return c.x === 0 && c.y === 1; }).status === 'dead', "Cell (0,1) is dead after gen 1" );
            ok(gen1Updated.find(function (c) { return c.x === 2 && c.y === 1; }).status === 'dead', "Cell (2,1) is dead after gen 1" );
            ok(gen1Updated.find(function (c) { return c.x === 1 && c.y === 2; }).status === 'alive', "Cell (1,2) is alive after gen 1" );
            ok(gen1Updated.find(function (c) { return c.x === 1 && c.y === 0; }).status === 'alive', "Cell (1,0) is alive after gen 1" );
            ok(gen2Updated.length == 4, "4 cells were updated on generation 2");
            ok(gen2Updated.find(function (c) { return c.x === 0 && c.y === 1; }).status === 'alive', "Cell (0,1) is alive after gen 2" );
            ok(gen2Updated.find(function (c) { return c.x === 2 && c.y === 1; }).status === 'alive', "Cell (2,1) is alive after gen 2" );
            ok(gen2Updated.find(function (c) { return c.x === 1 && c.y === 2; }).status === 'dead', "Cell (1,2) is dead after gen 2" );
            ok(gen2Updated.find(function (c) { return c.x === 1 && c.y === 0; }).status === 'dead', "Cell (1,0) is dead after gen 2" );
            start();
        }, 500);
    });
    
    test("beacon_pattern_should_oscilate", function() {
        var grid, cells, gen1Updated = [], gen2Updated = [];
        
        // Arrange
        cells = [
           { x: 0, y: 0, status: 'alive' },
           { x: 0, y: 1, status: 'alive' },
           { x: 1, y: 0, status: 'alive' },
           { x: 1, y: 1, status: 'alive' },
           { x: 2, y: 2, status: 'alive' },
           { x: 2, y: 3, status: 'alive' },
           { x: 3, y: 2, status: 'alive' },
           { x: 3, y: 3, status: 'alive' }
        ];
        
        grid = new GameOfLife.Models.Grid(4, 4, cells);
        
        // Act
        grid.onCellUpdated(function (args) {
            gen1Updated.push(args);
        });
        
        grid.nextGeneration();
        
        grid.offCellUpdated();
        grid.onCellUpdated(function (args) {
            gen2Updated.push(args);
        });

        grid.nextGeneration();
        
        // Assert
        stop();
        setTimeout(function() {
            ok(gen1Updated.length == 2, "2 cells were updated on generation 1");
            ok(gen1Updated.find(function (c) { return c.x === 1 && c.y === 1; }).status === 'dead', "Cell (1,1) is dead after gen 1" );
            ok(gen1Updated.find(function (c) { return c.x === 2 && c.y === 2; }).status === 'dead', "Cell (2,2) is dead after gen 1" );
            ok(gen2Updated.length == 2, "2 cells were updated on generation 2");
            ok(gen2Updated.find(function (c) { return c.x === 1 && c.y === 1; }).status === 'alive', "Cell (1,1) is alive after gen 2" );
            ok(gen2Updated.find(function (c) { return c.x === 2 && c.y === 2; }).status === 'alive', "Cell (2,2) is alive after gen 2" );
            start();
        }, 500);
    });

}(jQuery));

