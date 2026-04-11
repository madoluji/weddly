const inlineScript = `
(function() {
  try {
    localStorage.setItem('weddly-theme', 'light');
  } catch (e) {}
  document.documentElement.classList.remove('dark');
})();
`.trim();

export function ThemeScript(): JSX.Element {
  return <script dangerouslySetInnerHTML={{ __html: inlineScript }} />;
}
