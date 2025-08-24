export async function loadStyles() {
  if (document.querySelector('link[data-test-style-global-link="true"]'))
    return;
  await new Promise<void>((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/global.css';
    link.setAttribute('data-test-style-global-link', 'true');
    link.onload = () => resolve();
    link.onerror = (err : string | Event) => reject(err);
    document.head.appendChild(link);
  });
}
