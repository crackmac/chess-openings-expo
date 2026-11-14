# Chess Openings Trainer

A mobile trainer where chess players build opening repertoire memory by playing main lines and variations against a theory-following opponent.

## Language

### Repertoire & Practice

**Repertoire Side**:
The color (`White` or `Black`) an opening belongs to and that the player trains from by default.
_Avoid_: User color, player side

**Study Walkthrough**:
Guided, untimed exploration of an opening's main line and variations on an interactive board with forward/backward move controls before testing memory.
_Avoid_: Preview mode, sandbox

**Practice Drill**:
An active recall session where the player plays an opening's theory moves from memory against the opponent, scored on unassisted accuracy.
_Avoid_: Game (reserved for full chess games outside opening theory)

**Drill Summary**:
The post-drill bottom sheet anchored below the board displaying outcome, XP/streak earned, inline `Recall Rating` selection, and next-drill actions.
_Avoid_: Rating modal, completion popup

**Skill Tier**:
The learning complexity classification of an opening (`Beginner`, `Intermediate`, `Advanced`, or `Traps`).
_Avoid_: Opening difficulty, level (reserved for player XP progression)

**Recall Rating**:
The player's post-session self-assessment (`Hard`, `Good`, or `Easy`) of how effortlessly they remembered the opening moves, used to weight future practice selection.
_Avoid_: Difficulty rating, opening difficulty

### Visual Appearance

**App Theme**:
The color palette, typography, and surface styling of the application chrome, cards, modals, and navigation outside the chess board.
_Avoid_: Board theme, skin

**Board Theme**:
The light/dark square palette, coordinate styling, and move-highlight colors of the 64-square chess board.
_Avoid_: App theme

**Piece Set**:
A complete visual family of the six chess piece designs (`Pawn`, `Knight`, `Bishop`, `Rook`, `Queen`, `King`) in both White and Black.
_Avoid_: Piece theme, piece font
