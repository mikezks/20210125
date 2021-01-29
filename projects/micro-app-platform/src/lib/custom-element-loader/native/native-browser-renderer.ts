import { AbstractRenderer } from "./abstract-renderer";

export class NativeBrowserRenderer implements AbstractRenderer {
  appendChild(parent: HTMLElement, element: HTMLElement): void {
    parent.appendChild(element);
  }

  createElement(name: string): HTMLElement {
    return document.createElement(name);
  }

  parentNode(element: any): HTMLElement {
    return element.parentNode;
  }

  removeChild(parent: HTMLElement, element: HTMLElement): void {
    parent.removeChild(element);
  }
}
