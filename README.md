# ClubPlayback - AI Image Generator

A modern, minimalist web application for generating stunning AI images using Google's nano-banana model (Gemini 2.5 Flash Image) via Replicate API.

## Features

- 🎨 **AI Image Generation**: Create images using natural language prompts
- 🖼️ **Multi-Image Fusion**: Use reference images to guide generation
- ⚙️ **Customizable Settings**: Control aspect ratio and output format
- 📊 **Generation History**: View and manage all your past generations
- 🔐 **Secure Authentication**: Powered by Supabase Auth
- 🌙 **Dark Mode**: Beautiful UI that works in light and dark themes
- 📱 **Responsive Design**: Works perfectly on all devices
- ⚡ **Real-time Updates**: See your generations appear instantly

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Model**: Google nano-banana via Replicate
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- A Replicate API account

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "clubplayback ads generator"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the following SQL:

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

-- Create index for better performance
CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);
```

3. Go to **Settings** → **API** and copy:
   - Project URL
   - Anon/Public Key

### 4. Set Up Replicate

1. Sign up at [replicate.com](https://replicate.com)
2. Go to your account settings and get your API token

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
REPLICATE_API_TOKEN=your_replicate_api_token
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Authentication

1. Navigate to the login page
2. Sign up with your email and password
3. Check your email for confirmation (in development, check Supabase dashboard)
4. Sign in after confirmation

### Generating Images

1. Go to **Image Gen** from the sidebar
2. Enter a detailed prompt describing your desired image
3. (Optional) Upload reference images to guide the generation
4. Select aspect ratio and output format
5. Click **Generate Image**
6. Wait for the model to create your image
7. Download or view in the Tasks page

### Viewing History

1. Go to **Tasks** from the sidebar
2. Browse all your past generations
3. Filter by status or search by prompt
4. Click on any generation to view details
5. Download images directly from the detail view

## Model Information

This application uses **Google's nano-banana model** (Gemini 2.5 Flash Image):

- **Character & Style Consistency**: Maintain the same elements across generations
- **Multi-Image Fusion**: Blend multiple reference images
- **Conversational Editing**: Make precise edits with natural language
- **Visual Reasoning**: Understands complex instructions
- **Fast Generation**: 2-3x faster than comparable models

### Model Capabilities

- Generate images from text descriptions
- Edit existing images with prompts
- Maintain character/object consistency
- Understand spatial relationships
- Process hand-drawn diagrams
- Support multiple aspect ratios

## Project Structure

```
clubplayback ads generator/
├── app/
│   ├── api/
│   │   └── generate/          # API route for image generation
│   ├── auth/
│   │   └── login/             # Authentication page
│   ├── dashboard/
│   │   ├── image-gen/         # Image generation interface
│   │   ├── tasks/             # Generation history
│   │   └── page.tsx           # Dashboard home
│   ├── globals.css            # Global styles
│   └── layout.tsx             # Root layout
├── components/
│   ├── Header.tsx             # Top navigation bar
│   └── Sidebar.tsx            # Collapsible sidebar
├── lib/
│   ├── supabase.ts            # Supabase client & types
│   └── store.ts               # Zustand state management
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables in Production

Make sure to add all environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `REPLICATE_API_TOKEN`

## Troubleshooting

### Images not generating
- Check your Replicate API token
- Ensure you have credits in your Replicate account
- Check browser console for errors

### Authentication issues
- Verify Supabase environment variables
- Check email confirmation status
- Review Supabase Auth settings

### Database errors
- Ensure RLS policies are set up correctly
- Verify the generations table exists
- Check user permissions

## Future Enhancements

- [ ] Image editing capabilities
- [ ] Batch generation
- [ ] Custom model parameters
- [ ] Image collections/folders
- [ ] Sharing capabilities
- [ ] Export options (bulk download)
- [ ] Advanced filters and sorting
- [ ] Generation templates

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
- Create an issue in the repository
- Check Supabase documentation
- Review Replicate API docs

---

Built with ❤️ using Next.js and Google's nano-banana model

