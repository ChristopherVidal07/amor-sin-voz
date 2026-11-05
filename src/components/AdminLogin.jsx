
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AdminDashboard from "./AdminDashboard";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setError(error.message);
    }

    setAdmin(data ? user : null);
    setLoading(false);
  }

  useEffect(() => {
    checkAdmin();
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await checkAdmin();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAdmin(null);
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  
if (admin) {
    return (
      <AdminDashboard
        admin={admin}
        onLogout={handleLogout}
      />
    );
  }
  

  return (
    <section className="admin-container">
      <h1>🐾 Amor Sin Voz</h1>
      <h2>Administrator Login</h2>

      <form onSubmit={handleLogin}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p role="alert">{error}</p>}

        <button type="submit">Sign In</button>
      </form>
    </section>
  );
}

export default AdminLogin;
