import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/SupabaseClient';

export default function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
          console.log(userData);

        if (userError) throw userError;

        const { data: uniData, error: uniError } = await supabase
          .from('universities')
          .select('name')
          .eq('university_id', userData.university_id)
          .single();

        if (uniError) throw uniError;

        const { data: rsoMemberData, error: rsoMemberError } = await supabase
          .from('rso_members')
          .select('rso_id')
          .eq('user_id', userData.user_id);

        if (rsoMemberError) throw rsoMemberError;

        const rsoIds = rsoMemberData.map(row => row.rso_id);

        let rsoNames = [];
        if (rsoIds.length > 0) {
          const { data: rsoData, error: rsoError } = await supabase
            .from('rsos')
            .select('name')
            .in('rso_id', rsoIds);
          if (rsoError) throw rsoError;
          rsoNames = rsoData.map(r => r.name);
        }
        console.log(userData)
        setCurrentUser({
          id: userData.user_id,
          name: userData.name,
          username: userData.email,
          university: uniData.name,
          rsos: rsoNames,
          role: userData.role
        });
      } catch (err) {
        console.error("Error fetching current user:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [navigate]);
  console.log(currentUser)
  return { currentUser, loading, error };
}
