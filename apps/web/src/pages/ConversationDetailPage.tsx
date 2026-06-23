import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  createMessage,
  fetchConversation,
  type ConversationDetail,
  type MessageSender,
} from '../api/conversations';

const CURRENT_WORKSPACE_KEY = 'supportmind_current_workspace_id';

export function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [body, setBody] = useState('');
  const [sender, setSender] = useState<MessageSender>('AGENT');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  const currentWorkspaceId = localStorage.getItem(CURRENT_WORKSPACE_KEY);

  useEffect(() => {
    async function loadConversation() {
      if (!currentWorkspaceId) {
        setError('No workspace selected');
        setLoading(false);
        return;
      }

      if (!id) {
        setError('Conversation id is missing');
        setLoading(false);
        return;
      }

      try {
        const data = await fetchConversation(currentWorkspaceId, id);
        setConversation(data);
      } catch {
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    }

    void loadConversation();
  }, [currentWorkspaceId, id]);

  async function handleSendMessage(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentWorkspaceId) {
      setError('No workspace selected');
      return;
    }

    if (!id) {
      setError('Conversation id is missing');
      return;
    }

    setSendingMessage(true);
    setError(null);

    try {
      const message = await createMessage(currentWorkspaceId, id, {
        body,
        sender,
      });

      setConversation((currentConversation) => {
        if (!currentConversation) {
          return currentConversation;
        }

        return {
          ...currentConversation,
          messages: [...currentConversation.messages, message],
          updatedAt: message.createdAt,
        };
      });

      setBody('');
      setSender('AGENT');
    } catch {
      setError('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  }

  function handleBodyChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setBody(event.target.value);
  }

  function handleSenderChange(event: ChangeEvent<HTMLSelectElement>) {
    setSender(event.target.value as MessageSender);
  }

  if (loading) {
    return <p>Loading conversation...</p>;
  }

  if (!conversation) {
    return (
      <main>
        <Link to="/inbox">Back to inbox</Link>
        <h1>Conversation not found</h1>
        {error && <p>{error}</p>}
      </main>
    );
  }

  return (
    <main>
      <Link to="/inbox">Back to inbox</Link>

      <h1>{conversation.subject ?? 'No subject'}</h1>

      {error && <p>{error}</p>}

      <section>
        <h2>Customer</h2>
        <p>
          {conversation.customer.name ? `${conversation.customer.name} - ` : ''}
          {conversation.customer.email}
        </p>
        <p>Status: {conversation.status}</p>
      </section>

      <section>
        <h2>Messages</h2>

        {conversation.messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          <ul>
            {conversation.messages.map((message) => (
              <li key={message.id}>
                <strong>{message.sender}</strong>
                <p>{message.body}</p>
                <small>{new Date(message.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Add message</h2>

        <form onSubmit={handleSendMessage}>
          <div>
            <label htmlFor="message-sender">Sender</label>
            <select id="message-sender" value={sender} onChange={handleSenderChange}>
              <option value="AGENT">Agent</option>
              <option value="CUSTOMER">Customer</option>
              <option value="SYSTEM">System</option>
            </select>
          </div>

          <div>
            <label htmlFor="message-body">Message</label>
            <textarea
              id="message-body"
              value={body}
              onChange={handleBodyChange}
              required
              rows={4}
            />
          </div>

          <button type="submit" disabled={sendingMessage}>
            {sendingMessage ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </section>
    </main>
  );
}
