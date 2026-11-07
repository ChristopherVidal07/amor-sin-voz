
import { useState } from "react";
import AdoptionForm from "./AdoptionForm";

export default function AnimalCard({
  id,
  name,
  species,
  age,
  description,
  imageUrl
}) {
  const [showForm, setShowForm] = useState(false);

  const animal = { id, name };

  return (
    <>
      <article className="animal-card">
        <div className="animal-card-image">
          {imageUrl ? (
            <img src={imageUrl} alt={name} />
          ) : (
            <div className="animal-placeholder">
              🐾
            </div>
          )}
        </div>

        <div className="animal-card-content">
          <span className="animal-species">{species}</span>

          <h3>{name}</h3>

          <p className="animal-age">
            {age != null ? `${age}` : "Age unknown"}
          </p>

          <p className="animal-description">
            {description || "Looking for a loving home!"}
          </p>

          <button
            className="animal-adopt-btn"
            type="button"
            onClick={() => setShowForm(true)}
          >
            Meet Me
          </button>
        </div>
      </article>

      {showForm && (
        <AdoptionForm
          animal={animal}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
