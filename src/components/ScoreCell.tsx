interface Props {
  score: number;
}

function ScoreCell({ score }: Props) {
  return <div className="score">{score}</div>;
}

export default ScoreCell;
