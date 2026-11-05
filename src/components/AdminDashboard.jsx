
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

function AdminDashboard({ admin, onLogout }) {
  const [animals, setAnimals] = useState([]);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("available");
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);

  // Fetch all animals from Supabase
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

  // Add a new animal and upload its photo
  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
      ];

      if (imageFile) {
        if (!allowedTypes.includes(imageFile.type)) {
          throw new Error(
            "Only JPG, PNG and WebP images are allowed."
          );
        }

        if (imageFile.size > 5 * 1024 * 1024) {
          throw new Error(
            "Image must be 5 MB or smaller."
          );
        }
      }

      // 1. Save animal information
      const { data: animal, error: insertError } =
        await supabase
          .from("animals")
          .insert({
            name: name.trim(),
            species,
            age: age.trim(),
            description: description.trim(),
            status
          })
          .select("id")
          .single();

      if (insertError) throw insertError;

      // 2. Upload photo to Supabase Storage
      if (imageFile) {
        const extension = imageFile.name
          .split(".")
          .pop()
          .toLowerCase();

        const filePath =
          `${animal.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from("animal-images")
            .upload(filePath, imageFile, {
              contentType: imageFile.type,
              upsert: false
            });

        if (uploadError) throw uploadError;

        // 3. Get public photo URL
        const { data: imageData } =
          supabase.storage
            .from("animal-images")
            .getPublicUrl(filePath);

        // 4. Save image URL in animals table
        const { error: updateError } =
          await supabase
            .from("animals")
            .update({
              image_url: imageData.publicUrl
            })
            .eq("id", animal.id);

        if (updateError) throw updateError;
      }

      setMessage("Animal added successfully!");

      // Reset form fields
      setName("");
      setSpecies("Dog");
      setAge("");
      setDescription("");
      setStatus("available");
      setImageFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh the dashboard
      await fetchAnimals();

    } catch (err) {
      setError(
        `${err.message}. Check the animal list before retrying.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard">

      <header className="dashboard-header">
        <div>
          <h1>🐾 Amor Sin Voz</h1>
          <p>Admin Dashboard</p>
          <small>Signed in: {admin.email}</small>
        </div>

        <button onClick={onLogout}>
          Log Out
        </button>
      </header>

      {/* Animals list */}
      <section className="dashboard-section">
        <h2>Animals in Our Care</h2>

        <p>Total animals: {animals.length}</p>

        <div className="animals-grid">
          {animals.map((animal) => (
            <div
              className="animal-card"
              key={animal.id}
            >
              {animal.image_url && (
                <img
                  src={animal.image_url}
                  alt={`Photo of ${animal.name}`}
                  className="animal-photo"
                />
              )}

              <h3>{animal.name}</h3>
              <p>
                {animal.species} · {animal.age}
              </p>
              <p>Status: {animal.status}</p>
              <p>{animal.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Add animal form */}
      <section className="dashboard-section">
        <h2>Add New Animal</h2>

        <form
          onSubmit={handleSubmit}
          className="animal-form"
        >
          <label htmlFor="animal-name">
            Name
          </label>
          <input
            id="animal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bella"
            required
          />

          <label htmlFor="animal-species">
            Species
          </label>
          <select
            id="animal-species"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          >
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Other">Other</option>
          </select>

          <label htmlFor="animal-age">
            Age
          </label>
          <input
            id="animal-age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 6 months"
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
            <option value="available">
              Available
            </option>
            <option value="in_treatment">
              In Treatment
            </option>
            <option value="reserved">
              Reserved
            </option>
            <option value="adopted">
              Adopted
            </option>
          </select>

          <label htmlFor="animal-photo">
            Animal Photo
          </label>
          <input
            id="animal-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            ref={fileInputRef}
            onChange={(e) =>
              setImageFile(e.target.files[0] ?? null)
            }
          />

          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="success-message">
              {message}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Animal"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminDashboard;
