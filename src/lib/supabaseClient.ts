import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to check if user is authenticated
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Helper function to sign in with Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // redirectTo: 'http://localhost:5173/auth/callback',
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

// Helper function to sign in with Apple
export const signInWithApple = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: window.location.origin,
    },
  });
  return { data, error };
};

// Clothing Items CRUD operations
export const getClothingItems = async (userId: string) => {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const createClothingItem = async (
  item: Database['public']['Tables']['wardrobe_items']['Insert']
) => {
  // Ensure user is authenticated before attempting to insert
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: { message: 'User not authenticated' } };
  }

  // Ensure the item has the user_id set correctly and clean up the data
  const itemWithUserId = {
    user_id: user.id,
    name: item.name?.trim() || '',
    category: item.category?.trim() || '',
    color: item.color?.trim() || null,
    image_url: item.image_url || '',
    seasons: Array.isArray(item.seasons) ? item.seasons : [],
    occasions: Array.isArray(item.occasions) ? item.occasions : [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    notes: item.notes?.trim() || null,
    location: item.location?.trim() || null,
  };

  const { data, error } = await supabase
    .from('wardrobe_items')
    .insert(itemWithUserId)
    .select()
    .single();

  if (error) {
    console.error('🔧 Database insert error:', error);
  } else {
    console.log('🔧 Successfully inserted item:', data);
  }

  return { data, error };
};

export const updateClothingItem = async (
  id: string,
  updates: Database['public']['Tables']['wardrobe_items']['Update']
) => {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
};

export const deleteClothingItem = async (id: string) => {
  const { error } = await supabase.from('wardrobe_items').delete().eq('id', id);

  return { error };
};

// Outfits CRUD operations
export const getOutfits = async (userId: string) => {
  const { data, error } = await supabase
    .from('outfits')
    .select(
      `
      *,
      outfit_items (
        clothing_item_id,
        wardrobe_items (*)
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const createOutfit = async (
  outfit: Database['public']['Tables']['outfits']['Insert'],
  clothingItemIds: string[]
) => {
  const { data: outfitData, error: outfitError } = await supabase
    .from('outfits')
    .insert(outfit)
    .select()
    .single();

  if (outfitError || !outfitData) {
    return { data: null, error: outfitError };
  }

  // Add clothing items to the outfit
  const outfitItems = clothingItemIds.map(itemId => ({
    outfit_id: outfitData.id,
    clothing_item_id: itemId,
  }));

  const { error: itemsError } = await supabase
    .from('outfit_items')
    .insert(outfitItems);

  if (itemsError) {
    return { data: null, error: itemsError };
  }

  return { data: outfitData, error: null };
};

export const deleteOutfit = async (id: string) => {
  // Delete outfit items first (due to foreign key constraint)
  await supabase.from('outfit_items').delete().eq('outfit_id', id);

  // Then delete the outfit
  const { error } = await supabase.from('outfits').delete().eq('id', id);

  return { error };
};

// Upload image to Supabase Storage
export const uploadImage = async (file: File) => {
  // Step 1: Retrieve the authenticated user's uid
  const { data: user } = await supabase.auth.getUser();
  if (!user || !user.user) {
    console.error('User not authenticated');
    throw new Error('User not authenticated');
  }
  const userId = user.user.id;

  // Step 2: Extract file extension
  const fileExt = file.name.split('.').pop();

  // Step 3: Construct the file path
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  // Step 4: Upload the file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('wardrobe-images')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Upload Error:', uploadError);
    console.error(
      'Upload Error Details:',
      JSON.stringify(uploadError, null, 2)
    );
    return { data: null, error: uploadError };
  }

  // Step 5: Generate a public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from('wardrobe-images')
    .getPublicUrl(uploadData.path);

  if (!publicUrlData.publicUrl) {
    console.error('Failed to generate public URL');
    return null;
  }

  // Step 6: Return the result with the public URL
  return {
    data: { path: uploadData.path, publicUrl: publicUrlData.publicUrl },
    error: null,
  };
};
