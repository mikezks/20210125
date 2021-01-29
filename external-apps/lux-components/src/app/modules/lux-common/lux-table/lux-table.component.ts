// tslint:disable:member-ordering
import {
  AfterViewInit,
  Component,
  ContentChildren,
  DoCheck,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild
} from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { ICustomCSSConfig } from './lux-table-custom-css-config.interface';
import { LuxTableDataSource } from './lux-table-data-source';
import { ILuxTableHttpDaoStructure } from './lux-table-http/lux-table-http-dao-structure.interface';
import { ILuxTableHttpDao } from './lux-table-http/lux-table-http-dao.interface';
import { of, Subject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { LuxUtil } from '../../lux-util/lux-util';
import { LuxPaginatorIntl } from '../../lux-util/lux-paginator-intl';
import { LuxMediaQueryObserverService } from '../../lux-util/lux-media-query-observer.service';
import { LuxTableColumnComponent } from './lux-table-subcomponents/lux-table-column.component';
import { LuxConsoleService } from '../../lux-util/lux-console.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { LuxInputComponent } from '../../lux-form/lux-input/lux-input.component';

@Component({
  selector: 'lux-table',
  templateUrl: './lux-table.component.html',
  styleUrls: ['./lux-table.component.scss'],
  providers: [{ provide: MatPaginatorIntl, useClass: LuxPaginatorIntl }]
})
export class LuxTableComponent implements OnInit, AfterViewInit, DoCheck, OnDestroy {
  static AUTO_PAGINATION_START: number = 100; // 100 Elemente bis automatisch die Pagination aktiviert wird

  private _luxClasses: ICustomCSSConfig | ICustomCSSConfig[] = [];
  private _luxShowPagination: boolean = false;
  private _dataColumnDefs: string[] = [];
  private _luxMultiSelect: boolean;
  private _luxShowFilter: boolean = false;
  private _dataSource: LuxTableDataSource<any> = new LuxTableDataSource<any>([]);
  private _luxPickValue = o => o;
  private _luxCompareWith = (o1, o2) => o1 === o2;

  private previousWidth: number;
  private previousHeight: number;
  private httpRequestConf: { page?; pageSize?; filter?; sort?; order? } = {};

  private mediaQuerySubscription: Subscription;
  private httpDaoSubscription: Subscription;
  private filterChangedSubscription: Subscription;
  private columnSubscriptions: Subscription[] = [];
  private tableColumnsChangedSubscription: Subscription;
  private sortChangedSubscription: Subscription;
  private paginatorPageSubscription: Subscription;
  private selectedSubscription: Subscription;

  filtered$: Subject<string> = new Subject<string>();
  currentCustomClasses: { entry: any; classes: string }[] = [];
  isLoadingResults: boolean;
  isIE: boolean = false;
  allSelected: boolean;
  mediaQuery: string;
  movedTableColumns: LuxTableColumnComponent[] = [];
  tableMinWidth: string;
  tableHeightCSSCalc: string;

  @Input() luxColWidthsPercent: number[] = [];
  @Input() luxFilterText: string = 'Filter';
  @Input() luxNoDataText: string = 'Keine Daten gefunden.';
  @Input() luxPageSize: number = 10;
  @Input() luxPageSizeOptions = [5, 10, 25, 50];
  @Input() luxHttpDAO: ILuxTableHttpDao;
  @Input() luxMinWidthPx: number = -1;
  @Input() luxAutoPaginate: boolean = true;
  @Input() luxHideBorders: boolean = false;

  @Output() luxSelectedChange: EventEmitter<any[]> = new EventEmitter<any[]>();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('paginator', { read: ElementRef, static: true }) paginatorElement: ElementRef;
  @ViewChild('filter', { read: ElementRef, static: true }) filterElement: ElementRef;
  @ViewChild('filter', { static: true }) filterComponent: LuxInputComponent;
  @ViewChild('tableContainer', { read: ElementRef, static: true }) tableContainerElement: ElementRef;
  @ContentChildren(LuxTableColumnComponent) tableColumns: QueryList<LuxTableColumnComponent>;

  // region Setter/Getters
  get luxClasses(): ICustomCSSConfig | ICustomCSSConfig[] {
    return this._luxClasses;
  }

  @Input() set luxClasses(classes: ICustomCSSConfig | ICustomCSSConfig[]) {
    if (classes && !Array.isArray(classes)) {
      classes = [classes];
    }

    this._luxClasses = classes;
    this.insertCustomCSSClasses();
  }

  get luxShowPagination(): boolean {
    return this._luxShowPagination;
  }

  @Input() set luxShowPagination(show: boolean) {
    this._luxShowPagination = show;
    setTimeout(() => {
      this.handlePagination();
    });
  }

  get luxShowFilter(): boolean {
    return this._luxShowFilter;
  }

  @Input() set luxShowFilter(show: boolean) {
    this._luxShowFilter = show;
    this.handleFilter();
  }

  get dataColumnDefs(): string[] {
    return this._dataColumnDefs;
  }

  get dataSource(): LuxTableDataSource<any> {
    return this._dataSource;
  }

  get luxData(): any[] {
    return this.dataSource.data;
  }

  @Input()
  set luxData(data: any[]) {
    data = data ? data : [];
    this.dataSource.data = data;
    if (this.dataSource) {
      setTimeout(() => {
        this.updateDataSourceAttributes(data);
        this.handleSort();
        this.insertCustomCSSClasses();
        this.updateColumnsByMediaQuery();
        this.calculateProportions();
        this.updateSelection();
      });
    }
  }

  get luxMultiSelect(): boolean {
    return this._luxMultiSelect;
  }

  @Input() set luxMultiSelect(multiSelect: boolean) {
    this._luxMultiSelect = multiSelect;
    if (this.luxMultiSelect) {
      this.luxSelected.clear();
      this._dataColumnDefs.unshift('multiSelect');
    } else {
      this._dataColumnDefs = this._dataColumnDefs.filter((col: string) => col !== 'multiSelect');
    }

    setTimeout(() => {
      this.calculateProportions();
    });
  }

  private _luxSelected: Set<any> = new Set();

  get luxSelected(): Set<any> {
    return this._luxSelected;
  }

  /**
   * Die Auswahl der Selektierten Elemente ist eigentlich ein Set,
   * nimmt aber Arrays von Außen entgegen (zur Vereinfachung).
   * @param selected
   */
  @Input() set luxSelected(selected: Set<any>) {
    this.luxSelected.clear();
    if (selected) {
      selected.forEach(entry => {
        this.luxSelected.add(entry);
      });
    }
    if (this.luxData && this.luxData.length > 0) {
      this.updateSelection();
    }
  }

  get luxPickValue() {
    return this._luxPickValue;
  }

  // Funktion, um den zu vergleichenden Wert aus den einzelnen Objekten zu ziehen.
  // Standardmäßig einfach das Objekt zurückgeben.
  @Input() set luxPickValue(pickFn) {
    this._luxPickValue = pickFn ? pickFn : o => o;
  }

  get luxCompareWith() {
    return this._luxCompareWith;
  }

  // Vergleichsfunktion; vergleicht standardmäßig einfach die Referenzen der beiden Objekte.
  @Input() set luxCompareWith(compareFn) {
    this._luxCompareWith = compareFn ? compareFn : (o1, o2) => o1 === o2;
  }

  /**
   * Eigene Implementierung der Filterung für diese Tabelle.
   * Iteriert über die Values des einzelnen Objektes und prüft dann ob der Filter-Wert irgendwo vorkommt.
   * @param data
   * @param filter
   */
  private customFilterPredicate = (data: any, filter: string = '') => {
    for (const property in data) {
      if (data.hasOwnProperty(property)) {
        const dataEntry = data[property];
        if (LuxUtil.isDate(dataEntry)) {
          if (
            dataEntry
              .toLocaleString()
              .toLowerCase()
              .indexOf(filter) > -1
          ) {
            return true;
          }
        } else {
          if ((dataEntry + '').toLowerCase().indexOf(filter) > -1) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // endregion

  constructor(
    private queryObserver: LuxMediaQueryObserverService,
    private luxConsole: LuxConsoleService,
    private liveAnnouncer: LiveAnnouncer
  ) {
    // Datasource um eigene Filter-Funktionalitaet ergaenzen
    this.dataSource.filterPredicate = this.customFilterPredicate;

    this.isIE = LuxUtil.isIEorEdge();

    this.mediaQuerySubscription = this.queryObserver.getMediaQueryChangedAsObservable().subscribe((query: string) => {
      this.mediaQuery = query;
      this.updateColumnsByMediaQuery();
    });
  }

  ngOnInit() {
    setTimeout(() => {
      if (this.luxHttpDAO) {
        this.loadHttpDAOData();
      } else {
        this.updateDataSourceAttributes(this.luxData);
        this.handleSort();
        this.insertCustomCSSClasses();
      }
    });
  }

  ngAfterViewInit() {
    if (this.tableColumns) {
      // Für den Fall das Spalten wegfallen/dazu kommen
      this.tableColumnsChangedSubscription = this.tableColumns.changes.subscribe(() => {
        this.updateColumnsByMediaQuery();
        this.updateColumnSubscriptions();
      });

      // Für den Fall das sich Änderungen innerhalb der Spalten ergeben
      this.updateColumnSubscriptions();

      // Nach dem Init sollten einmal die Spalten aktualisiert werden
      setTimeout(() => {
        this.updateColumnsByMediaQuery();
      });
    }

    if (this.luxShowPagination) {
      this.handlePagination();
    }
  }

  ngDoCheck() {
    if (
      this.tableContainerElement.nativeElement.offsetWidth !== this.previousWidth ||
      this.tableContainerElement.nativeElement.offsetHeight !== this.previousHeight
    ) {
      this.previousWidth = this.tableContainerElement.nativeElement.offsetWidth;
      this.previousHeight = this.tableContainerElement.nativeElement.offsetHeight;

      this.calculateProportions();
    }
  }

  ngOnDestroy() {
    // Subscriptions auflösen
    this.columnSubscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    if (this.httpDaoSubscription) {
      this.httpDaoSubscription.unsubscribe();
    }
    if (this.filterChangedSubscription) {
      this.filterChangedSubscription.unsubscribe();
    }
    if (this.tableColumnsChangedSubscription) {
      this.tableColumnsChangedSubscription.unsubscribe();
    }
    if (this.sortChangedSubscription) {
      this.sortChangedSubscription.unsubscribe();
    }
    if (this.paginatorPageSubscription) {
      this.paginatorPageSubscription.unsubscribe();
    }
    if (this.selectedSubscription) {
      this.selectedSubscription.unsubscribe();
    }
  }

  /**
   * Zieht sich die aktuellen CSS-Klassen aus den zugewiesenen
   * CSS-Klassen.
   * @param row
   * @returns string
   */
  getCustomClassesForIndex(row: any): string {
    const customClasses = this.currentCustomClasses.find(value => value.entry === row);
    return customClasses ? customClasses.classes : '';
  }

  /**
   * TrackBy-Funktion um die Tabelle etwas schneller zu machen.
   * @param index
   * @param item
   */
  trackFn(index, item) {
    return index;
  }

  /**
   * Wird beim Klick auf eine Row aufgerufen und handelt das Sichern und Entfernen von
   * selektierten Einträgen.
   * @param entry
   */
  changeSelectedEntry(entry: any) {
    if (this.luxMultiSelect) {
      if (this.luxSelected.has(entry)) {
        this.luxSelected.delete(entry);
      } else {
        this.luxSelected.add(entry);
      }
    } else {
      if (this.luxSelected.has(entry)) {
        // Wenn der selektierte Eintrag erneut angeklickt wird,
        // wird die Selektion entfernt.
        this.luxSelected.clear();
      } else {
        this.luxSelected.clear();
        this.luxSelected.add(entry);
      }
    }

    this.luxSelectedChange.next(Array.from(this.luxSelected));
    this.dataSource.selectedEntries = this.luxSelected;
    this.allSelected = this.checkFilteredAllSelected();
  }

  /**
   * Selektiert/Deselektiert alle Einträge in dieser Tabelle.
   *
   * Voraussetzung dafür ist, das Multiselect aktiv ist und keine Http-Table vorliegt.
   */
  changeSelectedEntries() {
    if (this.luxMultiSelect && !this.luxHttpDAO) {
      if (this.checkFilteredAllSelected()) {
        this.dataSource.filteredData.forEach((dataEntry: any) => this.luxSelected.delete(dataEntry));
      } else {
        this.dataSource.filteredData.forEach((dataEntry: any) => this.luxSelected.add(dataEntry));
      }
      this.luxSelectedChange.next(Array.from(this.luxSelected));
      this.dataSource.selectedEntries = this.luxSelected;
      this.allSelected = this.checkFilteredAllSelected();
    }
  }

  /**
   * Prüft ob die aktuell angezeigten Einträge alle selektiert sind oder nicht.
   */
  checkFilteredAllSelected(): boolean {
    let result = true;
    if (this.luxSelected.size === 0) {
      result = false;
    } else {
      // Prüfen ob die gefilterten Daten selected sind
      this.dataSource.filteredData.forEach((dataEntry: any) => {
        if (!this.luxSelected.has(dataEntry)) {
          result = false;
        }
      });
    }

    return result;
  }

  /**
   * Gibt zurück, ob irgendein Footer-Element für diese Tabelle aktuell sichtbar ist.
   */
  anyFootersAvailable() {
    return this.luxMultiSelect || !!this.tableColumns.find((column: LuxTableColumnComponent) => !!column.footer);
  }

  /**
   * Aktualisiert die DataSource und evtl. Subscriptions sowie die CustomCSS-Classes
   * nach einer Änderung.
   */
  private updateDataSourceAttributes(data: any[]) {
    if (!this.luxHttpDAO && this.luxAutoPaginate && data && data.length > LuxTableComponent.AUTO_PAGINATION_START) {
      this.luxShowPagination = true;
    }
    if (!this.luxHttpDAO) {
      if (this.luxShowPagination) {
        this.handlePagination();
      }
    }
    if (!this.luxHttpDAO) {
      this.dataSource.sort = this.sort;
    }
    if (!this.luxHttpDAO) {
      this.dataSource.totalElements = this.dataSource.data ? this.dataSource.data.length : 0;
    }
  }

  /**
   * Prueft anhand der mitgegebenen Callbacks die CSS-Klassen
   * fuer die einzelnen Rows.
   */
  private insertCustomCSSClasses() {
    if (this.luxClasses && this.dataSource.data) {
      this.currentCustomClasses = [];
      this.dataSource.data.forEach((entry: any, i: number) => {
        let classes = '';
        (<ICustomCSSConfig[]>this.luxClasses).forEach((cssClass: ICustomCSSConfig) => {
          if (cssClass.check(entry)) {
            classes += cssClass.class + ' ';
          }
        });
        this.currentCustomClasses.push({ entry: entry, classes: classes });
      });
    }
  }

  /**
   * Gibt das Aria-Label für die Sortierung der Spalten-Überschrift zurück.
   * @param tableColumnDef
   */
  getAriaSortingLabel(tableColumnDef: string) {
    if (this.sort.active === tableColumnDef) {
      if (this.sort.direction === 'asc') {
        return 'aufsteigend sortiert';
      }
      if (this.sort.direction === 'desc') {
        return 'absteigend sortiert';
      }
    }
    return 'nicht sortiert';
  }

  /**
   * Gibt über den liveAnnouncer eine Nachricht aus, dass sich die Sortierung einer Spalte geändert hat.
   * @param $event
   */
  announceSortChange($event: Sort) {
    const index = this.tableColumns
      .toArray()
      .findIndex((tableColumn: LuxTableColumnComponent) => $event.active === tableColumn.luxColumnDef);
    let columnDef = index > -1 ? this.tableColumns.toArray()[index].luxColumnDef : null;
    if (columnDef === null) {
      columnDef = $event.active === 'multiSelect' ? 'multiSelect' : null;
    }
    if (columnDef !== null) {
      let directionDescription;
      switch ($event.direction) {
        case 'desc':
          directionDescription = 'absteigend';
          break;
        case 'asc':
          directionDescription = 'aufsteigend';
          break;
        case '':
          directionDescription = 'nicht mehr';
          break;
      }
      this.liveAnnouncer.announce(`Spalte ${columnDef} sortiert nun ${directionDescription}`, 'assertive');
    }
  }

  /**
   * Aktualisiert die momentan angezeigten Spalten anhand der für sie definierten
   * Responsive-Queries und Verhaltensweisen.
   */
  private updateColumnsByMediaQuery() {
    if (!this.tableColumns) {
      return;
    }

    this._dataColumnDefs = [];

    // wenn Multiselect, dann benötigen wir hier noch eine Spalte mehr
    if (this.luxMultiSelect) {
      this._dataColumnDefs.push('multiSelect');
    }

    this.tableColumns.forEach((column: LuxTableColumnComponent) => this._dataColumnDefs.push(column.luxColumnDef));
    this.movedTableColumns = [];
    // Zuerst die auszublendenden Spalten durchgehen
    this.tableColumns.forEach((tableColumn: LuxTableColumnComponent) => {
      if (
        (tableColumn.luxResponsiveAt && !tableColumn.luxResponsiveBehaviour) ||
        (!tableColumn.luxResponsiveAt && tableColumn.luxResponsiveBehaviour)
      ) {
        this.luxConsole.error(
          `Achtung! Die Column '${tableColumn.luxColumnDef}' hat entweder keine Media-Queries ` +
            `oder kein Responsive-Verhalten zugewiesen bekommen.`
        );
      } else if (this.doesResponsiveAtApply(tableColumn.luxResponsiveAt)) {
        // Schauen, ob eine Spalte angegeben wurde, in welche sich diese hier verschieben kann
        if (this._dataColumnDefs.find((column: string) => column === tableColumn.luxResponsiveBehaviour)) {
          // Wenn ja, die Spalte merken und vorerst ausblenden
          this.movedTableColumns.push(tableColumn);
        }

        this._dataColumnDefs = this.dataColumnDefs.filter(
          (dataColumn: string) => dataColumn !== tableColumn.luxColumnDef
        );
      }
    });
  }

  /**
   * Prüft ob die aktuelle MediaQuery mit der übergebenen MediaQuery/den übergebenen MediaQueries übereinstimmt.
   * @param responsiveAt
   */
  private doesResponsiveAtApply(responsiveAt: string | string[]) {
    const mediaQueries: string[] = [];
    if (!Array.isArray(responsiveAt)) {
      mediaQueries.push(responsiveAt);
    } else {
      mediaQueries.push(...responsiveAt);
    }

    for (const mediaQuery of mediaQueries) {
      if (mediaQuery === this.mediaQuery) {
        return true;
      }
    }
    return false;
  }

  /**
   * Durchläuft die aktuellen TableColumns und hört auf Changes in den Properties
   * der Columns und merkt sich die Subscriptions.
   */
  private updateColumnSubscriptions() {
    this.columnSubscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.columnSubscriptions = [];
    this.tableColumns.forEach((column: LuxTableColumnComponent) => {
      this.columnSubscriptions.push(
        column.change$.subscribe(() => {
          this.updateColumnsByMediaQuery();
        })
      );
    });
  }

  /**
   * Triggert über das DAO die Abfrage nach neuen Daten.
   * Sendet dabei das Request-Conf Objekt, welches Informationen bzgl.
   * page, pageSize, filter, sort, order mitgibt.
   * @param filteredBy?
   */
  private loadHttpDAOData(filteredBy?: string) {
    this.isLoadingResults = true;
    this.luxHttpDAO
      .loadData(this.httpRequestConf)
      .pipe(
        tap((data: ILuxTableHttpDaoStructure) => {
          this.isLoadingResults = false;
          // Wenn ein Filter-Text gegeben ist, sich dieser aber vom Aktuellen unterscheiden, brechen wir die Datenaktualisierung ab
          if (filteredBy && this.httpRequestConf.filter !== filteredBy) {
            return;
          }

          if (data) {
            this.dataSource.totalElements = data.totalCount;
            this.luxData = data.items;

            if (this.luxAutoPaginate && data.totalCount > LuxTableComponent.AUTO_PAGINATION_START) {
              this.luxShowPagination = true;
            }
          } else {
            this.dataSource.totalElements = 0;
            this.luxData = [];
          }
        }),
        catchError(error => {
          this.isLoadingResults = false;
          return of(error);
        })
      )
      .subscribe();
  }

  /**
   * Wird aufgerufen wenn der Sort neu zur DataSource hinzugefügt werden soll (Data wurde neu gesetzt).
   * Resettet die Pagination und aktualisiert wenn es sich um eine asynchrone Tabelle handelt die
   * requestConf.
   */
  private handleSort() {
    if (this.sort) {
      if (this.sortChangedSubscription) {
        this.sortChangedSubscription.unsubscribe();
      }
      this.sortChangedSubscription = this.sort.sortChange.subscribe((sort: any) => {
        this.paginator.pageIndex = 0;

        if (this.luxHttpDAO) {
          this.httpRequestConf.page = this.paginator.pageIndex;
          this.httpRequestConf.sort = sort.active;
          this.httpRequestConf.order = sort.direction;
          this.loadHttpDAOData();
        }
      });
    }

    this.calculateProportions();
  }

  /**
   * Wird nach dem set von luxShowFilter aufgerufen und fängt neue Filter-Operationen ab und
   * aktualisiert dementsprechend die Daten.
   */
  private handleFilter() {
    if (this.filterChangedSubscription) {
      this.filterChangedSubscription.unsubscribe();
    }
    if (this.luxShowFilter) {
      this.filterChangedSubscription = this.filtered$
        .asObservable()
        .pipe(
          tap(() => (this.isLoadingResults = true)),
          debounceTime(500),
          distinctUntilChanged((x: string, y: string) => {
            if (x === y) {
              this.isLoadingResults = false;
            }

            return x === y;
          })
        )
        .subscribe((filterValue: string) => {
          filterValue = filterValue.trim();
          filterValue = filterValue.toLocaleLowerCase();
          this.paginator.pageIndex = 0;
          this.isLoadingResults = false;
          if (!this.luxHttpDAO) {
            this.dataSource.filter = filterValue;
          }
          if (this.luxHttpDAO) {
            this.httpRequestConf.filter = filterValue;
            this.loadHttpDAOData(filterValue);
          }
        });
    }
    this.calculateProportions();
  }

  /**
   * Wird nach dem set von luxShowPagination aufgerufen und setzt wenn es sich hier um
   * eine asynchrone Tabelle handelt eine Subscription um Pagination-Änderungen zu erhalten.
   */
  private handlePagination() {
    if (this.luxShowPagination) {
      if (this.luxHttpDAO) {
        if (this.paginatorPageSubscription) {
          this.paginatorPageSubscription.unsubscribe();
        }
        this.paginatorPageSubscription = this.paginator.page.subscribe(() => {
          this.httpRequestConf.page = this.paginator.pageIndex;
          this.httpRequestConf.pageSize = this.paginator.pageSize;
          this.loadHttpDAOData();
        });
        this.httpRequestConf.page = this.paginator.pageIndex;
        this.httpRequestConf.pageSize = this.paginator.pageSize;
      }
      if (!this.luxHttpDAO) {
        this.dataSource.paginator = this.paginator;
      }
    } else {
      this.dataSource.paginator = null;
    }
    this.calculateProportions();
  }

  /**
   * Erzeugt einen neuen String für die Höhenberechnung der Tabelle und setzt die Minimalbreite für die Tabelle
   * (wenn möglich).
   */
  private calculateProportions() {
    setTimeout(() => {
      const filter = this.filterElement ? this.filterElement.nativeElement.offsetHeight : 0;
      const pagination = this.paginatorElement ? this.paginatorElement.nativeElement.scrollHeight : 0;
      const temp = 'calc(100% - ' + pagination + 'px' + ' - ' + filter + 'px)';

      if (temp !== this.tableHeightCSSCalc) {
        this.tableHeightCSSCalc = temp;
      }

      this.tableMinWidth = this.luxMinWidthPx > -1 ? this.luxMinWidthPx + 'px' : 'unset';
    });
  }

  /**
   * Aktualisiert die selectedEntries dieser Component anhand der aktuell gesetzten luxSelected-Elemente.
   *
   * Dabei werden die einzelnen Elemente zuerst mithilfe der luxCompareWith- und luxPickValue-Functions miteinander
   * verglichen.
   */
  private updateSelection() {
    // Prüfen ob selected gesetzt ist
    if (this.luxSelected.size > 0) {
      // Die selected-Einträge durchgehen und schauen ob diese im data-Block enthalten sind
      const foundEntries = [];
      this.luxSelected.forEach((entry: any) => {
        const newEntry = this.dataSource.data.find((dataEntry: any) => {
          return this.luxCompareWith(this.luxPickValue(entry), this.luxPickValue(dataEntry));
        });

        // Merkt sich die Entry wenn sie noch nicht in der Selected-Liste ist (wenn es sich um eine HTTP-Tabelle handelt)
        if (newEntry && (!this.luxHttpDAO || (this.luxHttpDAO && !this.luxSelected.has(newEntry)))) {
          foundEntries.push(newEntry);
          this.luxSelected.delete(entry);
        }
      });
      // Nur bei nicht-HTTP-Tabellen die Selektion einmal leeren
      if (!this.luxHttpDAO) {
        this.luxSelected.clear();
      }
      foundEntries.forEach((entry: boolean) => this.luxSelected.add(entry));
    }

    this.dataSource.selectedEntries = this.luxSelected;
    this.luxSelectedChange.next(Array.from(this.luxSelected));
    this.allSelected = this.checkFilteredAllSelected();
  }
}
