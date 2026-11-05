
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import AnimalCard from "./components/AnimalCard";
import AdminLogin from "./components/AdminLogin";
import "./App.css";


function App() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (window.location.pathname === "/admin") {
    return <AdminLogin />;
  }

  useEffect(() => {
    async function fetchAnimals() {
      const { data, error } = await supabase
        .from("animals")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setAnimals(data);
      }

      setLoading(false);
    }
    

    fetchAnimals();
  }, []);

  return (
    <main>
      <h1>🐾 Amor Sin Voz</h1>
      <p>Every animal deserves a loving home.</p>

      <h2>Animals Available for Adoption</h2>

      {loading && <p>Loading animals...</p>}

      {error && <p>Error: {error}</p>}

      {!loading && !error && animals.length === 0 && (
        <p>No animals available right now.</p>
      )}

      {animals.map((animal) => (
        <AnimalCard
          key={animal.id}
          name={animal.name}
          species={animal.species}
          age={animal.age}
          description={animal.description}
        />
      ))}
    </main>
  );
}

export default App;
