export default function Page() {
  return (
    <div>
      <h1>ITELSA Go</h1>
      <p style={{ color: "#A9ADB1", marginTop: 8 }}>
        Plataforma simple para publicar y explorar inmuebles.
      </p>
      <div style={{ marginTop: 16 }}>
        <a className="btn" href="/inmuebles">Explorar inmuebles</a>
      </div>
    </div>
  );
}
