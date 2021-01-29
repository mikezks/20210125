import { ComponentFixture, discardPeriodicTasks, fakeAsync, flush, TestBed } from '@angular/core/testing';

import { LuxDatepickerComponent } from './lux-datepicker.component';
import { LuxTestHelper } from '../../lux-util/testing/lux-test-helper';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { LuxConsoleService } from '../../lux-util/lux-console.service';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { LuxOverlayHelper } from '../../lux-util/testing/lux-test-overlay-helper';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LuxUtil } from '../../lux-util/lux-util';

describe('LuxDatepickerComponent', () => {
  beforeEach(async () => {
    LuxTestHelper.configureTestModule(
      [LuxConsoleService],
      [LuxFormTestComponent, LuxNoFormAttributeTestComponent, LuxFormCustomValidatorComponent]
    );
  });

  describe('Validatoren', () => {
    let fixture: ComponentFixture<LuxFormCustomValidatorComponent>;
    let testComponent: LuxFormCustomValidatorComponent;
    let datepickerComponent: LuxDatepickerComponent;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(LuxFormCustomValidatorComponent);
      testComponent = fixture.componentInstance;
      datepickerComponent = fixture.debugElement.query(By.directive(LuxDatepickerComponent)).componentInstance;
      flush();
    }));

    it('Sollte mehrere Validatoren (Standard- und Custom-Validatoren) unterstützen', fakeAsync(() => {
      // Vorbedingungen testen
      let matErrorEl = fixture.debugElement.query(By.css('mat-error'));
      expect(testComponent.formControl.value).toBeFalsy(`Vorbedingung 1`);
      expect(datepickerComponent.luxValue).toBeFalsy(`Vorbedingung 2`);
      expect(matErrorEl).toBeFalsy(`Vorbedingung 3`);

      // Änderungen durchführen
      testComponent.formControl.setValue('');
      testComponent.formControl.markAsTouched();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      matErrorEl = fixture.debugElement.query(By.css('mat-error'));
      expect(matErrorEl).not.toBeNull(`Nachbedingung 1`);
      expect(matErrorEl.nativeElement.innerHTML.trim()).toEqual('Darf nicht leer sein');

      // Änderungen durchführen
      testComponent.formControl.setValue('01/01/2019');
      testComponent.formControl.markAsTouched();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      const datepickerEl = fixture.debugElement.query(By.css('input'));
      expect(LuxUtil.stringWithoutASCIIChars(datepickerEl.nativeElement.value)).toEqual(
        '01.01.2019',
        'Nachbedingung 2'
      );

      matErrorEl = fixture.debugElement.query(By.css('mat-error'));
      expect(matErrorEl).not.toBeNull(`Nachbedingung 3`);
      expect(matErrorEl.nativeElement.innerHTML.trim()).toEqual('Das Jahr 2019 darf nicht verwendet werden');

      // Änderungen durchführen
      LuxTestHelper.typeInElement(datepickerEl.nativeElement, '01.01.2020', false);
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      matErrorEl = fixture.debugElement.query(By.css('mat-error'));
      expect(matErrorEl).toBeNull(`Nachbedingung 4`);

      // Änderungen durchführen
      LuxTestHelper.typeInElement(datepickerEl.nativeElement, '01.01.20', false);
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      matErrorEl = fixture.debugElement.query(By.css('mat-error'));
      expect(matErrorEl).not.toBeNull(`Nachbedingung 5`);
      expect(matErrorEl.nativeElement.innerHTML.trim()).toEqual('Darf nicht leer sein');
    }));
  });

  describe('innerhalb eines Formulars', () => {
    let fixture: ComponentFixture<LuxFormTestComponent>;
    let testComponent: LuxFormTestComponent;
    let datepickerComponent: LuxDatepickerComponent;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(LuxFormTestComponent);
      testComponent = fixture.componentInstance;
      datepickerComponent = fixture.debugElement.query(By.directive(LuxDatepickerComponent)).componentInstance;
      flush();
    }));

    it('Sollte einen Wert nach dem Rendern besitzen', fakeAsync(() => {
      // Vorbedingungen testen
      expect(testComponent.formControl.value).toBeFalsy(`Vorbedingung 1`);
      expect(datepickerComponent.luxValue).toBeFalsy(`Vorbedingung 2`);

      // Änderungen durchführen
      testComponent.formControl.setValue('06/10/2015');
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      const utcNullifiedDate = new Date(0);
      utcNullifiedDate.setUTCFullYear(2015, 5, 10);
      utcNullifiedDate.setUTCHours(0);
      const datepickerEl = fixture.debugElement.query(By.css('input'));
      expect(LuxUtil.stringWithoutASCIIChars(datepickerEl.nativeElement.value)).toEqual(
        '10.06.2015',
        'Nachbedingung 1'
      );
      expect(datepickerComponent.luxValue).toEqual(utcNullifiedDate.toISOString(), `Nachbedingung 2`);

      console.log(new Date(datepickerComponent.luxValue));
    }));

    it('Sollte den Wert aktualisieren', fakeAsync(() => {
      fixture.detectChanges();
      // Vorbedingungen testen
      expect(testComponent.formControl.value).toBeFalsy(`Vorbedingung 1`);
      expect(datepickerComponent.luxValue).toBeFalsy(`Vorbedingung 2`);

      // Änderungen durchführen
      testComponent.formControl.setValue('6/10/2015');
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      const utcNullifiedDate = new Date(0);
      utcNullifiedDate.setUTCFullYear(2015, 5, 10);
      utcNullifiedDate.setUTCHours(0);
      let datepickerEl = fixture.debugElement.query(By.css('input'));
      expect(LuxUtil.stringWithoutASCIIChars(datepickerEl.nativeElement.value)).toEqual(
        '10.06.2015',
        'Nachbedingung 1'
      );
      expect(datepickerComponent.luxValue).toEqual(utcNullifiedDate.toISOString(), `Nachbedingung 2`);

      // Änderungen durchführen
      testComponent.formControl.setValue('7/10/2015');
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      utcNullifiedDate.setUTCMonth(6);
      datepickerEl = fixture.debugElement.query(By.css('input'));
      expect(LuxUtil.stringWithoutASCIIChars(datepickerEl.nativeElement.value)).toEqual(
        '10.07.2015',
        'Nachbedingung 3'
      );
      expect(datepickerComponent.luxValue).toEqual(utcNullifiedDate.toISOString(), `Nachbedingung 4`);
    }));

    it('Sollte das Datum 01.0.2020 in 01.01.2020 umwandeln und nicht in 01.12.2019', fakeAsync(() => {
      fixture.detectChanges();
      // Vorbedingungen testen
      expect(testComponent.formControl.value).toBeFalsy(`Vorbedingung 1`);
      expect(datepickerComponent.luxValue).toBeFalsy(`Vorbedingung 2`);

      // Änderungen durchführen
      testComponent.formControl.setValue('01.0.2020');
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      const utcNullifiedDate = new Date(0);
      utcNullifiedDate.setUTCFullYear(2020, 0, 1);
      utcNullifiedDate.setUTCHours(0);
      const datepickerEl = fixture.debugElement.query(By.css('input'));
      expect(LuxUtil.stringWithoutASCIIChars(datepickerEl.nativeElement.value)).toEqual(
        '01.01.2020',
        'Nachbedingung 1'
      );
      expect(datepickerComponent.luxValue).toEqual(utcNullifiedDate.toISOString(), `Nachbedingung 2`);
    }));

    it('Sollte den korrekten, UTC-genullten Wert ausgeben', fakeAsync(() => {
      const utcNullifedDate = new Date(0);
      utcNullifedDate.setUTCFullYear(2000, 0, 1);
      utcNullifedDate.setUTCHours(0);
      // Vorbedingungen testen
      expect(testComponent.formControl.value).toBeFalsy(`Vorbedingung 1`);
      expect(datepickerComponent.luxValue).toBeFalsy(`Vorbedingung 2`);

      // Änderungen durchführen
      testComponent.formControl.setValue('2000-01-01T10:15:23.000+01:00');
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      expect(testComponent.formControl.value).toEqual(utcNullifedDate.toISOString(), `Nachbedingung 1`);
      expect(datepickerComponent.luxValue).toEqual(utcNullifedDate.toISOString(), `Nachbedingung 2`);

      // Änderungen durchführen
      testComponent.formControl.setValue('2000-01-02T03:59:00.000-05:00');
      utcNullifedDate.setUTCFullYear(2000, 0, 2);
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      expect(testComponent.formControl.value).toEqual(utcNullifedDate.toISOString(), `Nachbedingung 3`);
      expect(datepickerComponent.luxValue).toEqual(utcNullifedDate.toISOString(), `Nachbedingung 4`);
    }));

    it('Sollte required sein', fakeAsync(() => {
      testComponent.formControl.setValidators(Validators.required);
      fixture.detectChanges();
      // Vorbedingungen testen
      let matErrorEl = fixture.debugElement.query(By.css('mat-error'));
      expect(matErrorEl).toBeFalsy(`Vorbedingung 1`);

      // Änderungen durchführen
      testComponent.formControl.markAsTouched();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      matErrorEl = fixture.debugElement.query(By.css('mat-error'));
      expect(matErrorEl).toBeDefined(`Nachbedingung 1`);
      expect(datepickerComponent.formControl.invalid).toBeTruthy('Nachbedingung 2');
    }));

    it('Sollte den korrekten Wert nach asynchronem Aufruf besitzen', fakeAsync(() => {
      // Vorbedingungen testen
      LuxTestHelper.wait(fixture);
      expect(testComponent.formControl.value).toBeFalsy(`Vorbedingung 1`);
      expect(datepickerComponent.luxValue).toBeFalsy(`Vorbedingung 2`);
      expect(datepickerComponent.formControl.value).toBeFalsy(`Vorbedingung 3`);

      // Änderungen durchführen
      of('2005-02-05')
        .pipe(delay(2000))
        .subscribe(value => testComponent.formControl.setValue(value));
      LuxTestHelper.wait(fixture, 2500);

      // Nachbedingungen testen
      const expectedDate = '2005-02-05T00:00:00.000Z';
      expect(testComponent.formControl.value).toEqual(expectedDate, `Nachbedingung 1`);
      expect(datepickerComponent.luxValue).toEqual(expectedDate, `Nachbedingung 2`);
      expect(datepickerComponent.formControl.value).toEqual(expectedDate, `Nachbedingung 3`);
    }));
  });

  describe('außerhalb eines Formulars', () => {
    let fixture: ComponentFixture<LuxNoFormAttributeTestComponent>;
    let testComponent: LuxNoFormAttributeTestComponent;
    let datepickerComponent: LuxDatepickerComponent;
    let overlayHelper: LuxOverlayHelper;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(LuxNoFormAttributeTestComponent);
      testComponent = fixture.componentInstance;
      datepickerComponent = fixture.debugElement.query(By.directive(LuxDatepickerComponent)).componentInstance;
      overlayHelper = new LuxOverlayHelper();

      fixture.detectChanges();
      flush();
    }));

    it('sollte "de-DE" als Default-Locale haben', fakeAsync(() => {
      fixture = TestBed.createComponent(LuxNoFormAttributeTestComponent);
      testComponent = fixture.componentInstance;
      datepickerComponent = fixture.debugElement.query(By.directive(LuxDatepickerComponent)).componentInstance;

      testComponent.value = '03/05/2019';

      LuxTestHelper.wait(fixture);
      flush();

      expect(datepickerComponent['dateAdapter']['locale']).toEqual('de-DE');
      expect(LuxUtil.stringWithoutASCIIChars(fixture.debugElement.query(By.css('input')).nativeElement.value)).toEqual(
        '05.03.2019'
      );
    }));

    it('LuxValue Simple', fakeAsync(() => {
      // Vorbedingungen testen
      expect(testComponent.value).toBeFalsy(`Vorbedingung 1`);
      expect(datepickerComponent.luxValue).toBeFalsy(`Vorbedingung 2`);

      // Änderungen durchführen
      testComponent.value = '10.07.2015';
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      const datepickerEl = fixture.debugElement.query(By.css('input'));
      expect(LuxUtil.stringWithoutASCIIChars(datepickerEl.nativeElement.value)).toEqual(
        '10.07.2015',
        'Nachbedingung 1'
      );
      expect(datepickerComponent.luxValue).toEqual(testComponent.value, `Nachbedingung 2`);

      flush();
    }));

    it('LuxValue mit TWB und Locale de-DE', fakeAsync(() => {
      // Vorbedingungen testen
      testComponent.locale = 'de-DE';
      expect(testComponent.value).toBeFalsy(`Vorbedingung 1`);

      // Änderungen durchführen
      testComponent.value = new Date(2015, 5, 10, 23, 59, 59).toISOString();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      const datepickerEl = fixture.debugElement.query(By.css('input'));
      expect(LuxUtil.stringWithoutASCIIChars(datepickerEl.nativeElement.value)).toEqual(
        '10.06.2015',
        'Nachbedingung 1'
      );

      flush();
    }));

    it('LuxValue mit TWB und Locale en-US', fakeAsync(() => {
      // Vorbedingungen testen
      testComponent.locale = 'en-US';
      expect(testComponent.value).toBeFalsy(`Vorbedingung 1`);

      // Änderungen durchführen
      testComponent.value = new Date(2015, 5, 10, 23, 59, 59).toISOString();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      const datepickerEl = fixture.debugElement.query(By.css('input'));
      expect(LuxUtil.stringWithoutASCIIChars(datepickerEl.nativeElement.value)).toEqual(
        '06/10/2015',
        'Nachbedingung 1'
      );

      flush();
    }));

    it('LuxValue mit TWB und Locale en-GB', fakeAsync(() => {
      // Vorbedingungen testen
      testComponent.locale = 'en-GB';
      expect(testComponent.value).toBeFalsy(`Vorbedingung 1`);

      // Änderungen durchführen
      testComponent.value = new Date(2015, 5, 10, 23, 59, 59).toISOString();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      const datepickerEl = fixture.debugElement.query(By.css('input'));
      expect(LuxUtil.stringWithoutASCIIChars(datepickerEl.nativeElement.value)).toEqual(
        '10/06/2015',
        'Nachbedingung 1'
      );

      flush();
    }));

    it('LuxDisabled', fakeAsync(() => {
      // Vorbedingungen testen
      const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
      const buttonEl = fixture.debugElement.query(By.css('button')).nativeElement;

      expect(testComponent.disabled).toBeFalsy(`Vorbedingung 1`);
      expect(inputEl.disabled).toBeFalsy(`Vorbedingung 2`);
      expect(buttonEl.disabled).toBeFalsy(`Vorbedingung 3`);

      // Änderungen durchführen
      testComponent.disabled = true;
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      expect(testComponent.disabled).toBeTruthy(`Nachbedingung 1`);
      expect(inputEl.disabled).toBeTruthy(`Nachbedingung 2`);
      expect(buttonEl.disabled).toBeTruthy(`Nachbedingung 3`);
    }));

    it('LuxMinDate und LuxMaxDate', fakeAsync(() => {
      // Vorbedingungen testen
      let matErrorEl = fixture.debugElement.query(By.css('mat-error'));
      expect(matErrorEl).toBeFalsy(`Vorbedingung 1`);

      // Änderungen durchführen
      testComponent.minDate = '10/20/2015';
      testComponent.maxDate = '10/25/2015';
      testComponent.value = new Date(2015, 9, 23).toISOString();
      LuxTestHelper.wait(fixture);

      matErrorEl = fixture.debugElement.query(By.css('mat-error'));

      // Nachbedingungen testen
      expect(matErrorEl).toBeFalsy(`Nachbedingung 1`);

      // Änderungen durchführen
      testComponent.value = new Date(2015, 9, 19).toISOString();
      LuxTestHelper.wait(fixture);
      datepickerComponent.formControl.markAsTouched();
      datepickerComponent.formControl.updateValueAndValidity();
      LuxTestHelper.wait(fixture);
      matErrorEl = fixture.debugElement.query(By.css('mat-error'));

      // Nachbedingungen testen
      expect(matErrorEl.nativeElement.innerText.trim()).toEqual(
        'Das Datum unterschreitet den Minimalwert',
        `Nachbedingung 2`
      );

      // // Änderungen durchführen
      testComponent.value = new Date(2015, 9, 27).toISOString();
      LuxTestHelper.wait(fixture);
      datepickerComponent.formControl.markAsTouched();
      datepickerComponent.formControl.updateValueAndValidity();
      LuxTestHelper.wait(fixture);
      matErrorEl = fixture.debugElement.query(By.css('mat-error'));

      // Nachbedingungen testen
      expect(matErrorEl.nativeElement.innerText.trim()).toEqual(
        'Das Datum überschreitet den Maximalwert',
        `Nachbedingung 3`
      );
    }));

    it('LuxCustomFilter', fakeAsync(() => {
      // Vorbedingungen testen
      let matErrorEl = fixture.debugElement.query(By.css('mat-error'));
      expect(matErrorEl).toBeFalsy('Vorbedingung 1');

      // Änderungen durchführen
      testComponent.customFilter = (d: Date): boolean => {
        const day = d.getDay();
        // Prevent Saturday and Sunday from being selected.
        return day !== 0 && day !== 6;
      };
      LuxTestHelper.wait(fixture);
      testComponent.value = new Date(2018, 11, 18).toISOString();
      LuxTestHelper.wait(fixture);
      matErrorEl = fixture.debugElement.query(By.css('mat-error'));

      // Nachbedingungen testen
      expect(matErrorEl).toBeDefined('Nachbedingung 1');

      flush();
    }));

    it('LuxRequired', fakeAsync(() => {
      // Vorbedingungen testen
      testComponent.required = true;
      let matErrorEl = fixture.debugElement.query(By.css('mat-error'));
      expect(matErrorEl).toBeFalsy('Vorbedingung 1');

      // Änderungen durchführen
      datepickerComponent.formControl.markAsTouched();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      matErrorEl = fixture.debugElement.query(By.css('mat-error'));
      expect(matErrorEl).toBeDefined('Nachbedingung 1');
      expect(datepickerComponent.luxRequired).toBeTruthy(`Nachbedingung 2`);
      expect(datepickerComponent.formControl.invalid).toBeTruthy('Nachbedingung 3');

      flush();
    }));

    it('LuxReadonly', fakeAsync(() => {
      // Vorbedingungen testen
      testComponent.readonly = true;
      const inputEl = fixture.debugElement.query(By.css('input'));
      const toggleEl = fixture.debugElement.query(By.css('button')).nativeElement;
      expect(inputEl.attributes.readonly).toBeFalsy('Vorbedingung 1');
      expect(toggleEl.disabled).toBeFalsy('Vorbedingung 2');

      // Änderungen durchführen
      testComponent.readonly = true;
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      expect(inputEl.attributes.readonly).toBeTruthy('Nachbedingung 1');
      expect(toggleEl.disabled).toBeTruthy('Nachbedingung 2');
      expect(datepickerComponent.luxReadonly).toBeTruthy('Nachbedingung 3');
      expect(datepickerComponent.matDatepicker.disabled).toBeTruthy('Nachbedingung 4');
    }));

    it('LuxValidators', fakeAsync(() => {
      // Vorbedingungen testen
      let matError = fixture.debugElement.query(By.css('mat-error'));

      expect(datepickerComponent.formControl.valid).toBe(true);
      expect(matError).toBe(null);

      // Änderungen durchführen
      testComponent.validators = [Validators.required];
      LuxTestHelper.wait(fixture);
      datepickerComponent.formControl.markAsTouched();
      datepickerComponent.formControl.updateValueAndValidity();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      matError = fixture.debugElement.query(By.css('mat-error'));

      expect(datepickerComponent.formControl.valid).toBe(false);
      expect(datepickerComponent.formControl.errors.required).toBeDefined();
      expect(matError).not.toBe(null);

      flush();
      discardPeriodicTasks();
    }));

    it('LuxErrorMessage', fakeAsync(() => {
      // Vorbedingungen testen
      let matError = fixture.debugElement.query(By.css('mat-error'));

      expect(matError).toBe(null);

      // Änderungen durchführen
      testComponent.errorMessage = 'Ein Fehler sie zu knechten';
      testComponent.validators = [Validators.required];
      LuxTestHelper.wait(fixture);
      datepickerComponent.formControl.markAsTouched();
      datepickerComponent.formControl.updateValueAndValidity();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      matError = fixture.debugElement.query(By.css('mat-error'));

      expect(matError).not.toBe(null);
      expect(matError.nativeElement.textContent.trim()).toEqual('Ein Fehler sie zu knechten');

      flush();
    }));

    it('LuxErrorMessageCallback', fakeAsync(() => {
      // Vorbedingungen testen
      let matError = fixture.debugElement.query(By.css('mat-error'));
      expect(matError).toBe(null);

      // Änderungen durchführen
      testComponent.errorCb = (value, errors) => 'Achtung, das ist ein Fehler';
      const spy = spyOn(testComponent, 'errorCb').and.callThrough();

      testComponent.validators = [Validators.required];
      LuxTestHelper.wait(fixture);
      datepickerComponent.formControl.markAsTouched();
      datepickerComponent.formControl.updateValueAndValidity();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      matError = fixture.debugElement.query(By.css('mat-error'));

      expect(matError).not.toBe(null);
      expect(matError.nativeElement.textContent.trim()).toEqual('Achtung, das ist ein Fehler');
      expect(spy).toHaveBeenCalled();

      flush();
    }));

    it('LuxOpened', fakeAsync(() => {
      // Vorbedingungen testen
      let calendar = overlayHelper.selectOneFromOverlay('mat-calendar');
      expect(calendar).toBe(null);

      // Änderungen durchführen
      testComponent.opened = true;
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      calendar = overlayHelper.selectOneFromOverlay('mat-calendar');
      expect(calendar).not.toBe(null);

      // Änderungen durchführen
      testComponent.opened = false;
      // Zwei Aufrufe, weil sonst der Calendar nicht rechtzeitig geschlossen wird
      LuxTestHelper.wait(fixture);
      LuxTestHelper.wait(fixture);

      // Nachbedingungen testen
      calendar = overlayHelper.selectOneFromOverlay('mat-calendar');
      expect(calendar).toBe(null);

      flush();
    }));

    it('Sollte luxValueChange angemessen oft aufrufen', fakeAsync(() => {
      // Vorbedingungen prüfen
      const spy = spyOn(testComponent, 'valueChanged');
      LuxTestHelper.wait(fixture);

      expect(spy).toHaveBeenCalledTimes(0);

      // Änderungen durchführen
      testComponent.value = new Date(2015, 9, 19).toISOString();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(spy).toHaveBeenCalledTimes(1);

      // Änderungen durchführen
      testComponent.value = new Date(2015, 9, 20).toISOString();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(spy).toHaveBeenCalledTimes(2);

      // Änderungen durchführen
      // Absichtlich den selben Wert nochmal, sollte nichts auslösen
      testComponent.value = new Date(2015, 9, 20).toISOString();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(spy).toHaveBeenCalledTimes(2);

      flush();
    }));

    it('Sollte verschiedene Eingabewerte erlauben', fakeAsync(() => {
      // Vorbedingungen prüfen
      LuxTestHelper.wait(fixture);
      expect(testComponent.value).toBeFalsy(`Vorbedingung 1`);
      expect(datepickerComponent.luxValue).toBeFalsy(`Vorbedingung 2`);
      expect(datepickerComponent.formControl.value).toBeFalsy(`Vorbedingung 2`);

      // Änderungen durchführen
      // ISO-String
      testComponent.value = new Date(2000, 5, 10, 10, 15, 0).toISOString();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      let expectedDate = '2000-06-10T00:00:00.000Z';
      expect(testComponent.value).toEqual(expectedDate, 'Nachbedingung 1');
      expect(datepickerComponent.luxValue).toEqual(expectedDate, 'Nachbedingung 2');
      expect(datepickerComponent.formControl.value).toEqual(expectedDate, 'Nachbedingung 3');

      // Änderungen durchführen
      // Date
      testComponent.value = <any>new Date(2001, 5, 10, 10, 15, 0);
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expectedDate = '2001-06-10T00:00:00.000Z';
      expect(testComponent.value).toEqual(expectedDate, 'Nachbedingung 4');
      expect(datepickerComponent.luxValue).toEqual(expectedDate, 'Nachbedingung 5');
      expect(datepickerComponent.formControl.value).toEqual(expectedDate, 'Nachbedingung 6');

      // Änderungen durchführen
      // MM/dd/yyyy
      testComponent.value = '06/10/2002';
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expectedDate = '2002-06-10T00:00:00.000Z';
      expect(testComponent.value).toEqual(expectedDate, 'Nachbedingung 6');
      expect(datepickerComponent.luxValue).toEqual(expectedDate, 'Nachbedingung 7');
      expect(datepickerComponent.formControl.value).toEqual(expectedDate, 'Nachbedingung 8');

      // Änderungen durchführen
      // dd.MM.yyyy
      testComponent.value = '10.06.2003';
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expectedDate = '2003-06-10T00:00:00.000Z';
      expect(testComponent.value).toEqual(expectedDate, 'Nachbedingung 9');
      expect(datepickerComponent.luxValue).toEqual(expectedDate, 'Nachbedingung 10');
      expect(datepickerComponent.formControl.value).toEqual(expectedDate, 'Nachbedingung 11');

      // Änderungen durchführen
      // dd-MM-yyyy
      testComponent.value = '10-06-2004';
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expectedDate = '2004-06-10T00:00:00.000Z';
      expect(testComponent.value).toEqual(expectedDate, 'Nachbedingung 12');
      expect(datepickerComponent.luxValue).toEqual(expectedDate, 'Nachbedingung 13');
      expect(datepickerComponent.formControl.value).toEqual(expectedDate, 'Nachbedingung 14');

      // Änderungen durchführen
      // yyyy-MM-dd
      testComponent.value = '2005-06-10';
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expectedDate = '2005-06-10T00:00:00.000Z';
      expect(testComponent.value).toEqual(expectedDate, 'Nachbedingung 15');
      expect(datepickerComponent.luxValue).toEqual(expectedDate, 'Nachbedingung 16');
      expect(datepickerComponent.formControl.value).toEqual(expectedDate, 'Nachbedingung 17');
    }));

    it('Sollte den korrekten Wert nach asynchronem Aufruf besitzen', fakeAsync(() => {
      // Vorbedingungen testen
      LuxTestHelper.wait(fixture);
      expect(testComponent.value).toBeFalsy(`Vorbedingung 1`);
      expect(datepickerComponent.luxValue).toBeFalsy(`Vorbedingung 2`);
      expect(datepickerComponent.formControl.value).toBeFalsy(`Vorbedingung 3`);

      // Änderungen durchführen
      of('2005-02-05')
        .pipe(delay(2000))
        .subscribe(value => (testComponent.value = value));
      LuxTestHelper.wait(fixture, 2500);
      flush();

      // Nachbedingungen testen
      const expectedDate = '2005-02-05T00:00:00.000Z';
      expect(testComponent.value).toEqual(expectedDate, `Nachbedingung 1`);
      expect(datepickerComponent.luxValue).toEqual(expectedDate, `Nachbedingung 2`);
      expect(datepickerComponent.formControl.value).toEqual(expectedDate, `Nachbedingung 3`);
    }));

    it('Sollte nicht rekursiv Wertaktualisierungen vornehmen', fakeAsync(() => {
      // Vorbedingungen testen
      const spy = spyOn(datepickerComponent, 'notifyFormValueChanged');
      LuxTestHelper.wait(fixture);
      expect(datepickerComponent.luxValue).toBeFalsy(`Vorbedingung 1`);
      expect(datepickerComponent.formControl.value).toBeFalsy(`Vorbedingung 2`);
      expect(spy).toHaveBeenCalledTimes(0);

      // Änderungen durchführen
      for (let i = 0; i < 251; i++) {
        if (i % 2 === 0) {
          datepickerComponent.formControl.setValue('01/01/' + (1950 + i));
        } else {
          testComponent.value = '01/01/' + (1950 + i);
        }
        LuxTestHelper.wait(fixture);
      }

      // Nachbedingungen prüfen
      const expectedDate = '2200-01-01T00:00:00.000Z';
      expect(datepickerComponent.luxValue).toEqual(expectedDate, `Nachbedingung 1`);
      expect(datepickerComponent.formControl.value).toEqual(expectedDate, `Nachbedingung 2`);
      expect(spy).toHaveBeenCalledTimes(251);
    }));
  });
});

@Component({
  template: `
    <lux-datepicker
      luxLabel="Datum"
      [(luxValue)]="value"
      [luxDisabled]="disabled"
      [luxReadonly]="readonly"
      [luxRequired]="required"
      [luxLocale]="locale"
      [luxMinDate]="minDate"
      [luxMaxDate]="maxDate"
      [luxCustomFilter]="customFilter"
      [luxStartDate]="startDate"
      [luxShowToggle]="showToggle"
      [luxErrorMessage]="errorMessage"
      [luxErrorCallback]="errorCb"
      [luxControlValidators]="validators"
      [luxOpened]="opened"
      (luxValueChange)="valueChanged()"
    ></lux-datepicker>
  `
})
class LuxNoFormAttributeTestComponent {
  value: string;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  locale: string;
  minDate: Date | string;
  maxDate: Date | string;
  startDate: Date | string;
  customFilter;
  showToggle: boolean = true;
  errorMessage: string;
  validators: ValidatorFn | ValidatorFn[];
  opened: boolean = false;
  errorCb: (value, errors) => string = (value, errors) => undefined;

  valueChanged() {}
}

export function Validator2019NotAllowed(control: AbstractControl) {
  console.log(
    'Validator called',
    control.value,
    'value' in control && typeof control.value === 'string' && (<string>control.value).indexOf('2019') !== -1
  );
  if ('value' in control && typeof control.value === 'string' && (<string>control.value).indexOf('2019') !== -1) {
    return { NotAllowed2019: true };
  }

  return null;
}

export const exampleErrorCallback = (value, errors) => {
  if (errors.required) {
    return 'Darf nicht leer sein';
  } else if (errors.NotAllowed2019) {
    return 'Das Jahr 2019 darf nicht verwendet werden';
  }
  return 'Es ist ein Fehler aufgetreten';
};

@Component({
  template: `
    <div [formGroup]="form">
      <lux-datepicker
        luxLabel="Datum"
        luxControlBinding="datepicker"
        [luxErrorCallback]="errorCallBack"
      ></lux-datepicker>
    </div>
  `
})
class LuxFormCustomValidatorComponent {
  form: FormGroup;
  formControl: AbstractControl;

  errorCallBack = exampleErrorCallback;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      datepicker: ['', Validators.compose([Validator2019NotAllowed, Validators.required])]
    });
    this.formControl = this.form.get('datepicker');
  }
}

@Component({
  template: `
    <div [formGroup]="form">
      <lux-datepicker luxLabel="Datum" luxControlBinding="datepicker"></lux-datepicker>
      {{ formControl.value }}
    </div>
  `
})
class LuxFormTestComponent {
  form: FormGroup;
  formControl: AbstractControl;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      datepicker: []
    });
    this.formControl = this.form.get('datepicker');
  }
}
