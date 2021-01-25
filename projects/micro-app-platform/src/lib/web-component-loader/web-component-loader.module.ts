import { Component, ElementRef, NgModule, Renderer2 } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ngAppendCustomElement } from './ng-append-custom-element';
import { loadScript } from './script-loader';

export function importCustomElement(tagname: string, scriptUrl: string): any {
  @Component({
    selector: 'ce-loader',
    template: ''
  })
  class CustomElementLoaderComponent {
    message = tagname;
    constructor(
      private elem: ElementRef,
      private renderer: Renderer2) {

      scriptUrl && ngAppendCustomElement(this.elem, this.renderer, tagname);
    }
  }

  @NgModule({
    imports: [
      RouterModule.forChild([
        { path: '', component: CustomElementLoaderComponent }
      ])
    ]
  })
  class CustomElementLoaderModule {
    constructor() {
      scriptUrl && loadScript(scriptUrl).then();
    }
  }

  return CustomElementLoaderModule;
}
