/**
 * Interactive Chess Board Component
 */

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from "react-native";
import Svg, { G } from "react-native-svg";
import { Square } from "./Square";
import { Piece } from "./Piece";
import { ChessEngine } from "../../services/chess/chessEngine";
import { Move } from "../../types";

interface ChessBoardProps {
  engine: ChessEngine;
  onMove?: (move: Move) => void;
  flipped?: boolean;
  showValidMoves?: boolean;
  selectedSquare?: string | null;
  onSquareSelect?: (square: string | null) => void;
  lastMove?: Move | null;
}

const BOARD_SIZE = Math.min(Dimensions.get("window").width - 40, 400);
const SQUARE_SIZE = BOARD_SIZE / 8;

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

export const ChessBoard: React.FC<ChessBoardProps> = ({
  engine,
  onMove,
  flipped = false,
  showValidMoves = true,
  selectedSquare,
  onSquareSelect,
  lastMove,
}) => {
  const board = engine.getBoard();
  const validMoves = selectedSquare ? engine.getValidMoves(selectedSquare) : [];

  const getSquareCoordinates = (square: string) => {
    const file = FILES.indexOf(square[0]);
    const rank = RANKS.indexOf(square[1]);

    if (flipped) {
      return {
        x: (7 - file) * SQUARE_SIZE,
        y: (7 - rank) * SQUARE_SIZE,
      };
    }

    return {
      x: file * SQUARE_SIZE,
      y: rank * SQUARE_SIZE,
    };
  };

  const renderSquares = () => {
    const squares = [];

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const displayRank = flipped ? 7 - rank : rank;
        const displayFile = flipped ? 7 - file : file;
        const square = FILES[displayFile] + RANKS[displayRank];
        const isLight = (rank + file) % 2 === 0;
        const isHighlighted =
          showValidMoves && validMoves.some((move) => move.to === square);
        const isLastMoveSquare = Boolean(
          lastMove && (lastMove.from === square || lastMove.to === square)
        );
        const isSelected = selectedSquare === square;

        const coords = getSquareCoordinates(square);

        squares.push(
          <Square
            key={square}
            x={coords.x}
            y={coords.y}
            size={SQUARE_SIZE}
            isLight={isLight}
            isHighlighted={isHighlighted}
            isLastMove={isLastMoveSquare}
            isSelected={isSelected}
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

      const coords = getSquareCoordinates(square);

      return (
        <Piece
          key={square}
          x={coords.x}
          y={coords.y}
          size={SQUARE_SIZE}
          type={piece.type}
          color={piece.color}
        />
      );
    });
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
                position: "absolute",
                left: coords.x,
                top: coords.y,
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
              },
            ]}
            onPress={() => onSquareSelect?.(square)}
          />
        );
      }
    }

    return touchAreas;
  };

  return (
    <View style={styles.container}>
      <View style={styles.boardWrapper}>
        <Svg width={BOARD_SIZE} height={BOARD_SIZE} style={styles.board}>
          {renderSquares()}
          {renderPieces()}
        </Svg>
        <View style={styles.touchOverlay}>{renderTouchOverlay()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  boardWrapper: {
    position: "relative",
  },
  board: {
    backgroundColor: "#8b4513",
    borderRadius: 4,
  },
  touchOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: BOARD_SIZE,
    height: BOARD_SIZE,
  },
  touchArea: {
    backgroundColor: "transparent",
  },
});
