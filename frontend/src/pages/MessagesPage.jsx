import { useEffect, useState, useRef } from 'react';
import { matchesAPI, messagesAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function MessagesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    matchesAPI.getAll().then((res) => {
      setMatches(res.data);
      if (res.data.length > 0) setSelectedMatch(res.data[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedMatch) return;
    messagesAPI.getByMatch(selectedMatch._id).then((res) => {
      setMessages(res.data);
    }).catch(console.error);
  }, [selectedMatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedMatch) return;
    setSending(true);
    try {
      const res = await messagesAPI.send(selectedMatch._id, newMsg.trim());
      setMessages((prev) => [...prev, res.data]);
      setNewMsg('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const getPartner = (match) => {
    const uid = user._id || user.id;
    if (match.newMember?._id === uid || match.newMember?.id === uid) return match.buddy;
    return match.newMember;
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Chat with your buddy or member</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <p>No active matches to chat with yet</p>
          </div>
        </div>
      ) : (
        <div className="chat-layout">
          {/* Sidebar */}
          <div className="chat-sidebar">
            <h4 className="chat-sidebar-title">Conversations</h4>
            {matches.map((match) => {
              const partner = getPartner(match);
              return (
                <button
                  key={match._id}
                  className={`chat-contact${selectedMatch?._id === match._id ? ' active' : ''}`}
                  onClick={() => setSelectedMatch(match)}
                >
                  <div className="avatar-circle small">{partner?.name?.[0]?.toUpperCase()}</div>
                  <div className="chat-contact-info">
                    <div className="chat-contact-name">{partner?.name}</div>
                    <div className="chat-contact-role">{partner?.role === 'buddy' ? 'Buddy' : 'New Member'}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chat window */}
          <div className="chat-window">
            {selectedMatch ? (
              <>
                <div className="chat-header">
                  <div className="avatar-circle">{getPartner(selectedMatch)?.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className="chat-partner-name">{getPartner(selectedMatch)?.name}</div>
                    <div className="chat-partner-role">
                      {getPartner(selectedMatch)?.role === 'buddy' ? 'Your Buddy' : 'Your Member'}
                    </div>
                  </div>
                </div>

                <div className="chat-messages">
                  {messages.length === 0 && (
                    <div className="chat-empty">Start the conversation! Say hello 👋</div>
                  )}
                  {messages.map((msg) => {
                    const isMine = msg.sender?._id === (user._id || user.id) ||
                      msg.sender?.id === (user._id || user.id);
                    return (
                      <div key={msg._id} className={`message ${isMine ? 'mine' : 'theirs'}`}>
                        {!isMine && (
                          <div className="avatar-circle xsmall">{msg.sender?.name?.[0]?.toUpperCase()}</div>
                        )}
                        <div className="message-bubble">
                          {!isMine && <div className="message-sender">{msg.sender?.name}</div>}
                          <div className="message-text">{msg.content}</div>
                          <div className="message-time">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                <form className="chat-input-area" onSubmit={handleSend}>
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message…"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    disabled={sending}
                  />
                  <button type="submit" className="btn btn-primary chat-send-btn" disabled={sending || !newMsg.trim()}>
                    Send ➤
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-empty center">Select a conversation</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
