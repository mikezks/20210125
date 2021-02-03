import { Renderer2, RendererFactory2 } from "@angular/core";
import { MicroAppPlatform, MicroAppType } from "../../platform/ng/micro-app-platform.service";
import { AbstractRenderer } from "../native/abstract-renderer";
import { loadScript } from "../native/script-loader";
import { loadStyles } from "../native/styles-loader";

export interface ImportCustomElementConfig<T> {
  tagname: string;
  scriptUrl: T,
  stylesUrl?: T
}

const setResourcesLoaded = (
  doc: Document,
  microAppPlatform: MicroAppPlatform
): void => {
  if (!microAppPlatform.isResourceLoaded('init')) {
    [...doc.getElementsByTagName('script') as unknown as HTMLScriptElement[]]
      .forEach(script =>
        microAppPlatform.setResourceLoaded(script.src)
      );

    [...doc.getElementsByTagName('link') as unknown as HTMLLinkElement[]]
      .forEach(style =>
        microAppPlatform.setResourceLoaded(style.href)
      );
  }
  microAppPlatform.setResourceLoaded('init');
}

const load = <L>(urls: string[], loadFn: (url: string, parent: HTMLElement,
  renderer: AbstractRenderer) => Promise<L>, urlFn: (e: L) => string,
  doc: Document, renderer: Renderer2, microAppPlatform: MicroAppPlatform
): Promise<L>[] => urls
  .filter(res => !microAppPlatform.isResourceLoaded(res))
  .map(res => loadFn(res, doc.head, renderer).then(res => {
    microAppPlatform.setResourceLoaded(urlFn(res as L));
    return res as L;
  }));

export const isImportCustomElementConfig = <T>(
  stringOrConfig: string | ImportCustomElementConfig<T>
): stringOrConfig is ImportCustomElementConfig<T> =>
  typeof (stringOrConfig as ImportCustomElementConfig<T>) === 'object' &&
  (stringOrConfig as ImportCustomElementConfig<T>).tagname !== undefined;


export const normalizeConfig = (
  tagnameOrConfig: string | ImportCustomElementConfig<string | string[]>,
  scriptUrl: string | string[] = [],
  stylesUrl: string | string[] = []
) => ((cfg, normalizeUrl) => ({
  ...cfg,
  scriptUrl: normalizeUrl(cfg.scriptUrl),
  stylesUrl: normalizeUrl(cfg.stylesUrl)
}))(isImportCustomElementConfig(tagnameOrConfig) ?
  tagnameOrConfig :
  {
    tagname: tagnameOrConfig,
    scriptUrl: scriptUrl,
    stylesUrl: stylesUrl
  },
  (url : string | string[] = []) => url instanceof Array ? url : (url ? [ url ] : [])
);

export const loadAllResources = (
  doc: Document,
  rendererFactory: RendererFactory2,
  microAppPlatform: MicroAppPlatform,
  config: ImportCustomElementConfig<string[]>
) => ((renderer) => {
  setResourcesLoaded(doc, microAppPlatform);

  return Promise.all([
    ...load(config.scriptUrl, loadScript, (e: HTMLScriptElement) => e.src,
      doc, renderer, microAppPlatform),
    ...load(config.stylesUrl as string[], loadStyles, (e: HTMLLinkElement) => e.href,
      doc, renderer, microAppPlatform)
  ] as Promise<HTMLScriptElement | HTMLLinkElement>[]);
})(rendererFactory.createRenderer(null, null));

export const bootstrapNgRootComponent = (
  microAppPlatform: MicroAppPlatform,
  config: ImportCustomElementConfig<string[]>
) =>
  [MicroAppType.ngRootComponentLegacy, MicroAppType.modFedNgRootComponent]
    .find(type =>
      type === microAppPlatform.getMicroApp(config.tagname)?.type
    ) && microAppPlatform.getMicroAppBootstrapFn(config.tagname)()
