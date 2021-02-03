import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LuxTestHelper } from '../../lux-util/testing/lux-test-helper';

import { LuxCheckboxComponent } from './lux-checkbox.component';
import { LuxConsoleService } from '../../lux-util/lux-console.service';

describe('LuxCheckboxComponent', () => {

  beforeEach(async () => {
    LuxTestHelper.configureTestModule(
      [LuxConsoleService],
      [
        LuxCheckboxInFormAttributeComponent,
        LuxCheckboxRequiredInFormAttributeComponent,
        LuxCheckedAttributeComponent,
        LuxDisabledAttributeComponent,
        LuxLabelAttributeComponent,
        LuxCheckedChangeComponent,
        LuxRequiredAttributeComponent,
        LuxValidatorsComponent
      ]
    );
  });

  describe('innerhalb eines Formulars', () => {
    describe('FormGroup (not required)"', () => {
      let fixture: ComponentFixture<LuxCheckboxInFormAttributeComponent>;
      let testComponent: LuxCheckboxInFormAttributeComponent;

      beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(LuxCheckboxInFormAttributeComponent);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      it('Formularwert über die Component setzen', fakeAsync(() => {
        // Vorbedingungen testen
        expect(fixture.componentInstance.formGroup.get('eula').value).toEqual(true);

        // Änderungen durchführen
        fixture.componentInstance.formGroup.get('eula').setValue(false);
        fixture.detectChanges();

        // Nachbedingungen testen
        const checkboxEl = fixture.debugElement.query(By.css('input'));
        expect(fixture.componentInstance.formGroup.get('eula').value).toBe(false, 'Nachbedingung 1');
        expect(checkboxEl.nativeElement.checked).toBeFalsy('Nachbedingung 2');
        expect(checkboxEl.nativeElement.required).toBeFalsy('Nachbedingung 3');
      }));

      it('Sollte einen Fehler in der Console werfen, wenn luxRequired gesetzt wird', fakeAsync(() => {
        let errorElement = fixture.debugElement.query(By.css('mat-error'));
        // Vorbedingungen testen
        const consoleSpy = spyOn(console, 'error');

        expect(errorElement).toBeNull(`Vorbedingung 1`);

        // Änderungen durchführen
        testComponent.required = true;
        LuxTestHelper.wait(fixture);
        testComponent.formGroup.get('eula').markAsTouched();
        fixture.detectChanges();

        // Nachbedingungen testen
        errorElement = fixture.debugElement.query(By.css('mat-error'));
        expect(fixture.componentInstance.formGroup.get('eula').value).toBeTruthy(`Nachbedingung 1`);
        expect(fixture.componentInstance.formGroup.get('eula').valid).toBeTruthy(`Nachbedingung 2`);
        expect(errorElement).toBeNull(`Nachbedingung 3`);
        expect(consoleSpy).toHaveBeenCalledTimes(1);
      }));
    });

    describe('FormGroup (required)"', () => {
      let fixture: ComponentFixture<LuxCheckboxRequiredInFormAttributeComponent>;
      let testComponent: LuxCheckboxRequiredInFormAttributeComponent;

      beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(LuxCheckboxRequiredInFormAttributeComponent);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      it('Formularwert über die Component setzen', fakeAsync(() => {
        // Vorbedingungen testen
        expect(fixture.componentInstance.formGroup.get('eula').value).toEqual(null);

        // Änderungen durchführen
        fixture.componentInstance.formGroup.get('eula').setValue(true);
        fixture.detectChanges();

        // Nachbedingungen testen
        const checkboxEl = fixture.debugElement.query(By.css('input'));
        expect(fixture.componentInstance.formGroup.get('eula').value).toBeTruthy('Nachbedingung 1');
        expect(checkboxEl.nativeElement.checked).toBeTruthy('Nachbedingung 2');
      }));

      it('Label anklicken', fakeAsync(() => {
        // Vorbedingungen testen
        expect(fixture.componentInstance.formGroup.get('eula').value).toBeFalsy(`Vorbedingung 1`);

        // Änderungen durchführen
        const checkboxEl = fixture.debugElement.query(By.css('label'));
        checkboxEl.nativeElement.click();
        fixture.detectChanges();
        flush();

        // Nachbedingungen testen
        expect(fixture.componentInstance.formGroup.get('eula').value).toBeTruthy('Nachbedingung 1');
      }));

      it('Checkbox anklicken', fakeAsync(() => {
        // Vorbedingungen testen
        expect(fixture.componentInstance.formGroup.get('eula').value).toBeFalsy(`Vorbedingung 1`);

        // Änderungen durchführen
        const checkboxEl = fixture.debugElement.query(By.css('input'));
        checkboxEl.nativeElement.click();
        fixture.detectChanges();

        // Nachbedingungen testen
        expect(fixture.componentInstance.formGroup.get('eula').value).toBeTruthy('Nachbedingung 1');
      }));

      it('Sollte die korrekte Fehlermeldung anzeigen', () => {
        let errorElement = fixture.debugElement.query(By.css('mat-error'));

        // Vorbedingungen testen
        expect(fixture.componentInstance.formGroup.get('eula').value).toBeFalsy(`Vorbedingung 1`);
        expect(errorElement).toBeNull(`Vorbedingung 2`);

        // Änderungen durchführen
        testComponent.formGroup.get('eula').markAsTouched();
        fixture.detectChanges();

        // Nachbedingungen testen
        errorElement = fixture.debugElement.query(By.css('mat-error'));
        expect(errorElement.nativeElement.innerText.trim()).toEqual('Das ist ein Pflichtfeld', `Nachbedingung 1`);
      });

      it('Sollte einen Fehler bei Startwert "" anzeigen können', fakeAsync(() => {
        testComponent.formGroup.get('eula').setValue('');
        let errorElement = fixture.debugElement.query(By.css('mat-error'));
        LuxTestHelper.wait(fixture);

        // Vorbedingungen testen
        expect(fixture.componentInstance.formGroup.get('eula').value).toBeFalsy(`Vorbedingung 1`);
        expect(errorElement).toBeNull(`Vorbedingung 2`);

        // Änderungen durchführen
        testComponent.formGroup.get('eula').markAsTouched();
        LuxTestHelper.wait(fixture);

        // Nachbedingungen testen
        errorElement = fixture.debugElement.query(By.css('mat-error'));
        expect(errorElement.nativeElement.innerText.trim()).toEqual('Das ist ein Pflichtfeld', `Nachbedingung 1`);
      }));

      it('Sollte einen Fehler bei Startwert false anzeigen können', fakeAsync(() => {
        testComponent.formGroup.get('eula').setValue(false);
        let errorElement = fixture.debugElement.query(By.css('mat-error'));
        LuxTestHelper.wait(fixture);

        // Vorbedingungen testen
        expect(fixture.componentInstance.formGroup.get('eula').value).toBeFalsy(`Vorbedingung 1`);
        expect(errorElement).toBeNull(`Vorbedingung 2`);

        // Änderungen durchführen
        testComponent.formGroup.get('eula').markAsTouched();
        LuxTestHelper.wait(fixture);

        // Nachbedingungen testen
        errorElement = fixture.debugElement.query(By.css('mat-error'));
        expect(errorElement.nativeElement.innerText.trim()).toEqual('Das ist ein Pflichtfeld', `Nachbedingung 1`);
      }));

      it('Sollte einen Fehler bei Startwert true anzeigen können', fakeAsync(() => {
        testComponent.formGroup.get('eula').setValue(true);
        let errorElement = fixture.debugElement.query(By.css('mat-error'));
        LuxTestHelper.wait(fixture);

        // Vorbedingungen testen
        expect(fixture.componentInstance.formGroup.get('eula').value).toBeTruthy(`Vorbedingung 1`);
        expect(errorElement).toBeNull(`Vorbedingung 2`);

        // Änderungen durchführen
        testComponent.formGroup.get('eula').setValue(false);
        testComponent.formGroup.get('eula').markAsTouched();
        LuxTestHelper.wait(fixture);

        // Nachbedingungen testen
        errorElement = fixture.debugElement.query(By.css('mat-error'));
        expect(errorElement.nativeElement.innerText.trim()).toEqual('Das ist ein Pflichtfeld', `Nachbedingung 1`);
      }));
    });
  });

  describe('außerhalb eines Formulars', () => {
    describe('Attribut "luxChecked" mit Two-Way-Binding', () => {
      let fixture: ComponentFixture<LuxCheckedAttributeComponent>;
      let testComponent: LuxCheckedAttributeComponent;

      beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(LuxCheckedAttributeComponent);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      it('Wert über die Component setzen', fakeAsync(() => {
        // Vorbedingungen testen
        expect(fixture.componentInstance.eula).toBeUndefined(`Vorbedingung 1`);

        // Änderungen durchführen
        fixture.componentInstance.eula = true;
        fixture.detectChanges();

        // Nachbedingungen testen
        const checkboxEl = fixture.debugElement.query(By.css('input'));
        expect(checkboxEl.nativeElement.checked).toBeTruthy('Nachbedingung 1');
      }));

      it('Label anklicken', fakeAsync(() => {
        // Vorbedingungen testen
        expect(fixture.componentInstance.eula).toBeFalsy(`Vorbedingung 1`);

        // Änderungen durchführen
        const checkboxEl = fixture.debugElement.query(By.css('label'));
        checkboxEl.nativeElement.click();
        fixture.detectChanges();
        flush();

        // Nachbedingungen testen
        expect(fixture.componentInstance.eula).toBeTruthy('Nachbedingung 1');
      }));

      it('Checkbox anklicken', fakeAsync(() => {
        // Vorbedingungen testen
        expect(fixture.componentInstance.eula).toBeFalsy(`Vorbedingung 1`);

        // Änderungen durchführen
        const checkboxEl = fixture.debugElement.query(By.css('input'));
        checkboxEl.nativeElement.click();
        fixture.detectChanges();

        // Nachbedingungen testen
        expect(fixture.componentInstance.eula).toBeTruthy('Nachbedingung 1');
      }));
    });

    describe('Attribut "luxDisabled"', () => {
      let fixture: ComponentFixture<LuxDisabledAttributeComponent>;
      let testComponent: LuxDisabledAttributeComponent;

      beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(LuxDisabledAttributeComponent);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      it('Wert über die Component setzen', fakeAsync(() => {
        // Vorbedingungen testen
        expect(fixture.componentInstance.disabled).toBeUndefined(`Vorbedingung 1`);

        // Änderungen durchführen
        fixture.componentInstance.disabled = true;
        fixture.detectChanges();

        const checkboxEl = fixture.debugElement.query(By.css('input'));
        checkboxEl.nativeElement.click();
        fixture.detectChanges();

        // Nachbedingungen testen
        expect(fixture.componentInstance.disabled).toBeTruthy('Nachbedingung 1');
        expect(checkboxEl.nativeElement.disabled).toBeTruthy('Nachbedingung 2');
      }));
    });

    describe('Attribut "luxLabel"', () => {
      let fixture: ComponentFixture<LuxLabelAttributeComponent>;
      let testComponent: LuxLabelAttributeComponent;

      beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(LuxLabelAttributeComponent);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      it('Wert über die Component setzen', fakeAsync(() => {
        // Vorbedingungen testen
        expect(fixture.componentInstance.label).toBeUndefined();

        // Änderungen durchführen
        const newLabel = 'A4711';
        fixture.componentInstance.label = newLabel;
        fixture.detectChanges();

        const labelEl = fixture.debugElement.query(By.css('label'));
        fixture.detectChanges();

        // Nachbedingungen testen
        expect(fixture.componentInstance.label).toEqual(newLabel);
        expect(labelEl.nativeElement.innerHTML.trim().indexOf(newLabel) !== -1).toBeTruthy(
          'Das neue Label wurde nicht gefunden.'
        );
      }));
    });

    describe('Attribut "luxCheckedChange"', () => {
      let fixture: ComponentFixture<LuxCheckedChangeComponent>;
      let testComponent: LuxCheckedChangeComponent;

      beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(LuxCheckedChangeComponent);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      it('Check Event', fakeAsync(() => {
        // Vorbedingungen testen
        expect(fixture.componentInstance.eula).toBeNull('Vorbedingung 1');

        // Änderungen durchführen
        // 1. Click => true
        const checkboxEl = fixture.debugElement.query(By.css('input'));
        checkboxEl.nativeElement.click();
        fixture.detectChanges();

        // Nachbedingungen testen
        expect(fixture.componentInstance.eula).toBeTruthy('Nachbedingung 1');

        // Änderungen durchführen
        // 2. Click => false
        checkboxEl.nativeElement.click();
        fixture.detectChanges();

        // Nachbedingungen testen
        expect(fixture.componentInstance.eula).toBeFalsy('Nachbedingung 2');
      }));
    });

    describe('Attribut "luxRequired"', () => {
      let fixture: ComponentFixture<LuxRequiredAttributeComponent>;
      let testComponent: LuxRequiredAttributeComponent;
      let checkboxComponent: LuxCheckboxComponent;

      beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(LuxRequiredAttributeComponent);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
        checkboxComponent = fixture.debugElement.query(By.directive(LuxCheckboxComponent)).componentInstance;
      }));

      it('Sollte die korrekte Fehlermeldung anzeigen', fakeAsync(() => {
        let errorElement = fixture.debugElement.query(By.css('mat-error'));

        // Vorbedingungen testen
        expect(errorElement).toBeNull(`Vorbedingung 1`);

        // Änderungen durchführen
        checkboxComponent.formControl.markAsTouched();
        LuxTestHelper.wait(fixture);

        // Nachbedingungen testen
        errorElement = fixture.debugElement.query(By.css('mat-error'));
        expect(errorElement.nativeElement.innerText.trim()).toEqual('Das ist ein Pflichtfeld', `Nachbedingung 1`);
      }));
    });

    describe('Error-Message', () => {
      let fixture: ComponentFixture<LuxValidatorsComponent>;
      let testComponent: LuxValidatorsComponent;
      let checkboxComponent: LuxCheckboxComponent;

      beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(LuxValidatorsComponent);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
        checkboxComponent = fixture.debugElement.query(By.directive(LuxCheckboxComponent)).componentInstance;
      }));

      it('Validatoren setzen und die Fehlermeldungen korrekt anzeigen', fakeAsync(() => {
        // Vorbedingungen testen
        let errorEl = fixture.debugElement.query(By.css('mat-error'));
        expect(errorEl).toBeNull(`Vorbedingung 1`);

        // Änderungen durchführen
        testComponent.validators = Validators.required;
        LuxTestHelper.wait(fixture);
        checkboxComponent.formControl.markAsTouched();
        checkboxComponent.formControl.updateValueAndValidity();
        LuxTestHelper.wait(fixture, 100);

        // Nachbedingungen testen
        errorEl = fixture.debugElement.query(By.css('mat-error'));
        expect(errorEl.nativeElement.innerText.trim().length).toBeGreaterThan(0, `Nachbedingung 1`);
        expect(checkboxComponent.formControl.valid).toBeFalsy(`Nachbedingung 2`);
      }));
    });
  });
});

@Component({
  template: `
    <lux-checkbox luxLabel="Magst du Pommes?" [luxChecked]="true" [luxDisabled]="disabled"></lux-checkbox>
  `
})
class LuxDisabledAttributeComponent {
  disabled: boolean;
}

@Component({
  template: `
    <lux-checkbox luxLabel="Eula gelesen?" (luxCheckedChange)="onCheckedChange($event)"></lux-checkbox>
  `
})
class LuxCheckedChangeComponent {
  eula: boolean = null;

  onCheckedChange(value: boolean) {
    this.eula = value;
  }
}

@Component({
  template: `
    <lux-checkbox luxLabel="Eula gelesen?" [(luxChecked)]="eula"></lux-checkbox>
  `
})
class LuxCheckedAttributeComponent {
  eula: boolean;
}

@Component({
  template: `
    <lux-checkbox [luxLabel]="label" [luxChecked]="false"></lux-checkbox>
  `
})
class LuxLabelAttributeComponent {
  label: string;
}

@Component({
  template: `
    <lux-checkbox [luxLabel]="label" [luxRequired]="true"></lux-checkbox>
  `
})
class LuxRequiredAttributeComponent {
  label: string;
}

@Component({
  template: `
    <form [formGroup]="formGroup">
      <lux-checkbox luxLabel="Eula gelesen?" luxControlBinding="eula" [luxRequired]="required"></lux-checkbox>
    </form>
  `
})
class LuxCheckboxInFormAttributeComponent {
  formGroup: FormGroup;
  required;

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      eula: [true]
    });
  }
}

@Component({
  template: `
    <form [formGroup]="formGroup">
      <lux-checkbox luxLabel="Eula gelesen?" luxControlBinding="eula"></lux-checkbox>
    </form>
  `
})
class LuxCheckboxRequiredInFormAttributeComponent {
  formGroup: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      eula: [null, Validators.required]
    });
  }
}

@Component({
  template: `
    <lux-checkbox luxLabel="Eula gelesen?" [(luxChecked)]="eula" [luxControlValidators]="validators"></lux-checkbox>
  `
})
class LuxValidatorsComponent {
  eula: boolean;
  validators;
}
