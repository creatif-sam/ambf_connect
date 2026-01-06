-- Add bio column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add check constraint to limit bio to 100 words
ALTER TABLE profiles 
ADD CONSTRAINT bio_word_limit 
CHECK (
  bio IS NULL OR 
  array_length(string_to_array(trim(bio), ' '), 1) <= 100
);

-- Add comment
COMMENT ON COLUMN profiles.bio IS 'User biography, maximum 100 words';
