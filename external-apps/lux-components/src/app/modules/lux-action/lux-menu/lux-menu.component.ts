import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChild
} from '@angular/core';
import { Subscription } from 'rxjs';
import { LuxMenuItemComponent } from './lux-menu-subcomponents/lux-menu-item.component';
import { LuxMenuTriggerComponent } from './lux-menu-subcomponents/lux-menu-trigger.component';

// @dynamic Erklärung steht in der Datei "lux-decorators.ts".
@Component({
  selector: 'lux-menu',
  templateUrl: './lux-menu.component.html',
  styleUrls: ['./lux-menu.component.scss']
})
export class LuxMenuComponent implements AfterViewChecked, OnDestroy {
  // Diese Werte müssen angepasst werden, sollte das Styling dieser Component entsprechend geändert worden sein
  static readonly PADDING_PX = 16;
  static readonly MARGIN_PX = 8;
  static readonly FONT_PX = 14;
  static readonly ICON_PX = 22;

  // Alle verfgb. MenuItems als Array
  private _menuItems: LuxMenuItemComponent[] = [];

  // Das Canvas wird genutzt um die Breite potentieller MenuItem-Texte zu berechnen
  private readonly canvas;

  private menuItemSubscriptions: Subscription[] = [];
  private menuItemChangeSubscription: Subscription;

  hideToggle: boolean = false;

  @ViewChild('defaultTrigger', { read: ElementRef }) defaultTriggerElRef: ElementRef;
  @ViewChild('menuTrigger', { read: ElementRef }) menuTriggerElRef: ElementRef;
  @ViewChild('menuExtendedContainer', { read: ElementRef, static: true }) menuExtendedContainer: ElementRef;
  @ContentChildren(LuxMenuItemComponent) luxMenuItemComponents: QueryList<LuxMenuItemComponent>;
  @ContentChild(LuxMenuTriggerComponent) luxMenuTriggerComponent: LuxMenuTriggerComponent;

  @Output() luxMenuClosed: EventEmitter<void> = new EventEmitter<void>();

  @Input() luxMenuIconName: string = 'menu';
  @Input() luxClassName: string;
  @Input() luxTagId: string;
  @Input() luxToggleDisabled: boolean = false;

  _luxDisplayExtended: boolean = false;

  get luxDisplayExtended() {
    return this._luxDisplayExtended;
  }

  @Input() set luxDisplayExtended(value: boolean) {
    this._luxDisplayExtended = value;

    if (this.menuTriggerElRef) {
      this.updateExtendedMenuItems();
    }
  }

  @Input() luxDisplayMenuLeft: boolean = true;
  @Input() luxMaximumExtended: number = 5;

  @HostListener('window:resize') windowResize() {
    this.updateExtendedMenuItems();
  }

  get menuItems(): LuxMenuItemComponent[] {
    return this._menuItems;
  }

  set menuItems(menuItems: LuxMenuItemComponent[]) {
    this._menuItems = menuItems ? menuItems : [];

    this.menuItems.forEach(item => {
      this.menuItemSubscriptions.push(
        item.luxHiddenChange.subscribe(() => {
          this.updateExtendedMenuItems();
        })
      );
      this.menuItemSubscriptions.push(
        item.luxAlwaysVisibleChange.subscribe(() => {
          this.updateExtendedMenuItems();
        })
      );
      this.menuItemSubscriptions.push(
        item.luxHideLabelIfExtendedChange.subscribe(() => {
          this.updateExtendedMenuItems();
        })
      );
    });

    this.cdr.detectChanges();
  }

  constructor(private cdr: ChangeDetectorRef) {
    this.canvas = document.createElement('canvas');
  }

  ngAfterViewChecked() {
    if (!this.menuItemChangeSubscription) {
      this.menuItemChangeSubscription = this.luxMenuItemComponents.changes.subscribe(() => {
        this.menuItems = this.luxMenuItemComponents.toArray();
        this.calculateMenuItemWidths();
      });
    }

    this.menuItems = this.luxMenuItemComponents.toArray();
    this.calculateMenuItemWidths();
    this.updateExtendedMenuItems();
  }

  ngOnDestroy(): void {
    this.menuItemChangeSubscription.unsubscribe();

    this.menuItemSubscriptions.forEach(menuItemSubscription => {
      menuItemSubscription.unsubscribe();
    });
  }

  /**
   * Wird beim Klick auf ein MenuItem aufgerufen.
   *
   * @param menuItem
   * @param $event
   */
  menuItemClicked(menuItem: LuxMenuItemComponent, $event) {
    menuItem.clicked($event);
  }

  /**
   * Wird nach dem Schließen des Menus aufgerufen und emitted die Output-Property.
   * Setzt den Fokus auf den Default-Trigger (Custom-Trigger => eigene Verantwortung).
   */
  onMenuClosed() {
    this.luxMenuClosed.emit();
    if (this.defaultTriggerElRef) {
      (<any>this.defaultTriggerElRef.nativeElement.children.item(0)).focus();
    }
  }

  /**
   * Berechnet anhand der verfügbaren Breite des Containers (CSS-Class: lux-menu-extended) und der maximalen Anzahl an
   * extended MenuItems die Anzahl an möglichen MenuItems, die außerhalb des eigentlichen Menus dargestellt werden können.
   */
  updateExtendedMenuItems() {
    if (!this.luxDisplayExtended) {
      this.hideToggle = false;
      this.menuItems.forEach((menuItem: LuxMenuItemComponent) => {
        menuItem.extended = false;
      });
      return;
    }

    const menuTriggerWidth = this.menuTriggerElRef.nativeElement.offsetWidth;

    let availableWidth: number = this.menuExtendedContainer.nativeElement.offsetWidth;
    let count: number = 0;

    availableWidth -= menuTriggerWidth;

    // mit condition sind hier die Zustände luxVisible = true || false gemeint
    for (const condition of [true, false]) {
      for (let i = this.menuItems.length - 1; i >= 0; i--) {
        const menuItem = this.menuItems[i];

        if (menuItem.luxHidden) {
          continue;
        }

        if (menuItem.luxAlwaysVisible === condition) {
          // Wenn es das letzte Menüitem ist, wird geprüft, ob es anstelle des
          // Menüitemtriggers dargestellt werden kann.
          if (i === 0 && availableWidth + menuTriggerWidth >= menuItem.width) {
            availableWidth += menuTriggerWidth;
          }

          availableWidth -= menuItem.width;

          if (availableWidth >= 0 && count < this.luxMaximumExtended) {
            menuItem.extended = true;
            count++;
          } else {
            menuItem.extended = false;
          }
        }
      }
    }

    // die Anzahl der extended dargestellten Items der Gesamtzahl entspricht blenden wir den Toggle aus
    const extendedMenuItemCount = this.menuItems.filter(
      (item: LuxMenuItemComponent) => item.extended && !item.luxHidden
    ).length;
    const visibleMenuItemCount = this.menuItems.filter((item: LuxMenuItemComponent) => !item.luxHidden).length;
    this.hideToggle = extendedMenuItemCount === visibleMenuItemCount;
    this.cdr.detectChanges();
  }

  /**
   * Berechnet die Breite für jedes Menuitem und speichert diese abhängig davon ob das Item immer sichtbar sein soll oder nicht
   * in 2 verschiedenen Maps.
   */
  private calculateMenuItemWidths() {
    this.menuItems.forEach((menuItem: LuxMenuItemComponent) => {
      menuItem.extended = false;
      menuItem.width = this.getMenuItemWidth(menuItem);
    });
  }

  /**
   * Gibt die berechnete Breite des MenuItems zurück.
   * Diese setzt sich aus dem Padding (links und rechts, je 16px), dem Icon (wenn vorhanden, 15px) und der berechneten
   * Textbreite zusammen.
   * @param menuItem
   */
  private getMenuItemWidth(menuItem: LuxMenuItemComponent): number {
    if (!menuItem) {
      return 0;
    }

    return (
      LuxMenuComponent.PADDING_PX +
      (menuItem.luxIconName ? LuxMenuComponent.ICON_PX : 0) +
      (!menuItem.luxHideLabelIfExtended ? this.getTextWidth(menuItem.luxLabel) : 0) +
      LuxMenuComponent.MARGIN_PX
    );
  }

  /**
   * Berechnet mithilfe eines Canvas-Objekts die Breite eines einzelnen Textes
   * @param text
   */
  private getTextWidth(text): number {
    if (!text) {
      return 0;
    }

    const canvas = this.canvas;
    const context = canvas.getContext('2d');
    context.font = `${LuxMenuComponent.FONT_PX}px sans-serif`;
    const metrics = context.measureText(text);

    // zusätzlich nutzen wir hier einen Standard-Offset von 20px
    return metrics.width + 20;
  }

  hasVisibleMenuItems(): boolean {
    let hasVisibleMenuItems = false;

    for (let i = 0; i < this.menuItems.length; i++) {
      const element = this.menuItems[i];

      if (!element.luxHidden && !element.extended) {
        hasVisibleMenuItems = true;
        break;
      }
    }

    return hasVisibleMenuItems;
  }
}
