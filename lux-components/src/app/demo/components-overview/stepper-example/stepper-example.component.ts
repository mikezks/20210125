import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LuxAppFooterButtonInfo } from '../../../modules/lux-layout/lux-app-footer/lux-app-footer-button-info';
import { LuxAppFooterButtonService } from '../../../modules/lux-layout/lux-app-footer/lux-app-footer-button.service';
import { ILuxStepperButtonConfig } from '../../../modules/lux-layout/lux-stepper/lux-stepper-model/lux-stepper-button-config.interface';
import { LuxStepperHelperService } from '../../../modules/lux-layout/lux-stepper/lux-stepper-helper.service';
import { LuxStepperComponent } from '../../../modules/lux-layout/lux-stepper/lux-stepper.component';
import { LuxSnackbarService } from '../../../modules/lux-popups/lux-snackbar/lux-snackbar.service';
import { logResult } from '../../example-base/example-base-util/example-base-helper';

@Component({
  selector: 'app-stepper-example',
  templateUrl: './stepper-example.component.html',
  styleUrls: ['./stepper-example.component.scss']
})
export class StepperExampleComponent implements OnInit, OnDestroy {
  @ViewChild(LuxStepperComponent, { static: true }) stepperComponent: LuxStepperComponent;

  // region Helper-Properties für das Beispiel

  showOutputEvents: boolean = false;
  useCustomButtonConfig: boolean = false;
  log = logResult;

  steps: any[] = [
    {
      iconName: 'fas fa-bookmark',
      iconSize: '2x',
      optional: false,
      editable: true,
      completed: false,
      useStepControl: true,
      stepControl: new FormGroup({
        control1: new FormControl('', Validators.required),
        control2: new FormControl('', Validators.compose([Validators.minLength(5), Validators.required]))
      })
    },
    {
      iconName: 'fas fa-user',
      iconSize: '2x',
      optional: false,
      editable: true,
      completed: false,
      useStepControl: true,
      stepControl: new FormGroup({
        control1: new FormControl('', Validators.required),
        control2: new FormControl('', Validators.compose([Validators.minLength(5), Validators.required]))
      })
    }
  ];

  // endregion

  // region Properties der Component

  previousButtonConfig: ILuxStepperButtonConfig = {
    label: '',
    iconName: 'fa-arrow-left',
    color: 'primary'
  };

  nextButtonConfig: ILuxStepperButtonConfig = {
    label: '',
    iconName: 'fa-arrow-right',
    color: 'primary'
  };

  finishButtonConfig: ILuxStepperButtonConfig = {
    label: '',
    iconName: 'fa-check',
    color: 'primary'
  };

  disabled: boolean = false;
  showNavigationButtons: boolean = true;
  linear: boolean = true;
  useCustomIcons: boolean = false;
  currentStepNumber: number = 0;
  editedIconName: string = 'fas fa-pencil-alt';
  horizontalAnimation: boolean = false;
  verticalStepper: boolean = false;

  // endregion

  constructor(
    private stepperService: LuxStepperHelperService,
    private buttonService: LuxAppFooterButtonService,
    private snackbar: LuxSnackbarService
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    // sicherheitshalber beim Verlassen der Component unsere neuen Footer-Buttons entfernen.
    this.clearButtonInfos();
  }

  /**
   * Loggt das luxFinishButtonClicked-Event und gibt eine Snackbar-Mitteilung aus.
   * Anschließend wird der aktuelle Step wieder auf 0 gesetzt und die Forms resettet.
   * @param $event
   */
  finishClicked($event) {
    this.log(this.showOutputEvents, 'luxFinishButtonClicked', $event);

    this.snackbar.open(3000, {
      text: 'Steps abgeschlossen.'
    });
    this.currentStepNumber = 0;
    this.steps.forEach((step: any) => {
      step.stepControl.reset();
    });
  }

  /**
   * Loggt das luxCurrentStepNumberChange-Event.
   * @param $event
   */
  stepNumberChanged($event) {
    this.log(this.showOutputEvents, 'luxCurrentStepNumberChange', $event);
  }

  /**
   * Loggt das luxStepChanged-Event und aktualisiert die CurrentStepNumber sowie die Footer-Button Zustände.
   * @param $event
   */
  stepChanged($event) {
    this.log(this.showOutputEvents, 'luxStepChanged', $event);
    if (this.currentStepNumber !== $event.selectedIndex) {
      this.currentStepNumber = $event.selectedIndex;
    }
    this.updateFooterButtonStates();
  }

  stepClicked($event) {
    this.log(this.showOutputEvents, `luxStepClicked`, $event);
  }

  checkValidation($event) {
    this.log(this.showOutputEvents, `luxCheckValidation`, $event);
  }

  /**
   * Aktualisiert den "disabled"-Zustand der aktuellen Footer-Buttons passend zum aktuellen Step.
   */
  updateFooterButtonStates() {
    if (this.showNavigationButtons) {
      return;
    }
    if (this.currentStepNumber === 0) {
      this.buttonService.getButtonInfoByCMD('previous').disabled = true;
      this.buttonService.getButtonInfoByCMD('next').disabled = false;
      this.buttonService.getButtonInfoByCMD('finish').disabled = true;
    } else if (this.currentStepNumber === this.steps.length) {
      this.buttonService.getButtonInfoByCMD('previous').disabled = false;
      this.buttonService.getButtonInfoByCMD('next').disabled = true;
      this.buttonService.getButtonInfoByCMD('finish').disabled = false;
    } else {
      this.buttonService.getButtonInfoByCMD('previous').disabled = false;
      this.buttonService.getButtonInfoByCMD('next').disabled = false;
      this.buttonService.getButtonInfoByCMD('finish').disabled = true;
    }
  }

  /**
   * Aktualisiert die Footer-Buttons passend zum aktuellen Step (wenn Footer-Buttons überhaupt dargestellt werden sollen).
   * @param $event
   */
  updateNavigationButtons($event: boolean) {
    this.clearButtonInfos();
    if (!$event) {
      this.buttonService.pushButtonInfos(
        LuxAppFooterButtonInfo.generateInfo({
          cmd: 'previous',
          color: 'default',
          label: 'Vorheriger Step',
          raised: true,
          alwaysVisible: false,
          onClick: () => this.stepperService.previousStep()
        }),
        LuxAppFooterButtonInfo.generateInfo({
          cmd: 'next',
          color: 'primary',
          label: 'Nächster Step',
          raised: true,
          alwaysVisible: false,
          onClick: () => this.stepperService.nextStep()
        }),
        LuxAppFooterButtonInfo.generateInfo({
          cmd: 'finish',
          color: 'accent',
          label: 'Abschließen',
          alwaysVisible: false,
          raised: true,
          onClick: () => this.stepperComponent.luxFinishButtonClicked.emit()
        })
      );

      this.updateFooterButtonStates();
    }
  }

  /**
   * Entfernt unsere Stepper-Buttons aus dem Footer.
   */
  clearButtonInfos() {
    this.buttonService.removeButtonInfoByCmd('next');
    this.buttonService.removeButtonInfoByCmd('previous');
    this.buttonService.removeButtonInfoByCmd('finish');
  }

  /**
   * Helper Funktion, die nur beim Wechsel von horizontal zu vertikal und vice versa greift.
   * Rendert die eigenen Icons einfach neu (werden sonst evtl. nicht korrekt nach dem Wechsel dargestellt).
   */
  redrawIcons() {
    const temp = this.useCustomIcons;
    this.useCustomIcons = !this.useCustomIcons;
    setTimeout(() => {
      this.useCustomIcons = temp;
    });
  }
}
