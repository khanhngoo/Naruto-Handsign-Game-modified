interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div style={startScreenStyle}>
      <h2>Ready to Fight?</h2>
      <button onClick={onStart} style={startButtonStyle}>
        Start Game
      </button>
    </div>
  );
}

const startScreenStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '100px',
};

const startButtonStyle: React.CSSProperties = {
  fontSize: '2em',
  padding: '20px 40px',
  cursor: 'pointer',
};
