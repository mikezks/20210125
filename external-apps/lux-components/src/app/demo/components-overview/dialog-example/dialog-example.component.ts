import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { LuxDialogService } from '../../../modules/lux-popups/lux-dialog/lux-dialog.service';
import { logResult } from '../../example-base/example-base-util/example-base-helper';
import { ILuxDialogPresetConfig } from '../../../modules/lux-popups/lux-dialog/lux-dialog-model/lux-dialog-preset-config.interface';
import { DialogComponentExampleComponent } from './dialog-component-example/dialog-component-example.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog-example',
  templateUrl: './dialog-example.component.html'
})
export class DialogExampleComponent implements OnInit, OnDestroy {
  @ViewChild('contentTemplate', { static: true }) contentTemplate: TemplateRef<any>;
  useContentTemplate: boolean = false;
  showOutputEvents: boolean = false;
  contentTemplateString =
    ' <ng-template #contentTemplate>\n' +
    '     <i>Achtung: Ihre Daten werden gelöscht.</i><br/>\n' +
    '     <b>Möchten Sie fortfahren?</b>\n' +
    ' </ng-template>';
  log = logResult;

  dialogConfig: ILuxDialogPresetConfig = {
    title: 'Daten löschen?',
    content: 'Ihre Daten werden endgültig gelöscht. Das Löschen kann nicht rückgängig gemacht werden.',
    disableClose: true,
    width: 'auto',
    height: 'auto',
    panelClass: [],
    confirmAction: {
      label: 'Löschen',
      raised: true,
      color: 'warn'
    },
    declineAction: {
      label: 'Abbrechen',
      raised: true,
      color: ''
    }
  };

  exampleData;

  private subscriptions: Subscription[] = [];

  constructor(private dialogService: LuxDialogService) {}

  ngOnInit() {}

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  openDialog() {
    const dialogRef = this.dialogService.open(this.dialogConfig);

    this.subscriptions.push(dialogRef.dialogClosed.subscribe((result: any) => {
      this.log(this.showOutputEvents, 'dialogClosed', result);
    }));

    this.subscriptions.push(dialogRef.dialogDeclined.subscribe((result: any) => {
      this.log(this.showOutputEvents, 'dialogDeclined', result);
    }));

    this.subscriptions.push(dialogRef.dialogConfirmed.subscribe((result: any) => {
      this.log(this.showOutputEvents, 'dialogConfirmed', result);
    }));
  }

  openDialogComponent() {
    const dialogRef = this.dialogService.openComponent(
      DialogComponentExampleComponent,
      this.dialogConfig,
      this.exampleData
    );

    this.subscriptions.push(dialogRef.dialogClosed.subscribe((result: any) => {
      this.log(this.showOutputEvents, 'dialogClosed', result);
    }));
  }

  useContentTemplateChange($event: boolean) {
    if ($event) {
      this.dialogConfig.contentTemplate = this.contentTemplate;
    } else {
      this.dialogConfig.contentTemplate = undefined;
    }
  }

  updatePanelClass($event: string) {
    if ($event && $event.length > 0) {
      this.dialogConfig.panelClass = $event.split(',');
    }
  }
}
