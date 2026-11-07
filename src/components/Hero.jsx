
export default function Hero() {
    return (
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tagline">
            🐾 Every Life Matters
          </span>
  
          <h1>
            Give Them a Home.
            <br />
            <span>Give Them Love.</span>
          </h1>
  
          <p>
            At Amor Sin Voz, we believe every animal
            deserves a second chance. Meet your new
            best friend and make a difference today.
          </p>
  
          <div className="hero-buttons">
            <a href="#animals" className="hero-btn-primary">
              Meet Our Animals
            </a>
  
            <a href="#about" className="hero-btn-secondary">
              Learn More
            </a>
          </div>
        </div>
  
        <div className="hero-image">
          <img
            src="/images/hero-pets.jpg"
            alt="Animals looking for a loving home"
          />
        </div>
      </section>
    );
  }
  