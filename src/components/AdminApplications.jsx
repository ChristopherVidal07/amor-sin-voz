
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("all");

  async function fetchApplications() {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("adoption_applications")
      .select(`
        id,
        animal_id,
        full_name,
        email,
        phone,
        message,
        status,
        created_at,
        animals (
          name,
          species,
          image_url
        )
      `)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setApplications(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  async function updateStatus(id, status) {
    if (updatingId !== null) return;

    setUpdatingId(id);
    setError("");

    const { data, error: updateError } = await supabase
      .from("adoption_applications")
      .update({ status })
      .eq("id", id)
      .eq("status", "pending")
      .select("id, status")
      .maybeSingle();

    if (updateError) {
      setError(updateError.message);
    } else if (!data) {
      setError(
        "The application was not updated. Refresh to check its current status."
      );
    } else {
      setApplications((current) =>
        current.map((application) =>
          application.id === id
            ? { ...application, status: data.status }
            : application
        )
      );
    }

    setUpdatingId(null);
  }

  const counts = {
    all: applications.length,
    pending: applications.filter(
      (app) => app.status === "pending"
    ).length,
    approved: applications.filter(
      (app) => app.status === "approved"
    ).length,
    rejected: applications.filter(
      (app) => app.status === "rejected"
    ).length,
  };

  const filteredApplications =
    filter === "all"
      ? applications
      : applications.filter(
          (app) => app.status === filter
        );

  return (
    <section className="dashboard-section admin-applications">
      <div className="applications-header">
        <div>
          <h2>Adoption Applications</h2>
          <p>Review and manage adoption requests.</p>
        </div>

        <button
          type="button"
          onClick={fetchApplications}
          disabled={loading || updatingId !== null}
        >
          Refresh
        </button>
      </div>

      <div className="application-filters">
        {["all", "pending", "approved", "rejected"].map(
          (status) => (
            <button
              key={status}
              type="button"
              className={
                filter === status
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() => setFilter(status)}
              aria-pressed={filter === status}
            >
              {status.charAt(0).toUpperCase() +
                status.slice(1)}
              {" "}({counts[status]})
            </button>
          )
        )}
      </div>

      {loading && <p>Loading applications...</p>}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && applications.length === 0 && (
        <p>No adoption applications yet.</p>
      )}

      {!loading &&
        applications.length > 0 &&
        filteredApplications.length === 0 && (
          <p>No {filter} applications found.</p>
        )}

      <div className="applications-list">
        {!loading &&
          filteredApplications.map((application) => (
            <article
              className="application-card"
              key={application.id}
            >
              <div className="application-card-header">
                <h3>{application.full_name}</h3>

                <span
                  className={
                    `application-status status-${application.status}`
                  }
                >
                  {application.status}
                </span>
              </div>

              <div className="application-animal">
                {application.animals?.image_url && (
                  <img
                    className="application-animal-photo"
                    src={application.animals.image_url}
                    alt={application.animals.name}
                  />
                )}

                <div>
                  <p>
                    <strong>Animal:</strong>{" "}
                    {application.animals?.name ||
                      "Unknown animal"}
                  </p>

                  <p>
                    <strong>Species:</strong>{" "}
                    {application.animals?.species ||
                      "Unknown"}
                  </p>
                </div>
              </div>

              <p>
                <strong>Email:</strong>{" "}
                {application.email}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {application.phone}
              </p>

              <p>
                <strong>Applied:</strong>{" "}
                {new Date(
                  application.created_at
                ).toLocaleString()}
              </p>

              <p>
                <strong>Message:</strong>
              </p>

              <p className="application-message">
                {application.message}
              </p>

              {application.status === "pending" && (
                <div className="application-actions">
                  <button
                    type="button"
                    className="approve-button"
                    disabled={updatingId !== null}
                    onClick={() =>
                      updateStatus(
                        application.id,
                        "approved"
                      )
                    }
                  >
                    {updatingId === application.id
                      ? "Updating..."
                      : "Approve"}
                  </button>

                  <button
                    type="button"
                    className="reject-button"
                    disabled={updatingId !== null}
                    onClick={() =>
                      updateStatus(
                        application.id,
                        "rejected"
                      )
                    }
                  >
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))}
      </div>
    </section>
  );
}
