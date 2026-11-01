import AnimalCard from "./components/AnimalCard";
import "./App.css";

function App(){
  return (

  <main>
    <h1> Amor Sin Voz</h1>
    <p>Todos los animales merecen un hogar.</p>

    <h2>Animal Available for Adoption</h2>

    <AnimalCard
    name="Luna"
    species="Dog"
    age="2 years"
    description="Friendly, playful, and loving."
    />

    <AnimalCard
    name="Milo"
    species="Cat"
    age="1 year"
    description="Calm, curious, and affectionate."
    />

    
    
  </main>
  );
}

export default App;