export function JutsuOverlay() {
  return (
    <div style={videoOverlayStyle}>
      <div id="jutsu-player"></div>
    </div>
  );
}

const videoOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};
