//config score values
const SCORE_RSF = 100;
const SCORE_STRAIGHT_FLUSH = 75;
const SCORE_4_OF_A_KIND = 50;
const SCORE_FULLHOUSE = 25;
const SCORE_STRAIGHT = 20;
const SCORE_FLUSH = 15;
const SCORE_3_OF_A_KIND = 10;
const SCORE_2PAIRS = 5;
const SCORE_1PAIR = 2;

// royale straight flush
const RSF = [
  [0, 9, 10, 11, 12], //diamonds
  [13, 22, 23, 24, 25], //hearts
  [26, 35, 36, 37, 38], //clubs
  [39, 48, 49, 50, 51], //spades
];

const BOARD_ROWS = 5;
const BOARD_COLS = 5;

/*
 ************* aux functions ********************
 */

// transform board to table of its lines (rows and columns)
const getBoardLines = (board: number[]) => {
  let boardTolines: number[][] = [];

  for (let row = 0; row < BOARD_ROWS; row++) {
    let line: number[] = [];
    for (let col = 0; col < BOARD_COLS; col++) {
      if (board[row * BOARD_COLS + col] < 52)
        line.push(board[row * BOARD_COLS + col]);
    }
    boardTolines.push(line.sort((a, b) => a - b));
  }
  for (let col = 0; col < BOARD_COLS; col++) {
    let line: number[] = [];
    for (let row = 0; row < BOARD_ROWS; row++) {
      if (board[row * BOARD_COLS + col] < 52)
        line.push(board[row * BOARD_COLS + col]);
    }
    boardTolines.push(line.sort((a, b) => a - b));
  }
  return boardTolines;
};

// transform board to table of its lines (rows and columns)
const getSuiteHistogram = (line: number[]) => {
  // counts occurences of a card being of that suite
  // idx [0]:diamonds [1]:hearts [2]:clubs [3]:spades
  const numSuites = 4;
  let suitesCount: number[] = new Array<number>(numSuites).fill(0);
  line.forEach((cardIdx) => {
    suitesCount[Math.floor(cardIdx / 13)]++;
  });

  const maxCount = 5; // 5 cards per line
  //idx => number of occurences
  //histogram[5] = 1 => observed once : 5 of the same suite
  //histogram[2] = 2 => observed twice: 2 of the same suite
  //histogram[0] = 3 => observed trice: none of a suite
  let histogram: number[] = new Array<number>(maxCount + 1).fill(0);
  suitesCount.forEach((count) => {
    histogram[count]++;
  });
  return histogram;
};

const getValueHistogram = (line: number[]) => {
  // counts occurences of a card being of that suite
  // order [0]:A [1]:2 [2]:3 ... [9]:10 [10]:J [11]:Q [12]:K
  const numValues = 13;
  let valuesCount: number[] = new Array<number>(numValues).fill(0);
  line.forEach((cardIdx) => {
    valuesCount[cardIdx % 13]++;
  });

  const maxCount = 4; // 4 cards per suite
  //idx => number of occurences
  //histogram[4] = 1 => observed once : 4 of a kind
  //histogram[2] = 2 => observed twice: 2 pairs
  //histogram[1] = 5 => observed 5x   : singles => all cards have different values
  let histogram: number[] = new Array<number>(maxCount + 1).fill(0);
  valuesCount.forEach((count) => {
    histogram[count]++;
  });
  return histogram;
};

const getLineScore = (line: number[]) => {
  const suiteHistogram = getSuiteHistogram(line);
  const valueHistogram = getValueHistogram(line);

  const isFlush = suiteHistogram[5] == 1 ? true : false;
  let isStraight = false;
  if (valueHistogram[1] == 5) isStraight = testStraight(line);

  if (isStraight && isFlush) {
    if (testRSF(line)) return SCORE_RSF;
    return SCORE_STRAIGHT_FLUSH;
  }

  if (isFlush) return SCORE_FLUSH;
  if (isStraight) return SCORE_STRAIGHT;
  if (valueHistogram[4] == 1) return SCORE_4_OF_A_KIND;
  if (valueHistogram[3] == 1) {
    if (valueHistogram[2] == 1) return SCORE_FULLHOUSE;
    return SCORE_3_OF_A_KIND;
  }
  if (valueHistogram[2] == 2) return SCORE_2PAIRS;
  if (valueHistogram[2] == 1) return SCORE_1PAIR;

  return 0;
};

const testStraight = (line: number[]) => {
  //order [0]:A [1]:2 [2]:3 ... [9]:10 [10]:J [11]:Q [12]:K
  const idxAs = 0;
  const idx2 = 1;
  const idx10 = 9;

  line = line.map((idx) => idx % 13);
  line = line.sort((a, b) => a - b);

  let idx = 0;
  while (idx < 4) {
    // As-2-3-4-5 or As-10-J-Q-K    is acceptable as a straight
    if (
      line[idx] == idxAs &&
      (line[idx + 1] == idx2 || line[idx + 1] == idx10)
    ) {
      idx++;
      continue;
    }

    // next value isn't consecutive
    if (line[idx] + 1 != line[idx + 1]) return false;
    idx++;
  }
  return true;
};

const testRSF = (line: number[]) => {
  console.log("testing RSF with line");
  console.log(line);
  let test = false;
  RSF.forEach((rsfLine) => {
    if (compareArrays(line, rsfLine)) test = true;
  });

  return test;
};

const compareArrays = (a: number[], b: number[]) => {
  return (
    a.length === b.length && a.every((element, index) => element === b[index])
  );
};

/*
 ************* Main function ********************
 */

interface Props {
  board: number[]; //size 25
}

export const changeScore = ({ board }: Props) => {
  let scores = new Array(11).fill(0);

  const boardTolines: number[][] = getBoardLines(board);

  boardTolines.forEach((line: number[], idx) => {
    const score = getLineScore(line);
    scores[idx] = score;
  });

  scores[10] = scores.reduce((sum, current) => sum + current, 0);

  return scores;
};
