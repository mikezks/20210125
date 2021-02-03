
export abstract class AbstractRenderer {
  abstract appendChild(parent: HTMLElement, element: HTMLElement): void;
  abstract createElement(name: string): HTMLElement;
  abstract parentNode(element: any): HTMLElement;
  abstract removeChild(parent: HTMLElement, element: HTMLElement): void;
}
