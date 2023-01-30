var board = null
	var game = new Chess()
	var $status = $('#status')
	var $fen = $('#fen')
	var $pgn = $('#pgn')
	var whiteSquareGrey = '#a9a9a9'
	var blackSquareGrey = '#696969'
	var moveColor = 'White'
	var invMoveColor = 'Black'
	var status = ''

	function removeGreySquares () {
	  $('#myBoard .square-55d63').css('background', '')
	}

	function greySquare (square) {
	  var $square = $('#myBoard .square-' + square)

	  var background = whiteSquareGrey
	  if ($square.hasClass('black-3c85d')) {
	    background = blackSquareGrey
	  }

	  $square.css('background', background)
	}

	function onDragStart (source, piece, position, orientation) {
	  // do not pick up pieces if the game is over
	  if (game.game_over()) return false

	  // only pick up pieces for White
	  if (piece.search(/^b/) !== -1) return false
	}

	function makeRandomMove () {

	  var possibleMoves = game.moves()
	  
	  // game over
	  if (possibleMoves.length === 0) return

	  var randomIdx = Math.floor(Math.random() * possibleMoves.length)
	  game.move(possibleMoves[randomIdx])
	  updateStatus()
	  board.position(game.fen())
	  var audio = new Audio('aud/move.wav');
	  audio.play();
      moveColor = 'Black'
	}

	function onDrop (source, target) {
	  // see if the move is legal
	  var move = game.move({
	    from: source,
	    to: target,
	    promotion: 'q' // NOTE: always promote to a queen for example simplicity
	  })

	  // illegal move
	  if (move === null) return 'snapback'
	  updateStatus()
	  // make random legal move for black
	  moveColor = 'Black'

	  var audio = new Audio('aud/move.wav');
	  audio.play();

	  window.setTimeout(makeRandomMove, 600)
	}

	function onMouseoverSquare (square, piece) {
	  // get list of possible moves for this square
	  var moves = game.moves({
	    square: square,
	    verbose: true
	  })

	  // exit if there are no moves available for this square
	  if (moves.length === 0) return

	  // highlight the square they moused over
	  greySquare(square)

	  // highlight the possible squares for this piece
	  for (var i = 0; i < moves.length; i++) {
	    greySquare(moves[i].to)
	  }
	}
	// update the board position after the piece snap
	// for castling, en passant, pawn promotion
	function onSnapEnd () {
	  board.position(game.fen())
	}

	function updateStatus () {

	  moveColor = 'White'
	  if (game.turn() === 'b') {
	    moveColor = 'Black'
	  }

	  // checkmate?
	  if (game.in_checkmate()) {
	    status = 'Game over, ' + moveColor + ' is in checkmate.'
	  }

	  // draw?
	  else if (game.in_draw()) {
	    status = 'Game over, drawn position'
	  }

	  // game still on
	  else {
	    status = moveColor + ' to move'

	    // check?
	    if (game.in_check()) {
	      status += ', ' + moveColor + ' is in check'
	    }
	  }

	  $status.html(status)
	  $fen.html(game.fen())
	  $pgn.html(game.pgn())
	}

	function onMouseoutSquare (square, piece) {
	  removeGreySquares()
	}

	function mcResign () {
		invMoveColor = 'Black'
		if (game.turn() === 'b') {
	    	invMoveColor = 'White'
		}

		if (!game.in_checkmate())
			status = 'Game over, ' + moveColor + ' resigned.'
			$status.html(status)
			game.clear()
	}

	var config = {
	  draggable: true,
	  position: 'start',
	  pieceTheme: 'img/chesspieces/maestro/{piece}.svg',
	  onDragStart: onDragStart,
	  onDrop: onDrop,
	  onMouseoutSquare: onMouseoutSquare,
  	  onMouseoverSquare: onMouseoverSquare,
	  onSnapEnd: onSnapEnd

	}
	board = Chessboard('myBoard', config)

	updateStatus()

