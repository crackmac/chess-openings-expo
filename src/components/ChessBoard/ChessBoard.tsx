/**
 * Interactive Chess Board Component
 */

import React from 'react';
import { View, StyleSheet, Pressable, Text, useWindowDimensions } from 'react-native';
import Svg from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Square } from './Square';
import { Piece } from './Piece';
import { ChessEngine } from '../../services/chess/chessEngine';
import { Move } from '../../types';
import { useAppTheme } from '../../theme';

interface ChessBoardProps {
  engine: ChessEngine;
  onMove?: (move: Move) => void;
  flipped?: boolean;
  showValidMoves?: boolean;
  selectedSquare?: string | null;
  onSquareSelect?: (square: string | null) => void;
  lastMove?: Move | null;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface DragState {
  square: string;
  x: number;
  y: number;
}

interface AnimatedMovePiece {
  type: string;
  color: 'white' | 'black';
  toSquare: string;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  engine,
  onMove,
  flipped = false,
  showValidMoves = true,
  selectedSquare,
  onSquareSelect,
  lastMove,
}) => {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const boardSize = width - 24;
  const squareSize = boardSize / 8;

  const board = engine.getBoard();
  const validMoves = selectedSquare ? engine.getValidMoves(selectedSquare) : [];
  const [dragState, setDragState] = React.useState<DragState | null>(null);
  const [hoverSquare, setHoverSquare] = React.useState<string | null>(null);
  const [animatedMovePiece, setAnimatedMovePiece] = React.useState<AnimatedMovePiece | null>(null);
  const skipNextMoveAnimationRef = React.useRef(false);
  const animatedMoveX = useSharedValue(0);
  const animatedMoveY = useSharedValue(0);

  const validMovesBySquare = React.useMemo(() => {
    const map = new Map<string, 'dot' | 'capture'>();
    validMoves.forEach((move) => {
      const isCapture = move.san.includes('x');
      map.set(move.to, isCapture ? 'capture' : 'dot');
    });
    return map;
  }, [validMoves]);

  const checkedKingSquare = React.useMemo(() => {
    if (!engine.isCheck()) return null;
    const checkedColor = engine.getTurn();
    const king = board.find((entry) => entry.piece?.type === 'k' && entry.piece?.color === checkedColor);
    return king?.square ?? null;
  }, [engine, board]);

  const getSquareCoordinates = React.useCallback((square: string) => {
    const file = FILES.indexOf(square[0]);
    const rank = RANKS.indexOf(square[1]);

    if (flipped) {
      return {
        x: (7 - file) * squareSize,
        y: (7 - rank) * squareSize,
      };
    }

    return {
      x: file * squareSize,
      y: rank * squareSize,
    };
  }, [flipped, squareSize]);

  const getSquareFromPoint = React.useCallback((x: number, y: number): string | null => {
    if (x < 0 || y < 0 || x >= boardSize || y >= boardSize) {
      return null;
    }

    const fileIndex = Math.floor(x / squareSize);
    const rankIndex = Math.floor(y / squareSize);

    if (fileIndex < 0 || fileIndex > 7 || rankIndex < 0 || rankIndex > 7) {
      return null;
    }

    const boardFile = flipped ? 7 - fileIndex : fileIndex;
    const boardRank = flipped ? 7 - rankIndex : rankIndex;

    return `${FILES[boardFile]}${RANKS[boardRank]}`;
  }, [boardSize, squareSize, flipped]);

  const getContrastLabelColor = (isLight: boolean) =>
    isLight ? 'rgba(29, 34, 42, 0.7)' : 'rgba(250, 250, 250, 0.74)';

  const clearAnimatedMove = React.useCallback(() => {
    setAnimatedMovePiece(null);
  }, []);

  React.useEffect(() => {
    if (!lastMove) {
      return;
    }

    if (skipNextMoveAnimationRef.current) {
      skipNextMoveAnimationRef.current = false;
      return;
    }

    const piece = engine.getPiece(lastMove.to);
    if (!piece) {
      return;
    }

    const fromCoords = getSquareCoordinates(lastMove.from);
    const toCoords = getSquareCoordinates(lastMove.to);

    setAnimatedMovePiece({
      type: piece.type,
      color: piece.color,
      toSquare: lastMove.to,
    });

    animatedMoveX.value = fromCoords.x;
    animatedMoveY.value = fromCoords.y;

    animatedMoveX.value = withTiming(toCoords.x, {
      duration: 170,
      easing: Easing.out(Easing.cubic),
    });

    animatedMoveY.value = withTiming(
      toCoords.y,
      {
        duration: 170,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(clearAnimatedMove)();
        }
      }
    );
  }, [
    lastMove,
    engine,
    getSquareCoordinates,
    animatedMoveX,
    animatedMoveY,
    clearAnimatedMove,
  ]);

  const animatedMoveStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: animatedMoveX.value + 6 },
      { translateY: animatedMoveY.value + 6 },
    ],
  }));

  const handleTap = React.useCallback((x: number, y: number) => {
    const square = getSquareFromPoint(x, y);
    if (square) {
      onSquareSelect?.(square);
    }
  }, [getSquareFromPoint, onSquareSelect]);

  const handleDragStart = React.useCallback((x: number, y: number) => {
    const square = getSquareFromPoint(x, y);
    if (!square) {
      return;
    }

    const piece = engine.getPiece(square);
    if (!piece) {
      return;
    }

    onSquareSelect?.(square);
    setDragState({ square, x: x - squareSize / 2, y: y - squareSize / 2 });
    setHoverSquare(square);
  }, [engine, getSquareFromPoint, onSquareSelect, squareSize]);

  const handleDragUpdate = React.useCallback((x: number, y: number) => {
    setDragState((prev) => {
      if (!prev) {
        return null;
      }

      return {
        ...prev,
        x: x - squareSize / 2,
        y: y - squareSize / 2,
      };
    });

    const square = getSquareFromPoint(x, y);
    setHoverSquare(square);
  }, [getSquareFromPoint, squareSize]);

  const handleDragEnd = React.useCallback((x: number, y: number) => {
    if (!dragState) {
      return;
    }

    const targetSquare = getSquareFromPoint(x, y);

    if (targetSquare) {
      skipNextMoveAnimationRef.current = true;
      onSquareSelect?.(targetSquare);
    } else {
      onSquareSelect?.(null);
    }

    setDragState(null);
    setHoverSquare(null);
  }, [dragState, getSquareFromPoint, onSquareSelect]);

  const tapGesture = React.useMemo(
    () => Gesture.Tap().onEnd((event) => runOnJS(handleTap)(event.x, event.y)),
    [handleTap]
  );

  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .minDistance(8)
        .onStart((event) => {
          runOnJS(handleDragStart)(event.x, event.y);
        })
        .onUpdate((event) => {
          runOnJS(handleDragUpdate)(event.x, event.y);
        })
        .onEnd((event) => {
          runOnJS(handleDragEnd)(event.x, event.y);
        })
        .onFinalize(() => {
          runOnJS(setHoverSquare)(null);
        }),
    [handleDragStart, handleDragUpdate, handleDragEnd]
  );

  const composedGesture = React.useMemo(
    () => Gesture.Simultaneous(tapGesture, panGesture),
    [tapGesture, panGesture]
  );

  const renderSquares = () => {
    const squares = [];

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const displayRank = flipped ? 7 - rank : rank;
        const displayFile = flipped ? 7 - file : file;
        const square = FILES[displayFile] + RANKS[displayRank];
        const isLight = (rank + file) % 2 === 0;
        const highlightType = showValidMoves ? validMovesBySquare.get(square) ?? null : null;
        const isLastMoveSquare = Boolean(lastMove && (lastMove.from === square || lastMove.to === square));
        const isSelected = selectedSquare === square || hoverSquare === square;
        const isCheckSquare = checkedKingSquare === square;

        const coords = getSquareCoordinates(square);

        squares.push(
          <Square
            key={square}
            x={coords.x}
            y={coords.y}
            size={squareSize}
            isLight={isLight}
            highlightType={highlightType}
            isLastMove={isLastMoveSquare}
            isSelected={isSelected}
            isCheckSquare={isCheckSquare}
          />
        );
      }
    }

    return squares;
  };

  const renderPieces = () => {
    return board.map(({ square, piece }) => {
      if (!piece) {
        return null;
      }

      if (dragState?.square === square || animatedMovePiece?.toSquare === square) {
        return null;
      }

      const coords = getSquareCoordinates(square);

      return (
        <Piece
          key={square}
          x={coords.x}
          y={coords.y}
          size={squareSize}
          type={piece.type}
          color={piece.color}
        />
      );
    });
  };

  const renderDraggedPiece = () => {
    if (!dragState) {
      return null;
    }

    const piece = engine.getPiece(dragState.square);
    if (!piece) {
      return null;
    }

    const dragSize = squareSize * 1.15;
    const liftOffset = (dragSize - squareSize) / 2;

    return (
      <Svg
        width={boardSize}
        height={boardSize}
        style={styles.dragOverlay}
        pointerEvents="none"
      >
        <Piece
          x={dragState.x - liftOffset}
          y={dragState.y - liftOffset}
          size={dragSize}
          type={piece.type}
          color={piece.color}
        />
      </Svg>
    );
  };

  const renderAnimatedMovePiece = () => {
    if (!animatedMovePiece) {
      return null;
    }

    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.animatedMoveOverlay, { width: squareSize, height: squareSize }, animatedMoveStyle]}
      >
        <Svg width={squareSize} height={squareSize}>
          <Piece
            x={0}
            y={0}
            size={squareSize}
            type={animatedMovePiece.type}
            color={animatedMovePiece.color}
          />
        </Svg>
      </Animated.View>
    );
  };

  const renderTouchOverlay = () => {
    const touchAreas = [];

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const displayRank = flipped ? 7 - rank : rank;
        const displayFile = flipped ? 7 - file : file;
        const square = FILES[displayFile] + RANKS[displayRank];
        const coords = getSquareCoordinates(square);

        touchAreas.push(
          <Pressable
            key={`touch-${square}`}
            style={[
              styles.touchArea,
              {
                position: 'absolute',
                left: coords.x,
                top: coords.y,
                width: squareSize,
                height: squareSize,
              },
            ]}
            onPress={() => onSquareSelect?.(square)}
          />
        );
      }
    }

    return touchAreas;
  };

  const renderRankLabels = () => {
    const labels = [];

    for (let rank = 0; rank < 8; rank++) {
      const displayRank = flipped ? 7 - rank : rank;
      const rankNumber = RANKS[displayRank];
      const y = rank * squareSize;
      const isLight = (rank + 0) % 2 === 0;

      labels.push(
        <Text
          key={`rank-${rank}`}
          style={[
            styles.rankLabel,
            {
              color: getContrastLabelColor(isLight),
              left: 4,
              top: y + 2,
              fontSize: Math.max(10, squareSize * 0.14),
            },
          ]}
        >
          {rankNumber}
        </Text>
      );
    }

    return labels;
  };

  const renderFileLabels = () => {
    const labels = [];

    for (let file = 0; file < 8; file++) {
      const displayFile = flipped ? 7 - file : file;
      const fileLetter = FILES[displayFile];
      const x = file * squareSize;
      const isLight = (7 + file) % 2 === 0;

      labels.push(
        <Text
          key={`file-bottom-${file}`}
          style={[
            styles.fileLabel,
            {
              color: getContrastLabelColor(isLight),
              left: x + squareSize - Math.max(12, squareSize * 0.22),
              bottom: 2,
              fontSize: Math.max(10, squareSize * 0.14),
            },
          ]}
        >
          {fileLetter}
        </Text>
      );
    }

    return labels;
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <View
          style={[
            styles.boardWrapper,
            {
              borderColor: theme.colors.borderSubtle,
              backgroundColor: theme.colors.bgElevated,
              borderRadius: theme.radius.lg,
              padding: 6,
            },
          ]}
        >
          <Svg width={boardSize} height={boardSize} style={styles.board}>
            {renderSquares()}
            {renderPieces()}
          </Svg>
          {renderAnimatedMovePiece()}
          {renderDraggedPiece()}
          <View style={[styles.touchOverlay, { width: boardSize, height: boardSize }]}>{renderTouchOverlay()}</View>
          <View style={[styles.labelsContainer, { width: boardSize, height: boardSize }]}>
            {renderRankLabels()}
            {renderFileLabels()}
          </View>
        </View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardWrapper: {
    position: 'relative',
    borderWidth: 1,
  },
  board: {
    borderRadius: 8,
  },
  touchOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  touchArea: {
    backgroundColor: 'transparent',
  },
  labelsContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
    pointerEvents: 'none',
  },
  dragOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  animatedMoveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  rankLabel: {
    position: 'absolute',
    fontWeight: '700',
  },
  fileLabel: {
    position: 'absolute',
    fontWeight: '700',
  },
});
