import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { LuxAriaBase } from './lux-aria-base';

@Directive({
  selector: '[luxAriaLabel]'
})
export class LuxAriaLabelDirective extends LuxAriaBase {
  _luxAriaLabel: string;

  @Input() luxAriaLabelSelector: string;

  @Input()
  get luxAriaLabel() {
    return this._luxAriaLabel;
  }

  set luxAriaLabel(label: string) {
    this._luxAriaLabel = label;

    this.renderAria();
  }

  constructor(protected elementRef: ElementRef, protected renderer: Renderer2) {
    super(elementRef, renderer, 'aria-label');

    if (!this.luxAriaLabelSelector) {
      const tagName = elementRef.nativeElement.tagName.toLowerCase();
      if (tagName === 'lux-button') {
        this.luxAriaLabelSelector = 'button';
      } else if (tagName === 'lux-app-header-action-nav-item') {
        this.luxAriaLabelSelector = 'button';
      }
    }
  }

  getSelector(): string {
    return this.luxAriaLabelSelector;
  }

  getValue(): string {
    return this._luxAriaLabel;
  }
}
