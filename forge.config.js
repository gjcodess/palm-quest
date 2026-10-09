export default {
  packagerConfig: {
    name: 'PALMQuest',
    executableName: 'PALMQuest',
    icon: 'build-resources/app',
    asar: true,
    ignore: [
      /^\/android(?:\/|$)/,
      /^\/docs(?:\/|$)/,
      /^\/output(?:\/|$)/,
      /^\/public(?:\/|$)/,
      /^\/scratch(?:\/|$)/,
      /^\/scripts(?:\/|$)/,
      /^\/src(?:\/|$)/,
      /^\/tmp(?:\/|$)/,
      /^\/test-results(?:\/|$)/,
      /^\/docx-qa-/,
      /^\/node_modules(?:\/|$)/,
      /\.docx$/i,
      /^\/(?:README|USER_MANUAL|ASSET_GENERATION_PROMPTS|walkthrough)/,
      /^\/(?:capacitor\.config\.json|forge\.config\.js|vite\.config\.js|vercel\.json|\.gitignore)$/,
    ],
  },
  makers: [{
    name: '@electron-forge/maker-squirrel',
    config: { name: 'PALMQuest', setupExe: 'PALMQuestSetup.exe', setupIcon: 'build-resources/app.ico' },
  }],
};
