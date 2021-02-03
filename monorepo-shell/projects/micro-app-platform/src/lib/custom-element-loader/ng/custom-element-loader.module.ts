import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, InjectionToken, NgModule, Renderer2, RendererFactory2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MicroAppPlatform, MicroAppType } from '../../platform';
import { appendElement } from '../native/append-element';
import { loadScript } from '../native/script-loader';
import { loadStyles } from '../native/styles-loader';

export interface ImportCustomElementConfig<T> {
  tagname: string;
  scriptUrl: T,
  stylesUrl?: T
}

export const isImportCustomElementConfig = <T>(
  stringOrConfig: string | ImportCustomElementConfig<T>
): stringOrConfig is ImportCustomElementConfig<T> =>
  typeof (stringOrConfig as ImportCustomElementConfig<T>) === 'object' &&
  (stringOrConfig as ImportCustomElementConfig<T>).tagname !== undefined;

export function importCustomElement(config: ImportCustomElementConfig<string | string[]>): any;
export function importCustomElement(
  tagname: string,
  scriptUrl: string | string[],
  stylesUrl?: string | string[]): any;

export function importCustomElement(
  tagnameOrConfig: string | ImportCustomElementConfig<string | string[]>,
  scriptUrl: string | string[] = [],
  stylesUrl: string | string[] = []): any {

  const config = ((cfg, normalizeUrl) => ({
    ...cfg,
    scriptUrl: normalizeUrl(cfg.scriptUrl),
    stylesUrl: normalizeUrl(cfg.stylesUrl)
  }))(
    isImportCustomElementConfig(tagnameOrConfig) ?
      tagnameOrConfig :
      {
        tagname: tagnameOrConfig,
        scriptUrl: scriptUrl,
        stylesUrl: stylesUrl
      },
    (url : string | string[] = []) => url instanceof Array ? url : (url ? [ url ] : [])
  );

  const ASYNC_SCRIPT_LOADER = new InjectionToken<Promise<HTMLElement[]>>('ASYNC_SCRIPT_LOADER');

  @Component({
    selector: 'ce-loader',
    template: ''
  })
  class CustomElementLoaderComponent {
    constructor(
      private elem: ElementRef,
      private renderer: Renderer2,
      @Inject(ASYNC_SCRIPT_LOADER) scripts: Promise<HTMLElement[]>,
      private microAppPlatform: MicroAppPlatform) {

      scripts.then(_ => {
        config.tagname && appendElement(this.elem.nativeElement, config.tagname, this.renderer);
      }).then(_ => {
        [MicroAppType.ngRootComponentLegacy, MicroAppType.modFedNgRootComponent].find(t =>
          t === this.microAppPlatform.getMicroApp(config.tagname)?.type
        ) && this.microAppPlatform.getMicroAppBootstrapFn(config.tagname)()
      });
    }
  }

  const loadAllResources = (
    doc: Document,
    rendererFactory: RendererFactory2
  ) => ((renderer) =>
    Promise.all([
      ...config.scriptUrl.map(script => loadScript(script, doc.head, renderer)),
      ...config.stylesUrl.map(styles => loadStyles(styles, doc.head, renderer))
    ])
  )(rendererFactory.createRenderer(null, null));

  @NgModule({
    imports: [
      RouterModule.forChild([
        { path: '', component: CustomElementLoaderComponent, pathMatch: 'full' }
      ])
    ],
    providers: [
      {
        provide: ASYNC_SCRIPT_LOADER,
        useFactory: loadAllResources,
        deps: [DOCUMENT, RendererFactory2]
      }
    ]
  })
  class CustomElementLoaderModule {}

  return CustomElementLoaderModule;
}
