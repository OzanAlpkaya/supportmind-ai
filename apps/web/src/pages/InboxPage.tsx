import { useEffect, useMemo, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { createCustomer, fetchCustomers, type Customer } from '../api/customers';
import {
  createConversation,
  fetchConversations,
  type ConversationListItem,
} from '../api/conversations';
import { getCurrentWorkspaceId } from '../auth/tokenStorage';

export function InboxPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);

  const currentWorkspaceId = getCurrentWorkspaceId();
  const openConversations = useMemo(
    () => conversations.filter((conversation) => conversation.status === 'OPEN').length,
    [conversations],
  );

  useEffect(() => {
    async function loadInboxData() {
      if (!currentWorkspaceId) {
        setError('No workspace selected. Pick or create a workspace from Dashboard first.');
        setLoading(false);
        return;
      }

      try {
        const [customersData, conversationsData] = await Promise.all([
          fetchCustomers(currentWorkspaceId),
          fetchConversations(currentWorkspaceId),
        ]);
        setCustomers(customersData);
        setConversations(conversationsData);
      } catch {
        setError('Failed to load inbox data.');
      } finally {
        setLoading(false);
      }
    }

    void loadInboxData();
  }, [currentWorkspaceId]);

  async function handleCreateCustomer(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }

    setCreatingCustomer(true);
    setError(null);

    try {
      const customer = await createCustomer(currentWorkspaceId, {
        email,
        name: name.trim() ? name : undefined,
      });
      setCustomers((currentCustomers) => [customer, ...currentCustomers]);
      setEmail('');
      setName('');
    } catch {
      setError('Failed to create customer.');
    } finally {
      setCreatingCustomer(false);
    }
  }

  async function handleCreateConversation(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }

    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    setCreatingConversation(true);
    setError(null);

    try {
      const conversation = await createConversation(currentWorkspaceId, {
        customerId: selectedCustomerId,
        subject: subject.trim() ? subject : undefined,
      });
      setConversations((currentConversations) => [
        {
          ...conversation,
          messages: [],
        },
        ...currentConversations,
      ]);
      setSelectedCustomerId('');
      setSubject('');
    } catch {
      setError('Failed to create conversation.');
    } finally {
      setCreatingConversation(false);
    }
  }

  if (loading) {
    return <div className="page-section"><div className="skeleton-card">Loading inbox...</div></div>;
  }

  return (
    <section className="page-section">
      <header className="page-header hero-header">
        <div>
          <div className="eyebrow">Support inbox</div>
          <h1>Customer conversations</h1>
          <p>Capture customers, open support threads, and use AI suggestions from your KB.</p>
        </div>
        <div className="header-metrics">
          <div className="metric-pill"><strong>{customers.length}</strong><span>Customers</span></div>
          <div className="metric-pill"><strong>{conversations.length}</strong><span>Threads</span></div>
          <div className="metric-pill accent"><strong>{openConversations}</strong><span>Open</span></div>
        </div>
      </header>

      {error && <p className="alert alert-error">{error}</p>}

      <div className="inbox-layout">
        <div className="stack">
          <section className="panel-card">
            <div className="panel-heading">
              <div>
                <h2>Create customer</h2>
                <p>Add a customer profile to start a support conversation.</p>
              </div>
            </div>

            <form className="form-stack" onSubmit={handleCreateCustomer}>
              <label className="field-label">
                Email
                <input
                  value={email}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                  type="email"
                  placeholder="customer@example.com"
                  required
                />
              </label>

              <label className="field-label">
                Name
                <input
                  value={name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
                  placeholder="Optional customer name"
                />
              </label>

              <button type="submit" className="button button-primary" disabled={creatingCustomer}>
                {creatingCustomer ? 'Creating...' : 'Create customer'}
              </button>
            </form>
          </section>

          <section className="panel-card">
            <div className="panel-heading">
              <div>
                <h2>Create conversation</h2>
                <p>Start a new thread for a selected customer.</p>
              </div>
            </div>

            {customers.length === 0 ? (
              <div className="empty-state compact">Create a customer first.</div>
            ) : (
              <form className="form-stack" onSubmit={handleCreateConversation}>
                <label className="field-label">
                  Customer
                  <select
                    value={selectedCustomerId}
                    onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                      setSelectedCustomerId(event.target.value)
                    }
                    required
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name ? `${customer.name} — ` : ''}
                        {customer.email}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field-label">
                  Subject
                  <input
                    value={subject}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => setSubject(event.target.value)}
                    placeholder="Refund request, shipping question..."
                  />
                </label>

                <button type="submit" className="button button-primary" disabled={creatingConversation}>
                  {creatingConversation ? 'Creating...' : 'Create conversation'}
                </button>
              </form>
            )}
          </section>
        </div>

        <section className="panel-card list-panel">
          <div className="panel-heading">
            <div>
              <h2>Conversations</h2>
              <p>Recent customer threads in this workspace.</p>
            </div>
          </div>

          {conversations.length === 0 ? (
            <div className="empty-state">
              <strong>No conversations yet</strong>
              <span>Create a customer and open your first support thread.</span>
            </div>
          ) : (
            <div className="conversation-list">
              {conversations.map((conversation) => {
                const lastMessage = conversation.messages[0];

                return (
                  <Link
                    key={conversation.id}
                    to={`/conversations/${conversation.id}`}
                    className="conversation-card"
                  >
                    <div className="conversation-main">
                      <div>
                        <h3>{conversation.subject ?? 'No subject'}</h3>
                        <p>
                          {conversation.customer.name ? `${conversation.customer.name} — ` : ''}
                          {conversation.customer.email}
                        </p>
                      </div>
                      <span className={`status-badge status-${conversation.status.toLowerCase()}`}>
                        {conversation.status}
                      </span>
                    </div>
                    {lastMessage ? (
                      <p className="conversation-snippet">{lastMessage.body}</p>
                    ) : (
                      <p className="conversation-snippet muted">No messages yet.</p>
                    )}
                    <small>{new Date(conversation.updatedAt).toLocaleString()}</small>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
