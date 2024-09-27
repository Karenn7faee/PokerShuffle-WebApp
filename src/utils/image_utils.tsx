import { Card, CardSuite, CardValue } from "./types";

// config image choice
const path = "/cards/";
const cardStart = "card";
const extension = ".png";
const empty = "empty_";
const back = "back_";

export const getAllGameCards = () => {
  let cards: Card[] = [];
  for (let suite of Object.values(CardSuite)) {
    for (let value of Object.values(CardValue)) {
      const card: Card = {
        suite: suite,
        value: value,
        src: path + cardStart + suite + value + extension,
      };
      cards.push(card);
    }
  }

  return cards;
};

interface Props {
  cardColorChoice: string;
}

export const getBackCards = ({ cardColorChoice = "blue" }: Props) => {
  let backCards: Card[] = [];

  backCards.push({
    value: "back",
    suite: "-",
    src: path + back + cardColorChoice + extension,
  });

  backCards.push({
    value: "empty",
    suite: "-",
    src: path + empty + cardColorChoice + extension,
  });

  backCards.push({
    value: "empty",
    suite: "-",
    src: path + empty + "red" + extension,
  });
  return backCards;
};
