import {
  Component,
  EventEmitter,
  forwardRef,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewChild
} from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { LuxAccordionComponent } from '../lux-accordion/lux-accordion.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lux-panel',
  templateUrl: './lux-panel.component.html',
  styleUrls: ['./lux-panel.component.scss']
})
export class LuxPanelComponent implements OnInit, OnDestroy {
  @Input() luxDisabled: boolean;
  @Input() luxExpanded: boolean = false;
  @Input() luxHideToggle: boolean;

  @Input() luxCollapsedHeaderHeight: string;
  @Input() luxExpandedHeaderHeight: string;

  @Output() luxOpened = new EventEmitter<any>();
  @Output() luxClosed = new EventEmitter<any>();
  @Output() luxExpandedChange: EventEmitter<boolean> = new EventEmitter();

  @ViewChild(MatExpansionPanel, { static: true }) matExpansionPanel: MatExpansionPanel;

  @HostBinding('class.lux-pr-1') pr1: boolean = true;
  @HostBinding('class.lux-pl-1') pl1: boolean = true;

  subscription: Subscription;

  constructor(@Optional() @Inject(forwardRef(() => LuxAccordionComponent)) private parent: LuxAccordionComponent) {}

  ngOnInit() {
    if (this.parent) {
      if (this.luxHideToggle === undefined) {
        this.luxHideToggle = this.parent.luxHideToggle;
      }
      if (this.luxDisabled === undefined) {
        this.luxDisabled = this.parent.luxDisabled;
      }
      if (this.luxExpandedHeaderHeight === undefined) {
        this.luxExpandedHeaderHeight = this.parent.luxExpandedHeaderHeight;
      }
      if (this.luxCollapsedHeaderHeight === undefined) {
        this.luxCollapsedHeaderHeight = this.parent.luxCollapsedHeaderHeight;
      }

      // Diese Zeile wird benötigt, damit der Multi-Mode
      // (nur ein Abschnitt darf geöffnet sein) des Accordions funktioniert.
      this.matExpansionPanel.accordion = this.parent.matAccordion;

      // Um eine zyklische Abhängigkeit mit dem lux-accordion zu vermeiden,
      // wurde hier ein Event verwendet.
      this.subscription = this.parent.changed$.subscribe(propertyName => {
        if (propertyName === 'luxHideToggle') {
          this.luxHideToggle = this.parent.luxHideToggle;
        } else if (propertyName === 'luxDisabled') {
          this.luxDisabled = this.parent.luxDisabled;
        } else if (propertyName === 'luxExpandedHeaderHeight') {
          this.luxExpandedHeaderHeight = this.parent.luxExpandedHeaderHeight;
        } else if (propertyName === 'luxCollapsedHeaderHeight') {
          this.luxCollapsedHeaderHeight = this.parent.luxCollapsedHeaderHeight;
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.parent) {
      this.subscription.unsubscribe();
    }
  }

  onOpened(eventValue) {
    this.luxOpened.emit(eventValue);
    this.luxExpanded = true;
    this.luxExpandedChange.emit(this.luxExpanded);
  }

  onClosed(eventValue) {
    this.luxClosed.emit(eventValue);
    this.luxExpanded = false;
    this.luxExpandedChange.emit(this.luxExpanded);
  }
}
