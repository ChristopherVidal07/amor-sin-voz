
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminApplications from "./AdminApplications";

function AdminDashboard({ admin, onLogout }) {
  // Animal list
  const [animals, setAnimals] = useState([]);

  // Form fields
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("Dog");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("available");
  const [imageFile, setImageFile] = useState(null);

  // Editing
  const [editingAnimal, setEditingAnimal] = useState(null);

  // Messages and loading
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Get all animals from Supabase
  async function fetchAnimals() {
    const { data, error: fetchError } = await supabase
      .from("animals")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setAnimals(data ?? []);
    }

    setFetching(false);
  }

  useEffect(() => {
    fetchAnimals();
  }, []);

  // Reset all form fields
  function resetForm() {
    setEditingAnimal(null);
    setName("");
    setSpecies("Dog");
    setAge("");
    setDescription("");
    setStatus("available");
    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Select animal for editing
  function handleEdit(animal) {
    setEditingAnimal(animal);

    setName(animal.name);
    setSpecies(animal.species);
    setAge(animal.age ?? "");
    setDescription(animal.description ?? "");
    setStatus(animal.status);

    setImageFile(null);
    setError("");
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  // Validate selected image
  function validateImage(file) {
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "Only JPG, PNG and WebP images are allowed."
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error(
        "Image must be 5 MB or smaller."
      );
    }
  }

  // Upload photo and return its public URL
  async function uploadImage(file, animalId) {
    const extensions = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp"
    };

    const extension = extensions[file.type];

    const filePath =
      `${animalId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("animal-images")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("animal-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Add new animal
  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    let animalCreated = false;

    try {
      validateImage(imageFile);

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

      animalCreated = true;

      // Upload photo if selected
      if (imageFile) {
        const imageUrl = await uploadImage(
          imageFile,
          animal.id
        );

        const { data, error: updateError } =
          await supabase
            .from("animals")
            .update({ image_url: imageUrl })
            .eq("id", animal.id)
            .select("id")
            .single();

        if (updateError) throw updateError;
      }

      resetForm();
      await fetchAnimals();

      setMessage("Animal added successfully!");
    } catch (err) {
      setError(
        err.message +
          (animalCreated
            ? " The animal may already have been saved. Check the list before trying again."
            : "")
      );

      if (animalCreated) {
        await fetchAnimals();
      }
    } finally {
      setLoading(false);
    }
  }

  // Update existing animal
  
async function handleUpdate(event) {
    event.preventDefault();
  
    if (!editingAnimal || loading) return;
  
    setLoading(true);
    setError("");
    setMessage("");
  
    try {
      // 1. Validate new image if selected
      validateImage(imageFile);
  
      // 2. Prepare the animal information
      const updatedData = {
        name: name.trim(),
        species,
        age: age.trim(),
        description: description.trim(),
        status
      };
  
      // 3. Upload a new photo if selected
      if (imageFile) {
        const newImageUrl = await uploadImage(
          imageFile,
          editingAnimal.id
        );
  
        updatedData.image_url = newImageUrl;
      }
  
      // 4. Update the existing animal
      const { error: updateError } = await supabase
        .from("animals")
        .update(updatedData)
        .eq("id", editingAnimal.id)
        .select("id")
        .single();
  
      if (updateError) throw updateError;
  
      // 5. Reset the form
      resetForm();
  
      // 6. Refresh animals
      await fetchAnimals();
  
      setMessage("Animal updated successfully!");
  
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  

  // Cancel editing
  function handleCancel() {
    resetForm();
    setError("");
    setMessage("");
  }

  return (
    <main className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>🐾 Amor Sin Voz</h1>
          <p>Admin Dashboard</p>
          <small>Signed in: {admin.email}</small>
        </div>

        <button
          type="button"
          onClick={onLogout}
        >
          Log Out
        </button>
      </header>

      {/* Animals list */}
      <AdminApplications />
      <section className="dashboard-section">
        <h2>Animals in Our Care</h2>

        {fetching ? (
          <p>Loading animals...</p>
        ) : (
          <p>Total animals: {animals.length}</p>
        )}

        <div className="animals-grid">
          {animals.map((animal) => (
            <div
              className="animal-card"
              key={animal.id}
            >
              {animal.image_url ? (
                <img
                  src={animal.image_url}
                  alt={`Photo of ${animal.name}`}
                  className="animal-photo"
                />
              ) : (
                <div className="animal-photo-placeholder">
                  🐾 No photo yet
                </div>
              )}

              <h3>{animal.name}</h3>

              <p>
                {animal.species} · {animal.age}
              </p>

              <p>
                <strong>Status:</strong> {animal.status}
              </p>

              <p>{animal.description}</p>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleEdit(animal)}
              >
                Edit Animal
              </button>
            
            </div>
          ))}
        </div>
      </section>

      {/* Add / Edit form */}
      <section
        className="dashboard-section"
        ref={formRef}
      >
        <h2>
          {editingAnimal
            ? `Edit ${editingAnimal.name}`
            : "Add New Animal"}
        </h2>

        <form
          className="animal-form"
          onSubmit={
            editingAnimal
              ? handleUpdate
              : handleSubmit
          }
        >
          <label htmlFor="animal-name">
            Name
          </label>

          <input
            id="animal-name"
            type="text"
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
            type="text"
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
            rows={4}
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

          {/* Photo upload for new animals */}
          
<label htmlFor="animal-photo">
  {editingAnimal
    ? "Replace Animal Photo"
    : "Animal Photo"}
</label>

{editingAnimal?.image_url && (
  <div className="current-photo">
    <p>Current photo:</p>

    <img
      src={editingAnimal.image_url}
      alt={`Current photo of ${editingAnimal.name}`}
      className="animal-photo"
    />
  </div>
)}

<input
  id="animal-photo"
  type="file"
  accept="image/jpeg,image/png,image/webp"
  ref={fileInputRef}
  onChange={(e) =>
    setImageFile(e.target.files?.[0] ?? null)
  }
/>

{editingAnimal && (
  <small>
    Leave this empty to keep the current photo.
  </small>
)}


          {error && (
            <p
              role="alert"
              className="error-message"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="success-message"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editingAnimal
                ? "Save Changes"
                : "Add Animal"}
          </button>

          {editingAnimal && (
            <button
              type="button"
              disabled={loading}
              onClick={handleCancel}
              className="cancel-button"
            >
              Cancel Editing
            </button>
          )}
        </form>
      </section>
    </main>
  );
}

export default AdminDashboard;
