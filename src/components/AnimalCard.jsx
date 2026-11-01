


function AnimalCard({name, species, age, description}){
    return(
        <div className="animal-card">
            <h2>{name}</h2>
            <p>Species: {species}</p>
            <p>Age: {age}</p>
            <p>{description}</p>
            <button>View Prifile</button>
        </div>
    );
}

export default AnimalCard;