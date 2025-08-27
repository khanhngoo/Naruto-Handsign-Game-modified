interface BattleLogProps {
  logs: string[];
}

export function BattleLog({ logs }: BattleLogProps) {
  return (
    <div>
      <h3>Battle Log</h3>
      <div style={{ height: '200px', overflow: 'auto', border: '1px solid black', padding: '10px' }}>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}
