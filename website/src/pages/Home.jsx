import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import supabase from '../utils/SupabaseClient';
import useCurrentUser from '../hooks/useCurrentUser';
import useUniversityEvents from '../hooks/useUniversityEvents';
import useEventCategories from '../hooks/useEventCategories';

function Home() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null); 
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filter, setFilter] = useState('all');
  const [commentInput, setCommentInput] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [userRatings, setUserRatings] = useState({});
  const { currentUser, loading: loadingUser, error: userError } = useCurrentUser();
  const { events, loading: loadingEvents, error, refetch: refetchEvents } = useUniversityEvents(
    currentUser ? currentUser.university : null,
    currentUser ? currentUser.id : null
  );
  const { categories, loading: loadingCategories, error: categoriesError } = useEventCategories(); 

  useEffect(() => {
    // Redirects user on logout
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login'); 
      } else if (event === 'SIGNED_IN') {
        setSession(session); 
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (loadingUser) return <div>Loading...</div>
  else if (userError) return <div>Error:</div>
  else if (!currentUser) return <div>Could not retrieve user</div>

  // Filter events based on current active tab and type.
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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/login'); 
    } else {
      console.error("Error logging out:", error);
    }
  };

  const handleCommentInputChange = (eventId, value) => {
    setCommentInput({
      ...commentInput,
      [eventId]: value
    });
  };

  const submitComment = async (eventId) => {
    if (!commentInput[eventId] || !commentInput[eventId].trim()) {
      return; 
    }
    // Create new comment object 
    const newComment = {
      event_id: eventId, 
      user_id: currentUser.id, 
      comment_text: commentInput[eventId]
    };
    // Insert new comment into db 
    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .insert(newComment); 

    if (commentError) {
      console.error("Error submitting comment:", commentError);
    } else {
      refetchEvents(); // Update comments
      setCommentInput({ ...commentInput, [eventId]: '' }); // Clear input after posting comment
    }
  };

  const deleteComment = async (eventId, commentId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('comment_id', commentId); 

    if (error) {
      console.error("Error deleting the comment:", error); 
    } else {
      refetchEvents();
    }
  };

  const startEditComment = (eventId, comment) => {
    setEditingComment({
      eventId,
      commentId: comment.id,
      text: comment.text
    });
  };

  const saveEditedComment = async () => {
    if (!editingComment) return;
    const { error } = await supabase
      .from('comments')
      .update({ comment_text: editingComment.text })
      .eq('comment_id', editingComment.commentId);
    
    if (error) {
      console.error("Error updating comment:", error);
    } else {
      refetchEvents();
      setEditingComment(null);
    }
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

  // NEW: Updated function to handle leaving an RSO.
  // It first retrieves the rso's id by querying the `rsos` table using the rso name,
  // then it deletes the corresponding entry from the `rso_members` table.
  const handleLeaveRSO = async (rsoName) => {
    const confirmLeave = window.confirm(`Are you sure you want to leave ${rsoName}?`);
    if (!confirmLeave) return;

    // Retrieve the rso id from the rsos table using its name.
    const { data: rsoData, error: rsoError } = await supabase
      .from('rsos')
      .select('rso_id')
      .eq('name', rsoName)
      .single();

    if (rsoError || !rsoData) {
      console.error("Error retrieving RSO information:", rsoError);
      alert("An error occurred while retrieving RSO information.");
      return;
    }

    const { rso_id } = rsoData;

    // Remove the user from the RSO by deleting the record in the rso_members table.
    const { error: removeError } = await supabase
      .from('rso_members')
      .delete()
      .eq('rso_id', rso_id)
      .eq('user_id', currentUser.id);

    if (removeError) {
      console.error("Error leaving the RSO:", removeError);
      alert("Failed to leave RSO. Please try again.");
    } else {
      alert(`You have successfully left ${rsoName}.`);
      // Optionally, update any relevant state or re-fetch user data to reflect this change.
    }
  };

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
    logout: {
      backgroundColor: '#1da1f2',
      color: 'white',
      fontSize: '12px', 
      borderRadius: '4px', 
      cursor: 'pointer', 
      border: '0px',
      height: '20px'
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
    },
    // NEW: Style for the Leave RSO button.
    leaveButton: {
      backgroundColor: '#f44336',
      color: 'white',
      fontSize: '12px',
      borderRadius: '4px',
      cursor: 'pointer',
      border: 'none',
      padding: '5px 10px',
      marginTop: '10px'
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
            <button 
              style={styles.logout}
              onClick={handleLogout}
            >
              Logout
            </button>
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
        <div 
          style={{ 
            ...styles.tab, 
            ...(activeTab === 'myrsos' ? styles.activeTab : {}) 
          }}
          onClick={() => setActiveTab('myrsos')}
        >
          My RSOs
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
          {!loadingCategories && !categoriesError && categories.map(cat => (
            <option key={cat.category_id} value={cat.category_name}>
              {cat.category_name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.eventsList}>
        {activeTab === 'myrsos' ? (
          currentUser.rsos && currentUser.rsos.length > 0 ? (
            currentUser.rsos.map((club, index) => (
              <div key={index} style={styles.eventCard}>
                <div style={styles.eventHeader}>
                  <div style={styles.eventTitle}>{club}</div>
                </div>
                {/* Leave RSO Button */}
                <div style={{ padding: '15px' }}>
                  <button 
                    style={styles.leaveButton} 
                    onClick={() => handleLeaveRSO(club)}
                  >
                    Leave RSO
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>
              <h3>No RSOs found</h3>
              <p>You're not part of any RSOs yet.</p>
            </div>
          )
        ) : (
          filteredEvents.length === 0 ? (
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
                  <div style={styles.eventLocation}>📍 {event.location}</div>
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
                    <span style={{...styles.badge, backgroundColor: '#f3e5f5', color: '#7b1fa2'}}>
                      {event.type}
                    </span>
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
                                onChange={(e) => setEditingComment({ ...editingComment, text: e.target.value })}
                                style={styles.commentInput}
                                rows="2"
                              />
                              <div style={{ marginTop: '5px' }}>
                                <button 
                                  onClick={saveEditedComment}
                                  style={{ ...styles.commentButton, marginRight: '5px' }}
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingComment(null)}
                                  style={{ ...styles.commentButton, backgroundColor: '#f44336' }}
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
                      style={{ ...styles.socialButton, ...styles.facebookButton }}
                      onClick={() => shareToSocial('Facebook', event.id)}
                    >
                      Share to Facebook
                    </button>
                    <button 
                      style={{ ...styles.socialButton, ...styles.twitterButton }}
                      onClick={() => shareToSocial('Twitter', event.id)}
                    >
                      Share to Twitter
                    </button>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

export default Home;
