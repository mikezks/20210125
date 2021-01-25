import { ElementRef, Renderer2 } from "@angular/core";

export function ngAppendCustomElement(
  elem: ElementRef,
  renderer: Renderer2,
  tagname: string
) {
  renderer.appendChild(
    elem.nativeElement,
    renderer.createElement(tagname)
  );
}
