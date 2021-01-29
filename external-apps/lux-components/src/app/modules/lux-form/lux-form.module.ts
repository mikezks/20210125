import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { LuxActionModule } from '../lux-action/lux-action.module';
import { LuxComponentsConfigModule } from '../lux-components-config/lux-components-config.module';
import { LuxDirectivesModule } from '../lux-directives/lux-directives.module';
import { LuxIconModule } from '../lux-icon/lux-icon.module';
import { LuxLayoutModule } from '../lux-layout/lux-layout.module';
import { LuxPipesModule } from '../lux-pipes/lux-pipes.module';
import { LuxMediaQueryObserverService } from '../lux-util/lux-media-query-observer.service';
import { LuxAutocompleteComponent } from './lux-autocomplete/lux-autocomplete.component';
import { LuxCheckboxComponent } from './lux-checkbox/lux-checkbox.component';
import { LuxChipGroupComponent } from './lux-chips/lux-chips-subcomponents/lux-chip-group.component';
import { LuxChipComponent } from './lux-chips/lux-chips-subcomponents/lux-chip.component';
import { LuxChipsComponent } from './lux-chips/lux-chips.component';
import { LuxDatepickerComponent } from './lux-datepicker/lux-datepicker.component';
import { LuxFileInputComponent } from './lux-file/lux-file-input/lux-file-input.component';
import { LuxFileListComponent } from './lux-file/lux-file-list/lux-file-list.component';
import { LuxFileProgressComponent } from './lux-file/lux-file-subcomponents/lux-file-progress/lux-file-progress.component';
import { LuxFormHintComponent } from './lux-form-control/lux-form-control-subcomponents/lux-form-hint.component';
import { LuxFormLabelComponent } from './lux-form-control/lux-form-control-subcomponents/lux-form-label.component';
import { LuxFormControlComponent } from './lux-form-control/lux-form-control.component';
import { LuxInputPrefixComponent } from './lux-input/lux-input-subcomponents/lux-input-prefix.component';
import { LuxInputSuffixComponent } from './lux-input/lux-input-subcomponents/lux-input-suffix.component';
import { LuxInputComponent } from './lux-input/lux-input.component';
import { LuxRadioComponent } from './lux-radio/lux-radio.component';
import { LuxSelectComponent } from './lux-select/lux-select.component';
import { LuxSliderComponent } from './lux-slider/lux-slider.component';
import { LuxTextareaComponent } from './lux-textarea/lux-textarea.component';
import { LuxToggleComponent } from './lux-toggle/lux-toggle.component';
import { LuxFileCaptureDirective } from './lux-file/lux-file-model/lux-file-capture.directive';
import { LuxMaxLengthDirective } from './lux-form-control/lux-form-directives/lux-maxlength/lux-max-length.directive';
import { LuxNameDirectiveDirective } from './lux-form-control/lux-form-directives/lux-name/lux-name-directive.directive';
import { LuxSelectOptionHeightDirective } from './lux-select/lux-select-option-height.directive';

@NgModule({
  declarations: [
    LuxToggleComponent,
    LuxSelectComponent,
    LuxSelectOptionHeightDirective,
    LuxInputComponent,
    LuxInputPrefixComponent,
    LuxInputSuffixComponent,
    LuxCheckboxComponent,
    LuxChipsComponent,
    LuxChipComponent,
    LuxChipGroupComponent,
    LuxRadioComponent,
    LuxDatepickerComponent,
    LuxAutocompleteComponent,
    LuxSliderComponent,
    LuxTextareaComponent,
    LuxFormControlComponent,
    LuxFormHintComponent,
    LuxFormLabelComponent,
    LuxFileListComponent,
    LuxFileInputComponent,
    LuxFileProgressComponent,
    LuxFileCaptureDirective,
    LuxMaxLengthDirective,
    LuxNameDirectiveDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatChipsModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatSliderModule,
    LuxIconModule,
    LuxDirectivesModule,
    LuxPipesModule,
    LuxComponentsConfigModule,
    LuxActionModule,
    LuxLayoutModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  exports: [
    LuxToggleComponent,
    LuxSelectComponent,
    LuxSelectOptionHeightDirective,
    LuxInputComponent,
    LuxInputPrefixComponent,
    LuxInputSuffixComponent,
    LuxCheckboxComponent,
    LuxChipsComponent,
    LuxChipComponent,
    LuxChipGroupComponent,
    LuxRadioComponent,
    LuxDatepickerComponent,
    LuxAutocompleteComponent,
    LuxSliderComponent,
    LuxTextareaComponent,
    LuxFormControlComponent,
    LuxFormHintComponent,
    LuxFormLabelComponent,
    LuxFileListComponent,
    LuxFileInputComponent,
    LuxFileCaptureDirective,
    LuxMaxLengthDirective
  ],
  providers: [LuxMediaQueryObserverService]
})
export class LuxFormModule {}
