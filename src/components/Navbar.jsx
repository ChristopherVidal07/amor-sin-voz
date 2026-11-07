export default function Navbar(){
    return (
        <nav className="navbar">
          <a href="/" className="navbar-logo">
            🐾 Amor Sin Voz
          </a>
    
          <div className="navbar-links">
            <a href="/">Home</a>
            <a href="/#animals">Adopt</a>
            <a href="/#about">About Us</a>
          </div>
        </nav>
    );
}