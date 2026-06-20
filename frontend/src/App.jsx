import { useAuth } from "./context/AuthContext";

function App() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>StockFlow</h1>
      <p>
        Auth status:{" "}
        {isAuthenticated ? `Logged in as ${user.name} (${user.role})` : "Not logged in"}
      </p>
    </div>
  );
}

export default App;