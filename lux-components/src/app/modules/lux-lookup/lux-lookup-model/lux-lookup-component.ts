// tslint:disable:max-line-length

import {
  ChangeDetectorRef, Directive,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { LuxBehandlungsOptionenUngueltige, LuxLookupParameters } from './lux-lookup-parameters';
import { LuxLookupTableEntry } from './lux-lookup-table-entry';
import { LuxLookupService } from '../lux-lookup-service/lux-lookup.service';
import { ControlContainer } from '@angular/forms';
import { LuxFormComponentBase } from '../../lux-form/lux-form-model/lux-form-component-base.class';
import { LuxLookupHandlerService } from '../lux-lookup-service/lux-lookup-handler.service';
import { LuxLookupErrorStateMatcher } from './lux-lookup-error-state-matcher';
import { LuxConsoleService } from '../../lux-util/lux-console.service';
import { LuxComponentsConfigService } from '../../lux-components-config/lux-components-config.service';
import { Subscription } from 'rxjs';
import { LuxComponentsConfigParameters } from '../../lux-components-config/lux-components-config-parameters.interface';

@Directive() // Angular 9 (Ivy) ignoriert @Input(), @Output() in Klassen ohne @Directive() oder @Component().
export abstract class LuxLookupComponent extends LuxFormComponentBase implements OnInit, OnChanges, OnDestroy {
  LuxBehandlungsOptionenUngueltige = LuxBehandlungsOptionenUngueltige;

  lookupService: LuxLookupService;
  lookupHandler: LuxLookupHandlerService;
  componentsConfigService: LuxComponentsConfigService;

  stateMatcher: LuxLookupErrorStateMatcher;
  apiPath: string;

  @Input() luxPlaceholder: string;
  @Input() luxLookupId: string;
  @Input() luxTableNo: string;
  @Input() luxRenderProp: any;
  @Input() luxBehandlungUngueltige: LuxBehandlungsOptionenUngueltige = LuxBehandlungsOptionenUngueltige.ausgrauen;
  @Input() luxParameters: LuxLookupParameters;
  @Input() luxCustomStyles;
  @Input() luxCustomInvalidStyles;
  @Input() luxTagId: string;
  @Output() luxDataLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() luxValueChange: EventEmitter<LuxLookupTableEntry | LuxLookupTableEntry[]> = new EventEmitter<
    LuxLookupTableEntry
  >();
  entries: LuxLookupTableEntry[] = [];

  private subscriptions: Subscription[] = [];

  protected constructor(
    lookupService: LuxLookupService,
    lookupHandler: LuxLookupHandlerService,
    controlContainer: ControlContainer,
    cdr: ChangeDetectorRef,
    logger: LuxConsoleService,
    componentsConfigService: LuxComponentsConfigService
  ) {
    super(controlContainer, cdr, logger, componentsConfigService);

    this.lookupService = lookupService;
    this.lookupHandler = lookupHandler;
    this.componentsConfigService = componentsConfigService;
  }

  get luxValue(): any {
    return this.getValue();
  }

  @Input() set luxValue(value: any) {
    this.setValue(value);
  }

  ngOnInit() {
    super.ngOnInit();

    if (!this.luxLookupId) {
      console.error(
        `Die Lookup-Komponente mit der Tabellen-Nr. ${this.luxTableNo} besitzt keine LookupId. Bitte tragen Sie diese nach.`
      );
    }

    this.lookupHandler.addLookupElement(this.luxLookupId);
    this.subscriptions.push(this.lookupHandler.getLookupElementObsv(this.luxLookupId).subscribe(() => {
      this.fetchLookupData();
    }));

    this.subscriptions.push(this.componentsConfigService.config.subscribe(
      (newConfig: LuxComponentsConfigParameters) => {
        this.apiPath = newConfig.lookupServiceUrl;

        this.lookupHandler.reloadData(this.luxLookupId);
      }
    ));
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Gibt zurueck, ob die RenderProperty eine Funktion ist oder nicht.
   *
   * @returns boolean
   */
  isRenderPropAFunction(): boolean {
    return typeof this.luxRenderProp === 'function';
  }

  /**
   * Gibt zurück ob sich das entsprechende Element in der Liste ungültiger Elemente befindet.
   * @param LuxLookupTableEntry entry
   * @returns boolean
   */
  isUngueltig(entry: LuxLookupTableEntry | LuxLookupTableEntry[]) {
    let isUngueltig = false;
    if (entry) {
      if (!Array.isArray(entry)) {
        if (entry.gueltigkeitBis) {
          isUngueltig = Date.now() > +entry.gueltigkeitBis;
        }
      } else {
        entry.forEach(element => {
          if (element.gueltigkeitBis && !isUngueltig) {
            isUngueltig = Date.now() > +element.gueltigkeitBis;
          }
        });
      }
    }

    return isUngueltig;
  }

  /**
   * Gibt zurück ob ungültige Einträge angezeigt werden sollen.
   * @returns boolean
   */
  showUngueltige() {
    return (
      this.luxBehandlungUngueltige === this.LuxBehandlungsOptionenUngueltige.ausgrauen ||
      this.luxBehandlungUngueltige === this.LuxBehandlungsOptionenUngueltige.anzeigen
    );
  }

  /**
   * Gibt zurück ob ungültige Einträge deaktiviert werden sollen.
   * @returns boolean
   */
  disableUngueltige() {
    return this.luxBehandlungUngueltige === this.LuxBehandlungsOptionenUngueltige.ausgrauen;
  }

  /**
   * Gibt die mitgegebenen Styles abhaengig ob das Element invalid ist zurueck.
   * @param boolean invalid
   * @returns LuxLookupOptionStyle
   */
  getStyles(invalid: boolean) {
    if (invalid) {
      return this.luxCustomInvalidStyles ? this.luxCustomInvalidStyles : {};
    }
    return this.luxCustomStyles ? this.luxCustomStyles : {};
  }

  /**
   * @override errorMessageModifier - Modifikation der Fehlermeldung
   * @param value
   * @param errors
   */
  errorMessageModifier(value, errors) {
    if (errors['ungueltig']) {
      return 'Der ausgewählte Wert ist ungültig.';
    }
    return undefined;
  }

  getLabel(entry: any): string {
    if (this.isRenderPropAFunction()) {
      return this.luxRenderProp(entry);
    }
    if (entry[this.luxRenderProp as string]) {
      return entry[<string>this.luxRenderProp];
    }
    return 'Fehler beim Auslesen (Property unbekannt)';
  }

  /**
   * Holt die Lookup-Table Daten vom Backend
   */
  protected fetchLookupData() {
    const backendRequest = this.lookupService.getLookupTable(this.luxTableNo, this.luxParameters, this.apiPath);
    this.subscriptions.push(backendRequest.subscribe(
      (entries: LuxLookupTableEntry[]) => {
        this.setLookupData(entries);
        this.luxDataLoaded.emit(true);
      },
      () => {
        this.luxDataLoaded.emit(false);
      }
    ));
  }

  /**
   * Setzt die aktuellen Werte auf die mitgegebenen Entries.
   * @param entries
   */
  protected setLookupData(entries: LuxLookupTableEntry[]) {
    this.entries = entries;
    if (this.entries) {
      // Merken welche Eintraege ungueltig sind, um bei vielen Informationen
      // nicht die ganzen Funktionsaufrufe zu haben
      this.entries.forEach((entry: LuxLookupTableEntry) => {
        entry.isUngueltig = this.isUngueltig(entry);
      });
    }
  }

  // region Overridden methods
  notifyFormValueChanged(formValue: any) {
    this.luxValueChange.emit(formValue);
  }

  protected triggerOutputPatternCheck() {
    this.checkOutputPatternViolation(this.luxValueChange.observers);
  }

  protected triggerInputPatternCheck(simpleChanges: SimpleChanges) {
    this.checkInputPatternViolation(simpleChanges.luxValue);
  }

  // endregion
}
