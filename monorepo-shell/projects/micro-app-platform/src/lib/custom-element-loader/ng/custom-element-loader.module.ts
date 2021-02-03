import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, InjectionToken, NgModule, Renderer2, RendererFactory2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MicroAppPlatform } from '../../platform';
import { appendElement } from '../native/append-element';
import { bootstrapNgRootComponent, ImportCustomElementConfig, loadAllResources, normalizeConfig } from './custom-element-loader.utils';


export function importCustomElement(config: ImportCustomElementConfig<string | string[]>): any;
export function importCustomElement(
  tagname: string,
  scriptUrl: string | string[],
  stylesUrl?: string | string[]): any;

export function importCustomElement(
  tagnameOrConfig: string | ImportCustomElementConfig<string | string[]>,
  scriptUrl: string | string[] = [],
  stylesUrl: string | string[] = []): any {

  const config = normalizeConfig(tagnameOrConfig, scriptUrl, stylesUrl)
  const ASYNC_SCRIPT_LOADER = new InjectionToken<Promise<HTMLElement[]>>('ASYNC_SCRIPT_LOADER');

  @Component({ selector: 'ce-loader', template: '' })
  class CustomElementLoaderComponent {
    constructor(
      private elem: ElementRef,
      private renderer: Renderer2,
      @Inject(ASYNC_SCRIPT_LOADER) scripts: Promise<HTMLElement[]>,
      private microAppPlatform: MicroAppPlatform) {

      scripts
        .then(_ => { config.tagname &&
          appendElement(this.elem.nativeElement, config.tagname, this.renderer);
        }).then(_ =>
          bootstrapNgRootComponent(this.microAppPlatform, config)
        );
    }
  }

  @NgModule({
    imports: [ RouterModule.forChild([{
      path: '', component: CustomElementLoaderComponent, pathMatch: 'full'
    }])],
    providers: [{
      provide: ASYNC_SCRIPT_LOADER,
      useFactory:
        (d: Document, r: RendererFactory2, m: MicroAppPlatform) =>
        loadAllResources(d, r, m, config),
      deps: [DOCUMENT, RendererFactory2, MicroAppPlatform]
    }]
  })
  class CustomElementLoaderModule {}

  return CustomElementLoaderModule;
}
