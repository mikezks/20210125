
export function loadScript(
  scriptUrl: string,
  element: HTMLElement = document.body): Promise<any> {

  return new Promise<any>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptUrl;

    script.onerror = reject;
    script.onload = () => {
      resolve(scriptUrl);
    }

    element.append(script);
  });
}
