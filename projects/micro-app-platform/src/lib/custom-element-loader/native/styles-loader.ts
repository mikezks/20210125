import { AbstractRenderer } from "./abstract-renderer";
import { NativeBrowserRenderer } from "./native-browser-renderer";

export function loadStyles(
  stylesUrl: string,
  parent: HTMLElement = document.head,
  renderer: AbstractRenderer = new NativeBrowserRenderer()): Promise<any> {

  return new Promise<HTMLLinkElement>((resolve, reject) => {
    const link = renderer.createElement('link') as HTMLLinkElement;
    link.rel = 'stylesheet';
    link.href = stylesUrl;
    link.onerror = reject;
    link.onload = () => resolve(link);
    renderer.appendChild(parent, link);
  });
}
