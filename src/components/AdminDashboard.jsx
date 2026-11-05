
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function AdminDashboard({ admin, onLogout }) {
  const [animals, setAnimals] = useState([]);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("available");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function fetchAnimals() {
    const { data, error } = await supabase
      .from("animals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      return;
    }

    setAnimals(data ?? []);
  }

  useEffect(() => {
    fetchAnimals();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase
      .from("animals")
      .insert({
        name: name.trim(),
        species,
        age: age.trim(),
        description: description.trim(),
        status
      });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Animal added successfully!");

      setName("");
      setSpecies("Dog");
      setAge("");
      setDescription("");
      setStatus("available");

      await fetchAnimals();
    }

    setLoading(false);
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>🐾 Amor Sin Voz</h1>
          <p>Admin Dashboard</p>
          <small>Signed in: {admin.email}</small>
        </div>
        <button onClick={onLogout}>Log Out</button>
      </header>

      <section className="dashboard-section">
        <h2>Animals in Our Care</h2>

        <p>Total animals: {animals.length}</p>

        <div className="animals-grid">
          {animals.map((animal) => (
            <div className="animal-card" key={animal.id}>
              <h3>{animal.name}</h3>
              <p>{animal.species} · {animal.age}</p>
              <p>Status: {animal.status}</p>
              <p>{animal.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Add New Animal</h2>

        <form onSubmit={handleSubmit}
              className="animal-form">

          <label htmlFor="animal-name">Name</label>
          <input
            id="animal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Max"
            required
          />

          <label htmlFor="animal-species">Species</label>
          <select
            id="animal-species"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          >
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Other">Other</option>
          </select>

          <label htmlFor="animal-age">Age</label>
          <input
            id="animal-age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 8 months"
          />

          <label htmlFor="animal-description">
            Description
          </label>
          <textarea
            id="animal-description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            placeholder="Tell us about this animal..."
            rows="4"
          />

          <label htmlFor="animal-status">
            Adoption Status
          </label>
          <select
            id="animal-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="available">Available</option>
            <option value="in_treatment">
              In Treatment
            </option>
            <option value="reserved">Reserved</option>
            <option value="adopted">Adopted</option>
          </select>

          {error && <p role="alert">{error}</p>}
          {message && <p role="status">{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Animal"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminDashboard;
