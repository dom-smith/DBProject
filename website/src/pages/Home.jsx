import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import supabase from '../utils/SupabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';

// mock data to demo
const mockEvents = [
  {
    id: 1,
    title: "Spring Campus Festival",
    description: "Annual spring celebration with music, food, and activities",
    date: "2025-04-15T14:00:00",
    location: "Main Campus Quad",
    type: "social",
    visibility: "public",
    university: "State University",
    rso: null,
    rating: 4.7,
    comments: [
      { id: 1, userId: 101, username: "alex_j", text: "Can't wait for this!", timestamp: "2025-04-01T10:23:00", isCurrentUser: true },
      { id: 2, userId: 102, username: "maya22", text: "Is there a schedule of performances?", timestamp: "2025-04-02T09:15:00", isCurrentUser: false }
    ]
  },
  {
    id: 2,
    title: "AI Research Symposium",
    description: "Presentations on latest AI research from the Computer Science department",
    date: "2025-04-20T09:00:00",
    location: "Tech Building, Room 305",
    type: "tech",
    visibility: "private",
    university: "State University",
    rso: null,
    rating: 4.2,
    comments: [
      { id: 3, userId: 103, username: "tech_enthusiast", text: "Will the presentations be recorded?", timestamp: "2025-04-03T14:10:00", isCurrentUser: false }
    ]
  },
  {
    id: 3,
    title: "Robotics Club Demo Day",
    description: "Showcasing this semester's robotics projects",
    date: "2025-04-22T16:00:00",
    location: "Engineering Hall",
    type: "tech",
    visibility: "rso",
    university: "State University",
    rso: "Robotics Club",
    rating: 4.9,
    comments: []
  },
  {
    id: 4,
    title: "Charity 5K Run",
    description: "Annual fundraising run for local children's hospital",
    date: "2025-04-25T08:00:00",
    location: "University Park",
    type: "fundraising",
    visibility: "public",
    university: "State University",
    rso: "Community Service Alliance",
    rating: 4.5,
    comments: [
      { id: 4, userId: 101, username: "alex_j", text: "I'll be volunteering at this event!", timestamp: "2025-04-05T11:20:00", isCurrentUser: true }
    ]
  }
];

// mock user data
// const currentUser = {
//   id: 101,
//   name: "Alex Johnson",
//   username: "alex_j",
//   university: "State University",
//   rsos: ["Robotics Club", "Chess Club"]
// };

function Home() {
  const navigate = useNavigate();
  const { currentUser, loading, error } = useCurrentUser(); 
  const [event, setEvent] = useState([]); 
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filter, setFilter] = useState('all');
  const [commentInput, setCommentInput] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [userRatings, setUserRatings] = useState({});

  useEffect(() => {
    // fetch call api
    const timer = setTimeout(() => {
      setEvents(mockEvents);
    }, 500);
    return () => clearTimeout(timer); 
  }, []);

  if (loading) return <div> Loading user data... </div>
  if (error) return <div> Error: {error.message}</div>
  if(!currentUser) return null; 

  // filter
  const filteredEvents = events.filter(event => {
    if (activeTab === 'upcoming') {
      const eventDate = new Date(event.date);
      const now = new Date();
      if (eventDate < now) return false;
    } else if (activeTab === 'past') {
      const eventDate = new Date(event.date);
      const now = new Date();
      if (eventDate >= now) return false;
    }

    if (filter !== 'all' && event.type !== filter) {
      return false;
    }

    if (event.visibility === 'public') {
      return true;
    } else if (event.visibility === 'private' && event.university === currentUser.university) {
      return true;
    } else if (event.visibility === 'rso' && currentUser.rsos.includes(event.rso)) {
      return true;
    }
    return false;
  });

  const handleCommentInputChange = (eventId, value) => {
    setCommentInput({
      ...commentInput,
      [eventId]: value
    });
  };

  const submitComment = (eventId) => {
    if (!commentInput[eventId] || !commentInput[eventId].trim()) return;

    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        const newComment = {
          id: Date.now(), // gen temp id
          userId: currentUser.id,
          username: currentUser.username,
          text: commentInput[eventId],
          timestamp: new Date().toISOString(),
          isCurrentUser: true
        };
        return {
          ...event,
          comments: [...event.comments, newComment]
        };
      }
      return event;
    });

    setEvents(updatedEvents);
    setCommentInput({
      ...commentInput,
      [eventId]: ''
    });
  };

  const deleteComment = (eventId, commentId) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          comments: event.comments.filter(comment => comment.id !== commentId)
        };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  const startEditComment = (eventId, comment) => {
    setEditingComment({
      eventId,
      commentId: comment.id,
      text: comment.text
    });
  };

  const saveEditedComment = () => {
    if (!editingComment) return;
    
    const updatedEvents = events.map(event => {
      if (event.id === editingComment.eventId) {
        return {
          ...event,
          comments: event.comments.map(comment => {
            if (comment.id === editingComment.commentId) {
              return {
                ...comment,
                text: editingComment.text
              };
            }
            return comment;
          })
        };
      }
      return event;
    });
    
    setEvents(updatedEvents);
    setEditingComment(null);
  };

  const handleRating = (eventId, rating) => {
    setUserRatings({
      ...userRatings,
      [eventId]: rating
    });
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shareToSocial = (platform, eventId) => {
    const event = events.find(e => e.id === eventId);
    alert(`Sharing "${event.title}" to ${platform}`);
  };

  // css junk
  const styles = {
    dashboard: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center'
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: '#3f51b5',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '10px',
      fontWeight: 'bold'
    },
    userName: {
      fontWeight: 'bold'
    },
    tabs: {
      display: 'flex',
      borderBottom: '1px solid #ddd',
      marginBottom: '20px'
    },
    tab: {
      padding: '10px 20px',
      cursor: 'pointer',
      borderBottom: '3px solid transparent'
    },
    activeTab: {
      borderBottom: '3px solid #3f51b5',
      fontWeight: 'bold',
      color: '#3f51b5'
    },
    filtersSection: {
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center'
    },
    filterLabel: {
      marginRight: '10px',
      fontWeight: 'bold'
    },
    select: {
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ddd'
    },
    eventsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    eventCard: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    },
    eventHeader: {
      padding: '15px',
      borderBottom: '1px solid #eee',
      backgroundColor: '#f9f9f9'
    },
    eventTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    eventDate: {
      color: '#666',
      fontSize: '14px'
    },
    eventBody: {
      padding: '15px'
    },
    eventLocation: {
      marginBottom: '10px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center'
    },
    eventDescription: {
      marginBottom: '15px',
      fontSize: '14px',
      lineHeight: '1.4'
    },
    badge: {
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      marginRight: '5px',
      marginBottom: '10px'
    },
    publicBadge: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2'
    },
    privateBadge: {
      backgroundColor: '#e8f5e9',
      color: '#388e3c'
    },
    rsoBadge: {
      backgroundColor: '#fff3e0',
      color: '#f57c00'
    },
    ratingContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '10px'
    },
    ratingStars: {
      display: 'flex',
      marginRight: '10px'
    },
    star: {
      cursor: 'pointer',
      color: '#ffd700',
      fontSize: '20px',
      marginRight: '2px'
    },
    ratingText: {
      fontSize: '14px',
      color: '#666'
    },
    commentsSection: {
      marginTop: '15px',
      borderTop: '1px solid #eee',
      paddingTop: '15px'
    },
    commentsList: {
      maxHeight: '200px',
      overflowY: 'auto',
      marginBottom: '15px'
    },
    comment: {
      padding: '10px',
      borderBottom: '1px solid #eee',
      fontSize: '14px'
    },
    commentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '5px'
    },
    commentActions: {
      display: 'flex'
    },
    actionButton: {
      marginLeft: '10px',
      color: '#666',
      cursor: 'pointer',
      fontSize: '12px'
    },
    commentAuthor: {
      fontWeight: 'bold',
      marginRight: '5px'
    },
    commentTimestamp: {
      color: '#999',
      fontSize: '12px'
    },
    commentText: {
      wordBreak: 'break-word'
    },
    commentInputContainer: {
      display: 'flex',
      marginTop: '10px'
    },
    commentInput: {
      flex: '1',
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      resize: 'none'
    },
    commentButton: {
      padding: '8px 15px',
      backgroundColor: '#3f51b5',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      marginLeft: '10px',
      cursor: 'pointer'
    },
    socialShare: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '10px'
    },
    socialButton: {
      marginLeft: '5px',
      padding: '5px 10px',
      fontSize: '12px',
      borderRadius: '4px',
      cursor: 'pointer',
      border: 'none'
    },
    facebookButton: {
      backgroundColor: '#3b5998',
      color: 'white'
    },
    twitterButton: {
      backgroundColor: '#1da1f2',
      color: 'white'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 0',
      color: '#666'
    }
  };

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <h1 style={styles.title}>Student Events Dashboard</h1>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{currentUser.name.charAt(0)}</div>
          <div>
            <div style={styles.userName}>{currentUser.name}</div>
            <div>{currentUser.university}</div>
          </div>
        </div>
      </header>

      <div style={styles.tabs}>
        <div 
          style={{ 
            ...styles.tab, 
            ...(activeTab === 'upcoming' ? styles.activeTab : {}) 
          }}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Events
        </div>
        <div 
          style={{ 
            ...styles.tab, 
            ...(activeTab === 'past' ? styles.activeTab : {}) 
          }}
          onClick={() => setActiveTab('past')}
        >
          Past Events
        </div>
      </div>

      <div style={styles.filtersSection}>
        <span style={styles.filterLabel}>Filter by Type:</span>
        <select 
          style={styles.select} 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="social">Social</option>
          <option value="tech">Tech</option>
          <option value="fundraising">Fundraising</option>
        </select>
      </div>

      <div style={styles.eventsList}>
        {filteredEvents.length === 0 ? (
          <div style={styles.emptyState}>
            <h3>No events found</h3>
            <p>There are no events matching your current filters.</p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event.id} style={styles.eventCard}>
              <div style={styles.eventHeader}>
                <div style={styles.eventTitle}>{event.title}</div>
                <div style={styles.eventDate}>{formatEventDate(event.date)}</div>
              </div>
              <div style={styles.eventBody}>
                <div style={styles.eventLocation}>
                  📍 {event.location}
                </div>
                <div>
                  {event.visibility === 'public' && (
                    <span style={{...styles.badge, ...styles.publicBadge}}>Public</span>
                  )}
                  {event.visibility === 'private' && (
                    <span style={{...styles.badge, ...styles.privateBadge}}>Private</span>
                  )}
                  {event.visibility === 'rso' && (
                    <span style={{...styles.badge, ...styles.rsoBadge}}>{event.rso}</span>
                  )}
                  <span style={{...styles.badge, backgroundColor: '#f3e5f5', color: '#7b1fa2'}}>{event.type}</span>
                </div>
                <div style={styles.eventDescription}>{event.description}</div>
                
                <div style={styles.ratingContainer}>
                  <div style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span 
                        key={star} 
                        style={styles.star}
                        onClick={() => handleRating(event.id, star)}
                      >
                        {(userRatings[event.id] || 0) >= star ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <div style={styles.ratingText}>
                    {event.rating} ({userRatings[event.id] ? `Your rating: ${userRatings[event.id]}` : 'Not rated'})
                  </div>
                </div>
                
                <div style={styles.commentsSection}>
                  <h4>Comments ({event.comments.length})</h4>
                  <div style={styles.commentsList}>
                    {event.comments.map(comment => (
                      <div key={comment.id} style={styles.comment}>
                        <div style={styles.commentHeader}>
                          <div>
                            <span style={styles.commentAuthor}>{comment.username}</span>
                            <span style={styles.commentTimestamp}>
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {comment.isCurrentUser && (
                            <div style={styles.commentActions}>
                              <span 
                                style={styles.actionButton}
                                onClick={() => startEditComment(event.id, comment)}
                              >
                                Edit
                              </span>
                              <span 
                                style={styles.actionButton}
                                onClick={() => deleteComment(event.id, comment.id)}
                              >
                                Delete
                              </span>
                            </div>
                          )}
                        </div>
                        {editingComment && editingComment.commentId === comment.id ? (
                          <div>
                            <textarea 
                              value={editingComment.text}
                              onChange={(e) => setEditingComment({...editingComment, text: e.target.value})}
                              style={styles.commentInput}
                              rows="2"
                            />
                            <div style={{marginTop: '5px'}}>
                              <button 
                                onClick={saveEditedComment}
                                style={{...styles.commentButton, marginRight: '5px'}}
                              >
                                Save
                              </button>
                              <button 
                                onClick={() => setEditingComment(null)}
                                style={{...styles.commentButton, backgroundColor: '#f44336'}}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={styles.commentText}>{comment.text}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={styles.commentInputContainer}>
                    <textarea 
                      placeholder="Add a comment..."
                      style={styles.commentInput}
                      value={commentInput[event.id] || ''}
                      onChange={(e) => handleCommentInputChange(event.id, e.target.value)}
                      rows="2"
                    />
                    <button 
                      style={styles.commentButton}
                      onClick={() => submitComment(event.id)}
                    >
                      Post
                    </button>
                  </div>
                </div>
                
                <div style={styles.socialShare}>
                  <button 
                    style={{...styles.socialButton, ...styles.facebookButton}}
                    onClick={() => shareToSocial('Facebook', event.id)}
                  >
                    Share to Facebook
                  </button>
                  <button 
                    style={{...styles.socialButton, ...styles.twitterButton}}
                    onClick={() => shareToSocial('Twitter', event.id)}
                  >
                    Share to Twitter
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
