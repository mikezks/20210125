import { AbstractRenderer } from "./abstract-renderer";
import { NativeBrowserRenderer } from "./native-browser-renderer";
import { loadScript } from "./script-loader";

export function appendElement(
  parent: HTMLElement,
  tagname: string,
  renderer: AbstractRenderer = new NativeBrowserRenderer()
): Promise<HTMLElement> {

  const element = renderer.createElement(tagname);
  renderer.appendChild(parent, element);

  // Load dummy script with content '0' to provide Promise
  return loadScript('data:text/plain;charset=utf-8;base64,MA==', parent)
    .then(script => renderer.removeChild(parent, script))
    .then(_ => element);
}
