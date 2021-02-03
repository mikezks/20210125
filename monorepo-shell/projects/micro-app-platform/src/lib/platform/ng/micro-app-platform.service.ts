import { Version, PlatformRef, NgZone, StaticProvider, Type, NgModuleRef, Injectable } from "@angular/core";
import { getGlobalNamespace } from "../native/global-namespace";

export type MicroAppPlatformType = { microAppPlatformState: MicroAppPlatformState };

export interface NgPlatformBrowser {
  version: Version;
  platformBrowser: PlatformRef;
}

export enum MicroAppType {
  ngLazyLoading = 'ngLazyLoading',
  ngRootComponentLegacy = 'ngRootComponent',
  customElementLegacy = 'customElement',
  modFedLazyLoading = 'modFedLazyLoading',
  modFedNgRootComponent = 'modFedNgRootComponent',
  modFedCustomElement = 'modFedCustomElement'
}

export interface MicroAppDef {
  id: string;
  tagname?: string;
  bootstrapFn?: () => void;
  type: MicroAppType;
}

export type NgZoneType = NgZone | 'zone.js' | 'noop';

export interface MicroAppPlatformState {
  ngZone: NgZoneType;
  ngPlatform: Map<Version, NgPlatformBrowser>;
  microApps: { [id: string]: MicroAppDef };
  loadedResources: { [id: string]: boolean };
}

export class MicroAppPlatformService {

  constructor(private state: MicroAppPlatformState) {}

  getNgZone(): NgZoneType {
    return this.state.ngZone;
  }

  setNgZone(ngZone: NgZoneType): void {
    if (typeof ngZone === 'object') {
      this.state.ngZone = ngZone;
    }
  }

  getMicroApp(id: string): MicroAppDef {
    return this.state.microApps[id];
  }

  getMicroAppBootstrapFn(id: string): () => void {
    return this.state.microApps[id]?.bootstrapFn || (() => {});
  }

  setMicroApp(def: MicroAppDef): void {
    this.state.microApps[def.id] = def;
  }

  isResourceLoaded(resourceUrl: string): boolean {
    return !!this.state.loadedResources[resourceUrl];
  }

  setResourceLoaded(resourceUrl: string): void {
    this.state.loadedResources[resourceUrl] = true;
  }

  getNgPlatform(
    ngPlatformFn: (extraProviders?: StaticProvider[]) => PlatformRef,
    version: Version,
    extraProviders?: StaticProvider[]
  ): PlatformRef {

    if(!this.state.ngPlatform.get(version)) {
      this.state.ngPlatform.set(version, {
        version,
        platformBrowser: ngPlatformFn(extraProviders)
      });
    }

    return this.state.ngPlatform.get(version)?.platformBrowser ||
      ngPlatformFn(extraProviders);
  }

  ngBootstrap<T>(
    ngPlatformFn: (extraProviders?: StaticProvider[]) => PlatformRef,
    bootstrapModule: Type<T>,
    version: Version
  ): Promise<NgModuleRef<T>> {

    return this.getNgPlatform(ngPlatformFn, version, [
      { provide: MicroAppPlatform, useValue: this }
    ]).bootstrapModule(bootstrapModule, { ngZone: this.getNgZone() });
  }
}

export function getMicroAppPlatform(): MicroAppPlatformService {
  const global = getGlobalNamespace<MicroAppPlatformType>();

  if (!global.microAppPlatformState) {
    global.microAppPlatformState = {
      ngZone: 'zone.js',
      ngPlatform: new Map<Version, NgPlatformBrowser>(),
      microApps: {},
      loadedResources: {}
    };
  }

  return new MicroAppPlatformService(global.microAppPlatformState);
}

@Injectable()
export class MicroAppPlatform extends MicroAppPlatformService {}
