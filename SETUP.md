# Quick Setup Guide

Follow these steps to get your ClubPlayback AI Image Generator up and running in minutes.

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Replicate API account

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### Create a New Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned (~2 minutes)

### Set Up the Database

1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query and paste the following SQL:

```sql
-- Create generations table
CREATE TABLE generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  image_inputs TEXT[],
  aspect_ratio TEXT,
  output_format TEXT,
  output_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Enable Row Level Security
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own generations"
  ON generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations"
  ON generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
  ON generations FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
```

3. Click **RUN** to execute the SQL

### Get Your API Keys

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Set Up Replicate

1. Sign up at [replicate.com](https://replicate.com)
2. Go to your account settings
3. Navigate to **API Tokens**
4. Create a new token or copy your existing one
5. Make sure you have credits (you get free credits on signup)

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step 5: Configure Supabase Auth (Optional but Recommended)

### Enable Email Confirmation (Production)

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production URL (e.g., `https://yourdomain.com`)
3. Add your production URL to **Redirect URLs**

### For Development (Disable Email Confirmation)

1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Toggle off **Enable email confirmations**

This allows you to sign up and log in immediately during development.

## Step 6: Run the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 7: Create Your First Account

1. You'll be redirected to the login page
2. Click **"Don't have an account? Sign up"**
3. Enter your email and password
4. If email confirmation is enabled, check your email. Otherwise, you can log in immediately!

## Testing the Application

### Generate Your First Image

1. Click **Image Gen** in the sidebar
2. Enter a prompt like: *"A serene mountain landscape at sunset with vibrant colors"*
3. Select aspect ratio (e.g., 16:9)
4. Choose output format (JPG recommended)
5. Click **Generate Image**
6. Wait ~10-30 seconds for generation
7. Download or view your image!

### View Your History

1. Click **Tasks** in the sidebar
2. See all your generated images
3. Click on any image to view details
4. Download images directly from the history

## Keyboard Shortcuts

- `⌘/Ctrl + B` - Toggle sidebar
- `⌘/Ctrl + H` - Go to home
- `⌘/Ctrl + G` - Go to image generation
- `⌘/Ctrl + T` - Go to tasks

## Troubleshooting

### "Failed to generate image"
- Check your Replicate API token
- Ensure you have credits in your Replicate account
- Check the browser console for detailed errors

### "Authentication error"
- Verify your Supabase URL and anon key
- Check that the `.env.local` file is in the project root
- Restart the dev server after changing env vars

### "Database error"
- Ensure the SQL script ran successfully
- Check that RLS policies are enabled
- Verify you're logged in with a valid user

### Images not showing
- Check that the Replicate API is returning valid URLs
- Verify the `next.config.js` has the correct image domains
- Check browser console for CORS errors

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `REPLICATE_API_TOKEN`
5. Deploy!

### Update Supabase for Production

1. Go to Supabase **Authentication** → **URL Configuration**
2. Update **Site URL** to your Vercel domain
3. Add your Vercel domain to **Redirect URLs**

## Cost Estimates

### Supabase
- **Free tier**: 500MB database, 50MB file storage, 2GB bandwidth
- Should be sufficient for personal use or small teams

### Replicate
- **nano-banana model**: ~$0.02-0.05 per generation
- You get free credits on signup
- Monitor usage in your Replicate dashboard

## Next Steps

- Customize the UI colors in `tailwind.config.ts`
- Add more features (batch generation, favorites, etc.)
- Set up monitoring and analytics
- Configure email templates in Supabase

## Support

If you run into issues:
1. Check the console for errors
2. Review the [Supabase docs](https://supabase.com/docs)
3. Check the [Replicate docs](https://replicate.com/docs)
4. Open an issue in the repository

Happy generating! 🎨✨

