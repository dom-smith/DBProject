import { useState, useEffect, useCallback } from 'react';
import supabase from '../utils/SupabaseClient';

const useUniversityEvents = (universityName, currentUserId) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [universityId, setUniversityId] = useState(null);

  useEffect(() => {
    if (!universityName) {
      setUniversityId(null);
      return;
    }
    const fetchUniversityId = async () => {
      try {
        const { data, error } = await supabase
          .from('universities')
          .select('university_id')
          .eq('name', universityName)
          .single();
        if (error) throw error;
        setUniversityId(data.university_id);
      } catch (err) {
        console.error('Error fetching university id:', err);
        setError(err);
      }
    };
    fetchUniversityId();
  }, [universityName]);

  const fetchEvents = useCallback(async () => {
    if (!currentUserId) {
      setEvents([]);
      setLoading(false);
      console.log("No current user id available.");
      return;
    }
    try {
      const { data: rsoMemberData, error: rsoMemberError } = await supabase
        .from('rso_members')
        .select('*')
        .eq('user_id', currentUserId);
      if (rsoMemberError) throw rsoMemberError;
      console.log("User ID:", currentUserId);
      console.log("RSO Member Data:", rsoMemberData);
      
      const userRsoIds = rsoMemberData.map(m => m.rso_id);
      if (userRsoIds.length === 0) {
        console.log("User is not a member of any RSOs.");
        setEvents([]);
        setLoading(false);
        return;
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          event_id, 
          name, 
          description, 
          date, 
          created_by, 
          rso_id,
          category_id, 
          location_id, 
          comments:comments(
              comment_id, 
              user_id, 
              comment_text, 
              rating, 
              created_at,
              user:users(email)
          ), 
          creator:users!events_created_by_fkey ( university_id )
        `)
        .in('rso_id', userRsoIds)

        if (eventsError) throw eventsError;
      console.log("Events Data:", eventsData);

      const locationIds = Array.from(new Set(eventsData.map(e => e.location_id)));
      const { data: locationData, error: locationError } = await supabase
        .from('locations')
        .select('*')
        .in('location_id', locationIds);
      if (locationError) throw locationError;
      const locationMap = {};
      locationData.forEach(loc => {
        locationMap[loc.location_id] = loc.name;
      });

      // Fetch event categories.
      const categoryIds = Array.from(new Set(eventsData.map(e => e.category_id)));
      const { data: categoryData, error: categoryError } = await supabase
        .from('event_categories')
        .select('*')
        .in('category_id', categoryIds);
      if (categoryError) throw categoryError;
      const categoryMap = {};
      categoryData.forEach(cat => {
        categoryMap[cat.category_id] = cat.category_name;
      });

      const rsoIds = Array.from(new Set(eventsData.map(e => e.rso_id).filter(id => id != null)));
      const { data: rsoData, error: rsoError } = await supabase
        .from('rsos')
        .select('*')
        .in('rso_id', rsoIds);
      if (rsoError) throw rsoError;
      const rsoMap = {};
      rsoData.forEach(rso => {
        rsoMap[rso.rso_id] = rso.name;
      });
      const filteredEvents = eventsData.filter(e => {
        return e.creator && e.creator.university_id === universityId;
      });

      const formattedEvents = filteredEvents.map(e => {
        let avgRating = 0;
        if (e.comments && e.comments.length > 0) {
          const ratings = e.comments.map(c => c.rating).filter(r => r != null);
          if (ratings.length > 0) {
            avgRating = ratings.reduce((acc, cur) => acc + cur, 0) / ratings.length;
          }
        }
        const formattedComments = e.comments
          ? e.comments.map(c => ({
              id: c.comment_id,
              userId: c.user_id,
              username: c.user && c.user.email ? c.user.email.split('@')[0] : '',
              text: c.comment_text,
              timestamp: c.created_at,
              isCurrentUser: currentUserId ? c.user_id === currentUserId : false
            }))
          : [];
        return {
          id: e.event_id,
          title: e.name,
          description: e.description,
          date: e.date,
          time: e.time,
          location: locationMap[e.location_id] || '',
          type: categoryMap[e.category_id] || '',
          visibility: e.visibility,
          university: universityName,
          rso: e.rso_id ? rsoMap[e.rso_id] : null,
          rating: parseFloat(avgRating.toFixed(1)),
          comments: formattedComments
        };
      });

      setEvents(formattedEvents);
    } catch (err) {
      console.error('Error fetching university events:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [universityId, currentUserId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
};

export default useUniversityEvents;
