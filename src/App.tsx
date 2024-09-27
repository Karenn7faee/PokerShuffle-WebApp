import "./App.css";
import ScoreCell from "./components/ScoreCell";
import GameCardCell from "./components/GameCardCell";
import { StackCard } from "./utils/types";
import { useEffect, useState } from "react";
import { changeScore } from "./utils/scoring_utils";

/*
 ************* Global variables ********************
 */
const EMPTY = 53; //index 52 is the empty card
const BACK = 52; //index 53 is the back card
const INVALIDE = -1; //invalide index in card
const INVALIDE_CHOICE = { cardIdx: INVALIDE, boardIdx: INVALIDE };

//degguging royal straight flush
const easyRSF = [
  0, //diamonds
  9,
  10,
  11,
  12,
  13, //hearts
  22,
  23,
  24,
  25,
  26, //clubs
  35,
  36,
  37,
  38,
  39, //spades
  48,
  49,
  50,
  51,
  1, //other
  2,
  3,
  4,
  5,
];

function App() {
  /*
   ************* function variables ********************
   */
  const [hiddenBoard, setHiddenBoard] = useState(true);
  const [disabledClick, setDisabledClick] = useState(true);

  const [cards, setCards] = useState<number[]>([]); //indexes
  const [topStack, setTopStack] = useState<StackCard>({
    idx: 52,
    cardIdx: BACK,
  });
  const [topFlipped, setTopFlipped] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const [scores, setScores] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [board, setBoard] = useState<number[]>(new Array(25).fill(EMPTY)); //52 => empty card

  const [choice1, setChoice1] = useState(INVALIDE_CHOICE);
  const [choice2, setChoice2] = useState(INVALIDE_CHOICE);

  /*
   ************* aux functions ********************
   */
  //suffle cards
  const suffleCards = () => {
    setHiddenBoard(false);
    setDisabledClick(true);
    let suffledIndexes = Array.from({ length: 52 }, (_, index) => index);
    suffledIndexes.sort(() => Math.random() - 0.5); //suffle cards
    setCards(suffledIndexes.slice(0, 25)); // gets the first 25 cards
    setBoard(new Array(25).fill(EMPTY));
    setTopFlipped(false);
    setSwapping(false);
    setScores(new Array(11).fill(0));

    setChoice1(INVALIDE_CHOICE);
    setChoice2(INVALIDE_CHOICE);
  };

  //suffle cards
  const setEasyHand = () => {
    setHiddenBoard(false);
    setDisabledClick(true);
    setCards(easyRSF); // gets easy hand cards
    setBoard(new Array(25).fill(EMPTY));
    setTopFlipped(false);
    setSwapping(false);
    setScores(new Array(11).fill(0));

    setChoice1(INVALIDE_CHOICE);
    setChoice2(INVALIDE_CHOICE);
  };

  // update board with new card from stack
  const addOntoBoard = (newCardValue: number, changeIdx: number) => {
    setBoard((prevBoard) => {
      return prevBoard.map((cardValue, boardIdx) => {
        if (boardIdx == changeIdx) {
          return newCardValue;
        } else return cardValue;
      });
    });
  };

  // update board with 2 cards swapped
  const swap2CardsOnBoard = () => {
    const tmpChoice1 = choice1.cardIdx;
    const tmpChoice2 = choice2.cardIdx;
    setBoard((prevBoard) => {
      return prevBoard.map((boardValue, boardIdx) => {
        if (boardIdx == choice1.boardIdx) return tmpChoice2;
        else if (boardIdx == choice2.boardIdx) return tmpChoice1;
        else return boardValue;
      });
    });
  };

  const popTopStack = () => {
    const idxStack = topStack.idx;
    // end of stack
    if (idxStack == 24) {
      setTopStack({ idx: idxStack, cardIdx: EMPTY }); //add a back card on top of stack
      // flipped still true
    }
    // next card
    else {
      setTopStack({ idx: idxStack + 1, cardIdx: cards[idxStack + 1] });
      setTopFlipped(false);
    }
  };

  // update scores
  const resetScores = () => {
    setChoice1(INVALIDE_CHOICE);
    setChoice2(INVALIDE_CHOICE);
    // deals with scoring
    setScores(changeScore({ board: board }));
    setSwapping(false);
    setDisabledClick(false);
  };

  /*
   ************* useEffects ********************
   */

  // start a new game automatically
  useEffect(() => {
    suffleCards();
  }, []);
  //cascade effect on new game or first page load
  useEffect(() => {
    if (cards.length == 25) {
      const cardIdx = cards[0];
      setTopStack({ idx: 0, cardIdx: cardIdx }); //add a back card on top of stack
      setDisabledClick(false);
      setHiddenBoard(false);
    }
  }, [cards]);

  // handle a choice
  useEffect(() => {
    if (
      Object.is(choice1, INVALIDE_CHOICE) ||
      Object.is(choice2, INVALIDE_CHOICE)
    ) {
      setDisabledClick(false);
      return;
    }

    setDisabledClick(true);
    setSwapping(true);

    // add top stack card to board
    if (choice1.cardIdx == topStack.cardIdx && choice2.cardIdx == EMPTY) {
      addOntoBoard(choice1.cardIdx, choice2.boardIdx);
      popTopStack();
    }
    // add top stack (other option)
    else if (choice2.cardIdx == topStack.cardIdx && choice1.cardIdx == EMPTY) {
      addOntoBoard(choice2.cardIdx, choice1.boardIdx);
      popTopStack();
    }
    // swap cards on the board
    else {
      swap2CardsOnBoard();
    }
  }, [choice1, choice2]);

  useEffect(() => {
    setTimeout(() => resetScores(), 1000); // wait 1000ms = 1 sec
  }, [board]);

  /*
   ************* Handles ********************
   */

  const handleChoice = (cardIdx: number, boardIdx: number) => {
    const newSelection = { cardIdx: cardIdx, boardIdx: boardIdx };

    // flip top of the stack if top stack isn't flipped
    // select only if it's the first choice
    if (!topFlipped && boardIdx == 25) {
      setTopFlipped(true);
      if (choice1.boardIdx != INVALIDE && choice2.boardIdx == INVALIDE) return;
    }

    // add choice1 selection
    if (choice1.boardIdx == INVALIDE) setChoice1(newSelection);
    // deselection choice1
    else if (choice1.boardIdx == boardIdx) {
      if (choice2.boardIdx != INVALIDE) {
        setChoice1(choice2);
        setChoice2(INVALIDE_CHOICE);
      } else setChoice1(INVALIDE_CHOICE);
    }
    // deseltion choice 2
    else if (choice2.boardIdx == boardIdx) {
      setChoice2(INVALIDE_CHOICE);
    }
    // add choice2 selection only if the choice is valid
    // valid if not a combo of stack+!empty
    else if (
      !(
        (choice1.boardIdx == 25 && cardIdx != EMPTY) ||
        (boardIdx == 25 && choice1.cardIdx != EMPTY)
      )
    ) {
      setChoice2(newSelection);
    }
  };

  /*
   ************* return ********************
   */

  return (
    <>
      <div className="App">
        <h1>Poker Shuffle</h1>
        <button onClick={suffleCards}>New Game</button>
        <button onClick={setEasyHand}>Test Royale</button>

        <div className={hiddenBoard ? "board-grid hidden" : "board-grid"}>
          <div className="left-board">
            <div className="final-score">
              <p>Score</p>
              <ScoreCell score={scores[10]} />
            </div>

            <div className="stack-cell">
              <p>Stack</p>
              <GameCardCell
                cardIdx={topStack.cardIdx}
                boardIdx={25}
                flipped={topFlipped}
                isSelected={
                  (topStack.cardIdx == choice1.cardIdx ||
                    topStack.cardIdx == choice2.cardIdx) &&
                  topStack.cardIdx != EMPTY
                }
                handleChoice={handleChoice}
                disabled={disabledClick || topStack.cardIdx == EMPTY}
              />
            </div>
          </div>

          <div className="game-grid">
            <div className="top-scores">
              <ScoreCell score={scores[5]} />
              <ScoreCell score={scores[6]} />
              <ScoreCell score={scores[7]} />
              <ScoreCell score={scores[8]} />
              <ScoreCell score={scores[9]} />
            </div>

            <div className="total-score"></div>

            <div className="card-grid">
              {board.map((cardIdx, idx) => (
                <GameCardCell
                  key={idx}
                  cardIdx={cardIdx}
                  boardIdx={idx}
                  flipped={
                    !(
                      swapping &&
                      (idx == choice1.boardIdx || idx == choice2.boardIdx)
                    )
                  }
                  isSelected={
                    idx == choice1.boardIdx || idx == choice2.boardIdx
                  }
                  handleChoice={handleChoice}
                  disabled={disabledClick}
                />
              ))}
            </div>

            <div className="right-scores">
              <ScoreCell score={scores[0]} />
              <ScoreCell score={scores[1]} />
              <ScoreCell score={scores[2]} />
              <ScoreCell score={scores[3]} />
              <ScoreCell score={scores[4]} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
