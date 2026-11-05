
function AnimalCard({
    name,
    species,
    age,
    description,
    imageUrl
  }) {
    return (
      <div className="animal-card">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`Photo of ${name}`}
            className="animal-photo"
          />
        )}
  
        <h2>{name}</h2>
        <p>Species: {species}</p>
        <p>Age: {age}</p>
        <p>{description}</p>
  
        <button>View Profile</button>
      </div>
    );
  }
  
  export default AnimalCard;
  