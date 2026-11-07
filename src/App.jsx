
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import AnimalCard from "./components/AnimalCard";
import AdminLogin from "./components/AdminLogin";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import "./App.css";

function App() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdminPage = window.location.pathname === "/admin";

  useEffect(() => {
    // Don't fetch public animals on admin page
    if (isAdminPage) return;

    async function fetchAnimals() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("animals")
        .select("*")
        .eq("status", "available")
        .order("created_at", { ascending: false });
        console.log("Animals received from Supabase:", data);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setAnimals(data ?? []);
      }

      setLoading(false);
    }

    fetchAnimals();
  }, [isAdminPage]);

  // Render admin only after all hooks
  if (isAdminPage) {
    return <AdminLogin />;
  }

  const availableAnimals = animals.filter(
    (animal) => animal.status === "available"
  );

  return (
    <>
    <Navbar />
    <Hero />
 
    <main id="animals">
      <h1>🐾 Amor Sin Voz</h1>
      <p>Every animal deserves a loving home.</p>

      <h2>Animals Available for Adoption</h2>

      {loading && <p>Loading animals...</p>}

      {error && <p role="alert">Error: {error}</p>}

      {!loading && !error && availableAnimals.length === 0 && (
        <p>No animals available right now.</p>
      )}

{!loading && !error && (
  <div className="animals-grid">
    {availableAnimals.map((animal) => (
      <AnimalCard
        key={animal.id}
        id={animal.id}
        name={animal.name}
        species={animal.species}
        age={animal.age}
        description={animal.description}
        imageUrl={animal.image_url}
      />
    ))}
  </div>
)}
    </main>
    </>
  );
}

export default App;
