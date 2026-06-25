import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { fetchProfile, updateProfile, type Profile } from '../api/profile';

export function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchProfile();
        setProfile(data);
        setFirstName(data.firstName ?? '');
        setLastName(data.lastName ?? '');
      } catch {
        setError('Profile could not be loaded.');
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updated = await updateProfile({ firstName, lastName });
      setProfile(updated);
      setSuccess('Profile updated.');
    } catch {
      setError('Profile could not be updated.');
    } finally {
      setSaving(false);
    }
  }

  function handleFirstNameChange(event: ChangeEvent<HTMLInputElement>) {
    setFirstName(event.target.value);
  }

  function handleLastNameChange(event: ChangeEvent<HTMLInputElement>) {
    setLastName(event.target.value);
  }

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <section className="page-section">
      <h1>Profile</h1>
      {error && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}

      <form onSubmit={handleSubmit} className="card stack">
        <p>Email: {profile?.email}</p>

        <label htmlFor="firstName">First name</label>
        <input id="firstName" value={firstName} onChange={handleFirstNameChange} />

        <label htmlFor="lastName">Last name</label>
        <input id="lastName" value={lastName} onChange={handleLastNameChange} />

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </section>
  );
}
