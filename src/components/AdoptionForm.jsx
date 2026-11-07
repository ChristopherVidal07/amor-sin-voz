
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdoptionForm({ animal, onClose }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    const { error: submitError } = await supabase
      .from("adoption_applications")
      .insert({
        animal_id: animal.id,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim()
      });

      if (submitError) {
        console.error("SUPABASE ERROR:", submitError);
      
        setError(
          `Submission failed: ${submitError.message}`
        );
      } else {
        setSuccess(true);
      }

    setLoading(false);
  }

  return (
    <div className="adoption-form-container">
      <button type="button" onClick={onClose}>
        Close
      </button>

      {success ? (
        <div>
          <h2>Application Submitted!</h2>
          <p>
            Thank you for your interest in adopting {animal.name}.
            Our team will review your application.
          </p>
        </div>
      ) : (
        <>
          <h2>Apply to Adopt {animal.name}</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full name"
              required
              maxLength={120}
              value={form.full_name}
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email address"
              required
              maxLength={254}
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <input
              type="tel"
              placeholder="Phone number"
              required
              maxLength={30}
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />

            <textarea
              placeholder="Why would you like to adopt this animal?"
              required
              maxLength={2000}
              rows={5}
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
            />

            {error && <p role="alert">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
