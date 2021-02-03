import { AbstractRenderer } from "./abstract-renderer";
import { NativeBrowserRenderer } from "./native-browser-renderer";

export function loadScript(
  scriptUrl: string,
  parent: HTMLElement = document.head,
  renderer: AbstractRenderer = new NativeBrowserRenderer()): Promise<HTMLScriptElement> {

  return new Promise<HTMLScriptElement>((resolve, reject) => {
    !scriptUrl && reject();
    const script = renderer.createElement('script') as HTMLScriptElement;
    script.src = scriptUrl;
    script.onerror = reject;
    script.onload = () => resolve(script);
    renderer.appendChild(parent, script);
  });
}
