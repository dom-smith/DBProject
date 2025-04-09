import { useState, useEffect } from 'react';
import supabase from '../utils/SupabaseClient';

const useEventCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('event_categories')
          .select('*');
        if (error) throw error;
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setErrorCategories(err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);
  console.log(categories)
  return { categories, loadingCategories, errorCategories };
};

export default useEventCategories;
