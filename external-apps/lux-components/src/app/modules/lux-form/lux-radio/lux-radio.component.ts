import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  HostBinding,
  Input,
  OnDestroy,
  Optional,
  TemplateRef
} from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { LuxMediaQueryObserverService } from '../../lux-util/lux-media-query-observer.service';
import { LuxConsoleService } from '../../lux-util/lux-console.service';
import { LuxFormSelectableBase } from '../lux-form-model/lux-form-selectable-base.class';
import { Subscription } from 'rxjs';
import { LuxComponentsConfigService } from '../../lux-components-config/lux-components-config.service';

@Component({
  selector: 'lux-radio',
  templateUrl: './lux-radio.component.html',
  styleUrls: ['./lux-radio.component.scss']
})
export class LuxRadioComponent extends LuxFormSelectableBase implements OnDestroy {
  forceVertical: boolean = false;

  // Potentiell eingebettetes Template für Darstellung der Labels
  @ContentChild(TemplateRef) tempRef: TemplateRef<any>;

  @HostBinding('class.lux-pb-3') pb3: boolean = true;
  @Input() luxGroupName: string = '';
  @Input() luxOrientationVertical: boolean = true;

  private mediaSubscription$: Subscription;

  constructor(
    @Optional() controlContainer: ControlContainer,
    cdr: ChangeDetectorRef,
    logger: LuxConsoleService,
    config: LuxComponentsConfigService,
    private mediaObserver: LuxMediaQueryObserverService
  ) {
    super(controlContainer, cdr, logger, config);

    this.mediaSubscription$ = this.mediaObserver.getMediaQueryChangedAsObservable().subscribe(() => {
      this.forceVertical = this.mediaObserver.isXS();
    });
    this.forceVertical = this.mediaObserver.isXS();
  }

  get isVertical(): boolean {
    return this.luxOrientationVertical || this.forceVertical;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.mediaSubscription$.unsubscribe();
    this.mediaSubscription$ = null;
  }
}
