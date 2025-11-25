# Azure Speech Configuration for GitHub Actions

After pushing this code, you need to add Azure Speech credentials to GitHub Secrets:

1. Go to: https://github.com/billy0917/mandarin-3d-quest/settings/secrets/actions

2. Click "New repository secret" and add these two secrets:

   **Secret 1:**
   - Name: `VITE_AZURE_SPEECH_KEY`
   - Value: (Your Azure Speech subscription key from Azure Portal)

   **Secret 2:**
   - Name: `VITE_AZURE_SPEECH_REGION`
   - Value: `southeastasia` (or your Azure region)

3. Once added, the next deployment will have Azure TTS working!

## Available Chinese Voices

You can change the voice in `utils/sound.ts`:

### Mainland Chinese (普通话):
- `zh-CN-XiaoxiaoNeural` (female, default) - Natural and clear
- `zh-CN-YunxiNeural` (male) - Friendly male voice
- `zh-CN-XiaoyiNeural` (female) - Young female voice
- `zh-CN-YunjianNeural` (male) - Professional male voice

### Taiwan Mandarin (台灣國語):
- `zh-TW-HsiaoChenNeural` (female) - Taiwan accent
- `zh-TW-YunJheNeural` (male) - Taiwan accent
- `zh-TW-HsiaoYuNeural` (female) - Taiwan accent

Change line 24 in `utils/sound.ts` to switch voices.
