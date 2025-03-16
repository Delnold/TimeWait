// src/components/Queues/QueueDetail.js
import React from 'react';
import JoinQueue from './JoinQueue';

const QueueDetail = ({ queue }) => {
  return (
    <div>
      <h2>{queue.name}</h2>

      {/* Show queue description if you added it */}
      {queue.description && (
        <p><strong>Description:</strong> {queue.description}</p>
      )}

      {/* Show the user who created it */}
      <p>
        <strong>Created By:</strong>{" "}
        {queue.user ? queue.user.name : "Unknown"}
      </p>

      {/* Show the list of people who joined */}
      <h3>Joined Users</h3>
      {queue.queue_items.length === 0 ? (
        <p>No one has joined yet.</p>
      ) : (
        <ul>
          {queue.queue_items.map((item) => (
            <li key={item.id}>
              <p>User: {item.user ? item.user.name : "Anonymous"}</p>
              <p>Token: {item.token_number}</p>
              <p>Join Hash: {item.join_hash}</p>
              <p>Joined At: {new Date(item.joined_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}

      {/* The "Join Queue" button if user wants to join */}
      <JoinQueue queueId={queue.id} />
    </div>
  );
};

export default QueueDetail;
