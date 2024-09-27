import "./GameCardCell.css";
import { getAllGameCards, getBackCards } from "../utils/image_utils";
import { Card } from "../utils/types";

interface Props {
  cardIdx: number;
  boardIdx: number;
  flipped: boolean;
  disabled: boolean;
  isSelected: boolean;
  handleChoice: (cardIdx: number, boardIdx: number) => void;
}

/**
 * Contains all 52 playable cards
 * Card Value and Card Suites order follow the enum type declared in types.tsx
 *  Card Value order A,2,3...,10,J,Q,K
 *  and card suites order Diamonds(D), Hearts(H), Clubs(C), Spades(S)
 *  => A-D, 2-D, ..., K-D, A-H, 2-H, ..., K-S
 * 52 playable cards : index 0-51
 */
const all52Cards: Card[] = getAllGameCards(); // index : 0-51
const backCards: Card[] = getBackCards({ cardColorChoice: "blue" }); //[0]=back, [1]=empty
const cardsFromIdx = [...all52Cards, ...backCards];

const BACK = 52; //index 53 is the back card

function GameCardCell({
  cardIdx,
  boardIdx,
  flipped,
  disabled,
  isSelected,
  handleChoice,
}: Props) {
  const handleClick = () => {
    if (!disabled) {
      handleChoice(cardIdx, boardIdx);
    }
  };

  return (
    <div className="card">
      <div className={flipped ? "flipped" : ""}>
        <img
          className={isSelected ? "front selected" : "front unselected"}
          src={cardsFromIdx[cardIdx].src}
          alt={cardsFromIdx[cardIdx].value + " " + cardsFromIdx[cardIdx].suite}
          onClick={handleClick}
        />
        <img
          className={
            isSelected ? "back hidden selected" : "back hidden unselected"
          }
          src={cardsFromIdx[BACK].src}
          alt={cardsFromIdx[BACK].value + " card"}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}

export default GameCardCell;
