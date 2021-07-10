import { Stats } from "node:fs";
import React, { ChangeEvent } from "react";
import { useState, useContext, useEffect } from "react";
import "./App.css";

interface IBoardState {
  board: string[];
  highlight: number[];
  turn: boolean;
  winner: string;
  moveNumber: number;
}
const AppContext = React.createContext<{
  state: IBoardState;
  clickHandler: (id: number) => void;
  setState: React.Dispatch<React.SetStateAction<IBoardState>>;
}>({});

export const App: React.FC<null> = () => {
  const [state, setState] = useState<IBoardState>({
    board: new Array<string>(9).fill(""),
    highlight: [],
    turn: true,
    winner: "",
    moveNumber: -1,
  });
  const [history, setHistory] = useState<IBoardState[]>([]);

  const moveHandler = (id: number) => {
    //if game has ended, a click re-starts the game
    if (state.winner || state.board.every((cell) => cell)) {
      const newBoard = new Array<string>(9).fill("");
      newBoard[id] = "X";
      setHistory([
        {
          board: newBoard,
          turn: false,
          highlight: [id],
          winner: "",
          moveNumber: 0,
        },
      ]);
      setState({
        board: newBoard,
        turn: false,
        highlight: [id],
        winner: "",
        moveNumber: 0,
      });
      return;
    }
    //if clicked on taken field

    if (state.board[id]) return;
    let newBoard = [...state.board];
    newBoard[id] = state.turn ? "X" : "O";
    let win = calculateWinner(newBoard);
    let hightlight = win ? win.line : [id];
    let winner = win ? win.winner : "";
    let newHistory = history.slice(0, state.moveNumber + 1);
    newHistory = newHistory.concat({
      board: newBoard,
      turn: !state.turn,
      highlight: hightlight,
      winner: winner,
      moveNumber: state.moveNumber + 1,
    });
    setHistory(newHistory);
    setState({
      board: newBoard,
      turn: !state.turn,
      highlight: hightlight,
      winner: winner,
      moveNumber: state.moveNumber + 1,
    });
  };
  function calculateWinner(board: string[]) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: [a, b, c] };
      }
    }
    return undefined;
  }

  return (
    <AppContext.Provider
      value={{
        state: state,
        clickHandler: moveHandler,
        setState: setState,
      }}
    >
      <div className="game-container">
        <Status turn={state.turn} winner={state.winner} />
        <Board state={state} gameBoard={true} />
      </div>
      <History history={history} />
    </AppContext.Provider>
  );
};

const Status: React.FC<{ turn: boolean; winner?: string }> = ({
  turn,
  winner,
}) => {
  return (
    <>
      {winner ? (
        <h2 className="status-h">Winner : {winner}</h2>
      ) : (
        <h2 className="status-h">Next turn: {turn ? "X" : "O"}</h2>
      )}
    </>
  );
};

const Board: React.FC<{
  state: IBoardState;
  gameBoard: boolean;
  setState?: React.Dispatch<React.SetStateAction<IBoardState>>;
}> = ({ state, gameBoard, setState }) => {
  const { clickHandler } = useContext(AppContext);
  return (
    <div
      className={gameBoard ? "game-board" : "history-board"}
      onClick={
        !gameBoard
          ? () => {
              setState(state);
            }
          : () => {}
      }
    >
      <div className="game-row">
        <Square
          id={0}
          value={state.board[0]}
          highlight={state.highlight.includes(0)}
        />
        <Square
          id={1}
          value={state.board[1]}
          highlight={state.highlight.includes(1)}
        />
        <Square
          id={2}
          value={state.board[2]}
          highlight={state.highlight.includes(2)}
        />
      </div>

      <div className="game-row">
        <Square
          id={3}
          value={state.board[3]}
          highlight={state.highlight.includes(3)}
        />
        <Square
          id={4}
          value={state.board[4]}
          highlight={state.highlight.includes(4)}
        />
        <Square
          id={5}
          value={state.board[5]}
          highlight={state.highlight.includes(5)}
        />
      </div>

      <div className="game-row">
        <Square
          id={6}
          value={state.board[6]}
          highlight={state.highlight.includes(6)}
        />
        <Square
          id={7}
          value={state.board[7]}
          highlight={state.highlight.includes(7)}
        />
        <Square
          id={8}
          value={state.board[8]}
          highlight={state.highlight.includes(8)}
        />
      </div>
    </div>
  );
};

interface SquareProps {
  id: number;
  value: string | null;
  highlight: boolean;
}

const Square: React.FC<SquareProps> = ({ id, value, highlight }) => {
  useEffect(() => {
    setTimeout(() => {
      highlight = false;
    }, 1000);
  });
  const { clickHandler } = useContext(AppContext);
  return (
    <button
      className="cell"
      onClick={() => {
        clickHandler(id);
      }}
      style={highlight ? { color: "red" } : {}}
    >
      {value}
    </button>
  );
};

const History: React.FC<{ history: IBoardState[] }> = ({ history }) => {
  const { setState } = useContext(AppContext);
  return (
    <>
      <h2 className="history-label">game history:</h2>
      <div className="history-container">
        {history.map((board, i) => (
          <Board
            state={history[i]}
            gameBoard={false}
            setState={() => {
              setState(history[i]);
            }}
          />
        ))}
      </div>
    </>
  );
};
