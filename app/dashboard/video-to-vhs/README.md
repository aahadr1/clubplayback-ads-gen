# Video to VHS Tool

## Overview

The Video to VHS tool applies authentic VHS tape degradation effects to modern digital videos without using AI models. It leverages browser-native APIs (Canvas API and MediaRecorder API) for real-time video processing.

## Features

### VHS Effects Applied

1. **Chromatic Aberration** (0-10)
   - Simulates the color channel misalignment typical of VHS tapes
   - Red channel shifts left, blue channel shifts right
   - Creates the iconic color bleeding effect

2. **Color Adjustments**
   - **Saturation** (0-200%): Reduces color intensity for that washed-out look
   - **Brightness** (0-200%): Controls overall luminosity
   - **Contrast** (0-200%): Enhances or reduces contrast
   - **Color Shift** (-10 to +10): Negative = cool/blue (digital camcorder), Positive = warm/magenta (VHS)

3. **Noise/Grain** (0-100)
   - Adds random pixel noise to simulate tape degradation
   - Higher values create a "snowy" effect

4. **Scan Lines** (0-100)
   - Horizontal lines mimicking CRT display
   - Adjustable intensity

5. **Tracking Errors** (0-10)
   - Simulates VHS tracking issues
   - Creates horizontal glitches and line displacement
   - Random placement for authenticity

6. **Ghosting** (0-10)
   - Frame-to-frame blending effect
   - Simulates tape afterimages
   - Creates trailing motion blur

7. **Image Processing**
   - **Blur** (0-5px): Softens the image like analog video
   - **Sharpen** (0-10): Counter-balance for selective sharpening

8. **Vignette** (0-100)
   - Darkens corners and edges
   - Simulates lens and tape quality degradation

9. **Date Stamp**
   - Optional customizable timestamp overlay
   - VHS-style courier font
   - Positioned in bottom-left corner

10. **Target FPS** (15-60)
   - Adjustable frame rate per preset
   - 60 FPS = smooth modern/digital feel
   - 30 FPS = standard camcorder
   - 20-24 FPS = degraded/choppy tape feel
   - 15 FPS = extreme lo-fi

## Presets

### Clean (60 FPS)
Early 2000s digital camcorder quality (480p-720p era). Smooth and clean with minimal degradation.
- 60 FPS for ultra-smooth playback
- Minimal noise (3%), light blur (0.3px)
- Slight color warmth, subtle vignette
- No scan lines, no chromatic aberration
- Ideal for: Modern content with subtle vintage touch, Y2K aesthetic, smooth clean retro look

### Authentic (30 FPS)
Old digital camcorder / cheap phone camera quality. Soft and slightly cool-toned.
**Based on real camcorder analysis:**
- 30 FPS standard camcorder rate
- Soft/cheap lens effect (blur: 1.0px)
- Cool/blue color dominant (negative color shift)
- Low noise (~8, not ultra-VHS)
- Desaturated (85%)
- 1-2 pixel chromatic aberration for cheap sensor effect
- No interlacing, no ghosting (digital)
- Ideal for: 90s-2000s camcorder aesthetic, home video look, found footage

### Worn (24 FPS)
Heavily used VHS tape with significant degradation.
- 24 FPS for cinematic/worn tape feel
- High noise (35%) and scan lines (50%)
- Strong chromatic aberration (6px)
- Noticeable tracking errors and ghosting
- Ideal for: 80s aesthetic, found footage style, analog horror

### Degraded (20 FPS)
Extreme VHS degradation, like a tape played thousands of times.
- 20 FPS for very choppy playback
- Maximum noise (60%) and artifacts (70% scan lines)
- Heavy tracking errors (8) and ghosting (9)
- Strong color shift and contrast
- Ideal for: Horror aesthetic, experimental videos, retro-futuristic content, extreme lo-fi

## Technical Implementation

### Architecture

The tool uses a client-side processing approach with three main components:

1. **VideoUploadZone Component**
   - Handles video file upload via drag-and-drop or file picker
   - Validates file size (up to 500MB)
   - Displays upload progress
   - Supports: MP4, WebM, MOV formats

2. **VHSProcessor Class**
   - Frame-by-frame video processing
   - Applies effects using Canvas 2D API
   - Pure JavaScript implementation (no AI models)
   - Maintains state for effects like ghosting

3. **MediaRecorder API**
   - Captures processed canvas stream
   - Encodes to WebM format with VP9 codec
   - 5 Mbps bitrate for quality output
   - 30 FPS processing rate

### Processing Pipeline

```
1. Video Upload → VideoUploadZone
2. Load video metadata (dimensions, duration)
3. Initialize canvas matching video dimensions
4. Create VHSProcessor instance with selected settings
5. Start MediaRecorder on canvas stream
6. For each frame:
   a. Draw frame to canvas
   b. Apply color adjustments
   c. Apply chromatic aberration
   d. Apply noise
   e. Apply ghosting
   f. Apply blur
   g. Apply scan lines
   h. Apply tracking errors
   i. Apply vignette
   j. Apply date stamp (if enabled)
7. MediaRecorder captures processed frames
8. On completion, generate downloadable WebM file
```

### Performance Considerations

- **Client-side processing**: No server upload required
- **Real-time preview**: See effects before processing
- **Memory efficient**: Processes frames in sequence
- **Browser-native**: No external dependencies or WebAssembly
- **Progressive output**: Shows progress percentage

### Browser Compatibility

- ✅ Chrome/Edge 85+
- ✅ Firefox 78+
- ✅ Safari 14.1+
- ⚠️ Mobile browsers (limited by file size and memory)

### Output Format

- **Container**: WebM
- **Video Codec**: VP9
- **Bitrate**: 5 Mbps
- **Frame Rate**: 30 FPS (matches processing)
- **Resolution**: Matches input video

## Usage

1. **Upload Video**: Drag and drop or click to select a video file
2. **Select Preset**: Choose from Clean, Authentic, Worn, or Degraded
3. **Adjust Settings** (Optional): Open Advanced Settings to fine-tune each effect
4. **Apply Effect**: Click "Apply VHS Effect" button
5. **Preview**: Watch the processed video in the preview panel
6. **Download**: Click "Download" to save the processed video

## Advanced Settings

All effects can be individually adjusted in the Advanced Settings panel:

### Color & Quality
- Saturation, Brightness, Contrast, Color Shift

### VHS Artifacts
- Chromatic Aberration, Noise, Scan Lines, Tracking Error, Ghosting

### Effects
- Blur, Vignette, Date Stamp (with custom text)

## Best Practices

1. **File Size**: Keep videos under 500MB for best performance
2. **Resolution**: 1080p or lower recommended for faster processing
3. **Duration**: Longer videos will take more time to process
4. **Preset First**: Start with a preset, then fine-tune
5. **Memory**: Close other tabs for large video files
6. **Date Stamp**: Use period-appropriate dates for authenticity

## Keyboard Shortcuts

- `Cmd/Ctrl + V`: Navigate to Video to VHS tool
- `Cmd/Ctrl + B`: Toggle sidebar

## Troubleshooting

### Video won't upload
- Check file size (max 500MB)
- Ensure format is MP4, WebM, or MOV
- Try a different browser

### Processing is slow
- Reduce video resolution
- Shorten video duration
- Close other browser tabs
- Try a different browser (Chrome/Edge recommended)

### Output quality is poor
- Original video quality matters
- Some degradation is intentional (VHS effect)
- Try the "Clean" preset for less degradation

### Browser crashes
- Video file too large
- Reduce resolution before upload
- Use shorter video clips

## Future Enhancements

Potential features for future versions:
- Adjustable output resolution
- Multiple export formats (MP4, AVI)
- Batch processing
- Custom preset saving
- Real-time preview during processing
- Audio distortion effects
- More era-specific presets (70s, 80s, 90s)

