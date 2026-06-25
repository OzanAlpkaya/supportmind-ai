import { useEffect, useState, type ChangeEvent, type SubmitEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  createMessage,
  fetchConversation,
  suggestAiReply,
  updateConversationStatus,
  type ConversationDetail,
  type ConversationStatus,
  type MessageSender,
} from '../api/conversations';
import { getCurrentWorkspaceId } from '../auth/tokenStorage';

export function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [body, setBody] = useState('');
  const [sender, setSender] = useState<MessageSender>('AGENT');
  const [suggestedReply, setSuggestedReply] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [suggestingReply, setSuggestingReply] = useState(false);
  const currentWorkspaceId = getCurrentWorkspaceId();

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

  async function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    if (!currentWorkspaceId || !id) {
      return;
    }

    const nextStatus = event.target.value as ConversationStatus;

    try {
      const updatedConversation = await updateConversationStatus(
        currentWorkspaceId,
        id,
        nextStatus,
      );
      setConversation(updatedConversation);
    } catch {
      setError('Failed to update status');
    }
  }

  async function handleSuggestReply() {
    if (!currentWorkspaceId || !id) {
      setError('No workspace or conversation selected');
      return;
    }

    setSuggestingReply(true);
    setError(null);

    try {
      const result = await suggestAiReply(currentWorkspaceId, id);
      setSuggestedReply(result.answer);
    } catch {
      setError('Failed to suggest AI reply');
    } finally {
      setSuggestingReply(false);
    }
  }

  function handleUseSuggestedReply() {
    setBody(suggestedReply);
    setSender('AGENT');
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
        {error && <p className="error-text">{error}</p>}
      </main>
    );
  }

  return (
    <main className="page-section">
      <Link to="/inbox">Back to inbox</Link>

      <div className="page-header">
        <div>
          <h1>{conversation.subject ?? 'No subject'}</h1>
          <p>
            {conversation.customer.name ? `${conversation.customer.name} - ` : ''}
            {conversation.customer.email}
          </p>
        </div>
        <label>
          Status
          <select value={conversation.status} onChange={handleStatusChange}>
            <option value="OPEN">Open</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </label>
      </div>

      {error && <p className="error-text">{error}</p>}

      <section className="card stack">
        <h2>Messages</h2>
        {conversation.messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          <ul className="message-list">
            {conversation.messages.map((message) => (
              <li key={message.id} className="message-item">
                <strong>{message.sender}</strong>
                <p>{message.body}</p>
                <small>{new Date(message.createdAt).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card stack">
        <div className="page-header compact">
          <h2>AI suggested reply</h2>
          <button type="button" onClick={handleSuggestReply} disabled={suggestingReply}>
            {suggestingReply ? 'Suggesting...' : 'Suggest AI Reply'}
          </button>
        </div>
        {suggestedReply ? (
          <>
            <p>{suggestedReply}</p>
            <button type="button" onClick={handleUseSuggestedReply} className="secondary-button">
              Use in message box
            </button>
          </>
        ) : (
          <p>No suggestion yet.</p>
        )}
      </section>

      <section className="card stack">
        <h2>Add message</h2>
        <form onSubmit={handleSendMessage} className="stack">
          <label htmlFor="sender">Sender</label>
          <select id="sender" value={sender} onChange={handleSenderChange}>
            <option value="AGENT">Agent</option>
            <option value="CUSTOMER">Customer</option>
            <option value="SYSTEM">System</option>
          </select>

          <label htmlFor="message-body">Message</label>
          <textarea id="message-body" value={body} onChange={handleBodyChange} rows={5} />

          <button type="submit" disabled={sendingMessage || !body.trim()}>
            {sendingMessage ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </section>
    </main>
  );
}
