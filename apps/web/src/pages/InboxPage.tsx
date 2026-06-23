import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { createCustomer, fetchCustomers, type Customer } from '../api/customers';
import {
  createConversation,
  fetchConversations,
  type ConversationListItem,
} from '../api/conversations';

const CURRENT_WORKSPACE_KEY = 'supportmind_current_workspace_id';

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

  const currentWorkspaceId = localStorage.getItem(CURRENT_WORKSPACE_KEY);

  useEffect(() => {
    async function loadInboxData() {
      if (!currentWorkspaceId) {
        setError('No workspace selected');
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
        setError('Failed to load inbox data');
      } finally {
        setLoading(false);
      }
    }

    void loadInboxData();
  }, [currentWorkspaceId]);

  async function handleCreateCustomer(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentWorkspaceId) {
      setError('No workspace selected');
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
      setError('Failed to create customer');
    } finally {
      setCreatingCustomer(false);
    }
  }

  async function handleCreateConversation(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentWorkspaceId) {
      setError('No workspace selected');
      return;
    }

    if (!selectedCustomerId) {
      setError('Please select a customer');
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
      setError('Failed to create conversation');
    } finally {
      setCreatingConversation(false);
    }
  }

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  function handleSelectedCustomerChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCustomerId(event.target.value);
  }

  function handleSubjectChange(event: ChangeEvent<HTMLInputElement>) {
    setSubject(event.target.value);
  }

  if (loading) {
    return <p>Loading inbox...</p>;
  }

  return (
    <main>
      <h1>Support Inbox</h1>

      {error && <p>{error}</p>}

      <section>
        <h2>Create customer</h2>

        <form onSubmit={handleCreateCustomer}>
          <div>
            <label htmlFor="customer-email">Email</label>
            <input
              id="customer-email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>

          <div>
            <label htmlFor="customer-name">Name</label>
            <input id="customer-name" value={name} onChange={handleNameChange} />
          </div>

          <button type="submit" disabled={creatingCustomer}>
            {creatingCustomer ? 'Creating...' : 'Create customer'}
          </button>
        </form>
      </section>

      <section>
        <h2>Customers</h2>

        {customers.length === 0 ? (
          <p>No customers yet.</p>
        ) : (
          <ul>
            {customers.map((customer) => (
              <li key={customer.id}>
                {customer.name ? `${customer.name} - ` : ''}
                {customer.email}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Create conversation</h2>

        {customers.length === 0 ? (
          <p>Create a customer first.</p>
        ) : (
          <form onSubmit={handleCreateConversation}>
            <div>
              <label htmlFor="conversation-customer">Customer</label>
              <select
                id="conversation-customer"
                value={selectedCustomerId}
                onChange={handleSelectedCustomerChange}
                required
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name ? `${customer.name} - ` : ''}
                    {customer.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="conversation-subject">Subject</label>
              <input
                id="conversation-subject"
                value={subject}
                onChange={handleSubjectChange}
                placeholder="Order delivery problem"
              />
            </div>

            <button type="submit" disabled={creatingConversation}>
              {creatingConversation ? 'Creating...' : 'Create conversation'}
            </button>
          </form>
        )}
      </section>

      <section>
        <h2>Conversations</h2>

        {conversations.length === 0 ? (
          <p>No conversations yet.</p>
        ) : (
          <ul>
            {conversations.map((conversation) => {
              const lastMessage = conversation.messages[0];

              return (
                <li key={conversation.id}>
                  <Link to={`/conversations/${conversation.id}`}>
                    <strong>{conversation.subject ?? 'No subject'}</strong>
                  </Link>

                  <div>
                    {conversation.customer.name ? `${conversation.customer.name} - ` : ''}
                    {conversation.customer.email}
                  </div>

                  <div>Status: {conversation.status}</div>

                  {lastMessage && <p>{lastMessage.body}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
