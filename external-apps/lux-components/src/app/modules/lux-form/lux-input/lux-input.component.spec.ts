import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LuxTestHelper } from '../../lux-util/testing/lux-test-helper';

import { LuxInputComponent } from './lux-input.component';
import { LuxConsoleService } from '../../lux-util/lux-console.service';

describe('LuxInputComponent', () => {
  beforeEach(async () => {
    LuxTestHelper.configureTestModule(
      [LuxConsoleService],
      [
        LuxInputInsideFormComponent,
        LuxInputOutsideFormComponent,
        LuxInputWithPrefixComponent,
        LuxInputAttributesComponent,
        LuxInputWerteInsideFormComponent
      ]
    );
  });

  describe('innerhalb eines Formulars', () => {
    let fixture: ComponentFixture<LuxInputInsideFormComponent>;
    let testComponent: LuxInputInsideFormComponent;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(LuxInputInsideFormComponent);
      testComponent = fixture.componentInstance;
    }));

    describe('type="text"', () => {
      it('Wert über das FormControl setzen', fakeAsync(() => {
        fixture.detectChanges();
        expect(fixture.componentInstance.formGroup.get('text').value).toEqual(
          null,
          `Initial sollte der Wert ein leerer String sein`
        );

        fixture.componentInstance.formGroup.get('text').setValue('abc');

        LuxTestHelper.wait(fixture);

        const inputEl = fixture.debugElement.query(By.css('#text input'));
        expect('abc').toEqual(inputEl.nativeElement.value);
      }));

      it('Wert (Kommazahl) über das Textfeld setzen', fakeAsync(() => {
        fixture.detectChanges();
        expect(fixture.componentInstance.formGroup.get('amount0').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount1').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount2').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );

        const luxInput1El = fixture.debugElement.query(By.css('#amount1 input'));
        LuxTestHelper.setInputValue(luxInput1El.nativeElement, '1234.56', fixture);

        const plainInput2El = fixture.debugElement.query(By.css('#amount2'));
        LuxTestHelper.setInputValue(plainInput2El.nativeElement, '123.456', fixture);
        LuxTestHelper.wait(fixture);

        // Testen, ob der Wert stimmt und der Wert vom Typ 'number' ist.
        expect(1234.56).toEqual(fixture.componentInstance.formGroup.get('amount1').value);
        expect(123.456).toEqual(fixture.componentInstance.formGroup.get('amount2').value);
      }));

      it('Wert über das Textfeld setzen', fakeAsync(() => {
        fixture.detectChanges();
        expect(fixture.componentInstance.formGroup.get('text').value).toEqual(
          null,
          `Initial sollte der Wert ein leerer String sein`
        );

        const inputEl = fixture.debugElement.query(By.css('#text input'));
        LuxTestHelper.setInputValue(inputEl.nativeElement, 'def', fixture);

        LuxTestHelper.wait(fixture);

        expect('def').toEqual(fixture.componentInstance.formGroup.get('text').value);
      }));

      it('Validatoren setzen und die Fehlermeldungen korrekt anzeigen', fakeAsync(() => {
        // Vorbedingungen testen
        testComponent.formGroup.get('text').setValidators(Validators.required);
        fixture.detectChanges();
        const textInput = fixture.debugElement.query(By.css('#text')).componentInstance;
        let errorEl = fixture.debugElement.query(By.css('mat-error'));
        expect(errorEl).toBeFalsy(`Vorbedingung 1`);

        // Änderungen durchführen
        LuxTestHelper.wait(fixture);
        textInput.formControl.markAsTouched();
        textInput.formControl.updateValueAndValidity();
        LuxTestHelper.wait(fixture);

        // Nachbedingungen testen
        errorEl = fixture.debugElement.query(By.css('mat-error'));
        expect(errorEl).toBeTruthy(`Nachbedingung 1`);
        expect(errorEl.nativeElement.innerText.trim()).toEqual('* Pflichtfeld', `Nachbedingung 1`);
        expect(textInput.formControl.valid).toBeFalsy(`Nachbedingung 2`);
      }));

      it('Sollte einen Startwert setzen', fakeAsync(() => {
        testComponent.formGroup.get('text').setValue('abc');
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css('#text input'));

        expect(inputEl.nativeElement.value).toEqual('abc');
      }));

      it('Sollte required sein', fakeAsync(() => {
        // Vorbedingungen prüfen
        fixture.detectChanges();
        const luxInput: LuxInputComponent = fixture.debugElement.query(By.css('#text')).componentInstance;
        expect(testComponent.formGroup.get('text').valid).toBe(true);

        // Änderungen durchführen
        testComponent.formGroup.get('text').setValidators(Validators.required);
        LuxTestHelper.wait(fixture);

        testComponent.formGroup.get('text').markAsTouched();
        testComponent.formGroup.get('text').updateValueAndValidity();
        LuxTestHelper.wait(fixture);

        // Nachbedingungen prüfen
        expect(luxInput.formControl.valid).toBe(false);
        expect(luxInput.formControl.errors).not.toBe(null);
        expect(luxInput.formControl.errors.required).toBe(true);
        expect(luxInput.luxRequired).toBe(true);

        // Änderungen durchführen
        testComponent.formGroup.get('text').setValue('Hallo Welt!');
        testComponent.formGroup.get('text').updateValueAndValidity();
        LuxTestHelper.wait(fixture);

        // Nachbedingungen prüfen
        expect(luxInput.formControl.valid).toBe(true);
        expect(luxInput.formControl.errors).toBe(null);
      }));
    });

    describe('type="number"', () => {
      it('Wert über das FormControl setzen', fakeAsync(() => {
        expect(fixture.componentInstance.formGroup.get('amount0').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );

        fixture.componentInstance.formGroup.get('amount0').setValue(5);

        LuxTestHelper.wait(fixture);

        const inputEl = fixture.debugElement.query(By.css('input'));

        expect(5).toEqual(+inputEl.nativeElement.value);
      }));

      it('Wert über das Textfeld setzen', fakeAsync(() => {
        fixture.detectChanges();
        expect(fixture.componentInstance.formGroup.get('amount0').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount1').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount2').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );

        const luxInput0El = fixture.debugElement.query(By.css('#amount0 input'));
        LuxTestHelper.setInputValue(luxInput0El.nativeElement, 10, fixture);

        const luxInput1El = fixture.debugElement.query(By.css('#amount1 input'));
        LuxTestHelper.setInputValue(luxInput1El.nativeElement, 20, fixture);

        const plainInput2El = fixture.debugElement.query(By.css('#amount2'));
        LuxTestHelper.setInputValue(plainInput2El.nativeElement, 30, fixture);

        LuxTestHelper.wait(fixture);

        // Testen, ob der Wert stimmt und der Wert vom Typ 'number' ist.
        expect(10).toEqual(fixture.componentInstance.formGroup.get('amount0').value);
        expect(20).toEqual(fixture.componentInstance.formGroup.get('amount1').value);
        expect(30).toEqual(fixture.componentInstance.formGroup.get('amount2').value);
      }));

      it('Sollte Komma-Strings nullen und Punkt-Strings zu Zahlen konvertieren (via input.value)', fakeAsync(() => {
        fixture = TestBed.createComponent(LuxInputWerteInsideFormComponent);
        testComponent = fixture.componentInstance;

        fixture.detectChanges();

        expect(fixture.componentInstance.formGroup.get('amount01').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount02').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount03').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount04').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount05').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount06').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount07').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount08').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount09').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount10').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount11').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount12').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount13').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount14').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount15').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount16').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount17').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );

        const luxInput01El = fixture.debugElement.query(By.css('#amount01 input'));
        LuxTestHelper.setInputValue(luxInput01El.nativeElement, 0, fixture);
        const luxInput02El = fixture.debugElement.query(By.css('#amount02 input'));
        LuxTestHelper.setInputValue(luxInput02El.nativeElement, 0.0, fixture);
        const luxInput03El = fixture.debugElement.query(By.css('#amount03 input'));
        LuxTestHelper.setInputValue(luxInput03El.nativeElement, '0.0', fixture);
        const luxInput04El = fixture.debugElement.query(By.css('#amount04 input'));
        LuxTestHelper.setInputValue(luxInput04El.nativeElement, '0,0', fixture);

        const luxInput05El = fixture.debugElement.query(By.css('#amount05 input'));
        LuxTestHelper.setInputValue(luxInput05El.nativeElement, 1, fixture);
        const luxInput06El = fixture.debugElement.query(By.css('#amount06 input'));
        LuxTestHelper.setInputValue(luxInput06El.nativeElement, 10, fixture);
        const luxInput07El = fixture.debugElement.query(By.css('#amount07 input'));
        LuxTestHelper.setInputValue(luxInput07El.nativeElement, 1234567890, fixture);
        const luxInput08El = fixture.debugElement.query(By.css('#amount08 input'));
        LuxTestHelper.setInputValue(luxInput08El.nativeElement, '0.3', fixture);

        const luxInput09El = fixture.debugElement.query(By.css('#amount09 input'));
        LuxTestHelper.setInputValue(luxInput09El.nativeElement, '0.12', fixture);
        const luxInput10El = fixture.debugElement.query(By.css('#amount10 input'));
        LuxTestHelper.setInputValue(luxInput10El.nativeElement, '0,123', fixture);
        const luxInput11El = fixture.debugElement.query(By.css('#amount11 input'));
        LuxTestHelper.setInputValue(luxInput11El.nativeElement, '0.3', fixture);
        const luxInput12El = fixture.debugElement.query(By.css('#amount12 input'));
        LuxTestHelper.setInputValue(luxInput12El.nativeElement, '0,2', fixture);

        const luxInput13El = fixture.debugElement.query(By.css('#amount13 input'));
        LuxTestHelper.setInputValue(luxInput13El.nativeElement, '0.123', fixture);
        const luxInput14El = fixture.debugElement.query(By.css('#amount14 input'));
        LuxTestHelper.setInputValue(luxInput14El.nativeElement, '123', fixture);
        const luxInput15El = fixture.debugElement.query(By.css('#amount15 input'));
        LuxTestHelper.setInputValue(luxInput15El.nativeElement, '123,0', fixture);
        const luxInput16El = fixture.debugElement.query(By.css('#amount16 input'));
        LuxTestHelper.setInputValue(luxInput16El.nativeElement, '123,00', fixture);
        const luxInput17El = fixture.debugElement.query(By.css('#amount17 input'));
        LuxTestHelper.setInputValue(luxInput17El.nativeElement, '123,45', fixture);

        LuxTestHelper.wait(fixture);

        // Testen, ob der Wert stimmt und der Wert vom Typ 'number' ist.
        //
        // Sonderbehandlung (z.B. [0.123, null]) für den Firefox:
        // Der Firefox wandelt z.B. den Wert 0,123 korrekt in 0.123 um.
        // Die anderen Browser wie z.B. Chrome und Edge liefern null zurück.
        // Wichtig ist, dass entweder "null" oder ein Wert vom Typ 'number' im
        // Formular steht.
        expect(0).toEqual(fixture.componentInstance.formGroup.get('amount01').value);
        expect(0).toEqual(fixture.componentInstance.formGroup.get('amount02').value);
        expect(0).toEqual(fixture.componentInstance.formGroup.get('amount03').value);
        expect([0, null]).toContain(fixture.componentInstance.formGroup.get('amount04').value);

        expect(1).toEqual(fixture.componentInstance.formGroup.get('amount05').value);
        expect(10).toEqual(fixture.componentInstance.formGroup.get('amount06').value);
        expect(1234567890).toEqual(fixture.componentInstance.formGroup.get('amount07').value);
        expect(0.3).toEqual(fixture.componentInstance.formGroup.get('amount08').value);

        expect(0.12).toEqual(fixture.componentInstance.formGroup.get('amount09').value);
        expect([0.123, null]).toContain(fixture.componentInstance.formGroup.get('amount10').value);
        expect(0.3).toEqual(fixture.componentInstance.formGroup.get('amount11').value);
        expect([0.2, null]).toContain(fixture.componentInstance.formGroup.get('amount12').value);

        expect(0.123).toEqual(fixture.componentInstance.formGroup.get('amount13').value);
        expect(123).toEqual(fixture.componentInstance.formGroup.get('amount14').value);
        expect([123.0, null]).toContain(fixture.componentInstance.formGroup.get('amount15').value);
        expect([123.0, null]).toContain(fixture.componentInstance.formGroup.get('amount16').value);
        expect([123.45, null]).toContain(fixture.componentInstance.formGroup.get('amount17').value);
      }));

      it('Sollte eingegebene Strings nicht umformatieren (via formControl)', fakeAsync(() => {
        fixture = TestBed.createComponent(LuxInputWerteInsideFormComponent);
        testComponent = fixture.componentInstance;

        fixture.detectChanges();

        expect(fixture.componentInstance.formGroup.get('amount01').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount02').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount03').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount04').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount05').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount06').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount07').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount08').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount09').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount10').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount11').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount12').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount13').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount14').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount15').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount16').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount17').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );

        testComponent.formGroup.get('amount01').setValue(0);
        testComponent.formGroup.get('amount02').setValue(0.0);
        testComponent.formGroup.get('amount03').setValue('0.0');
        testComponent.formGroup.get('amount04').setValue('0,0');
        testComponent.formGroup.get('amount05').setValue(1);
        testComponent.formGroup.get('amount06').setValue(10);
        testComponent.formGroup.get('amount07').setValue(1234567890);
        testComponent.formGroup.get('amount08').setValue('0,3');
        testComponent.formGroup.get('amount09').setValue('0,12');
        testComponent.formGroup.get('amount10').setValue('0,123');
        testComponent.formGroup.get('amount11').setValue('0.3');
        testComponent.formGroup.get('amount12').setValue('0.12');
        testComponent.formGroup.get('amount13').setValue('0.123');
        testComponent.formGroup.get('amount14').setValue('123');
        testComponent.formGroup.get('amount15').setValue('123,0');
        testComponent.formGroup.get('amount16').setValue('123,00');
        testComponent.formGroup.get('amount17').setValue('123,45');

        LuxTestHelper.wait(fixture);

        // Testen, ob der Wert stimmt und der Wert vom Typ 'number' ist.
        expect(0).toEqual(fixture.componentInstance.formGroup.get('amount01').value);
        expect(0).toEqual(fixture.componentInstance.formGroup.get('amount02').value);
        expect('0.0').toEqual(fixture.componentInstance.formGroup.get('amount03').value);
        expect('0,0').toEqual(fixture.componentInstance.formGroup.get('amount04').value);
        expect(1).toEqual(fixture.componentInstance.formGroup.get('amount05').value);
        expect(10).toEqual(fixture.componentInstance.formGroup.get('amount06').value);
        expect(1234567890).toEqual(fixture.componentInstance.formGroup.get('amount07').value);
        expect('0,3').toEqual(fixture.componentInstance.formGroup.get('amount08').value);
        expect('0,12').toEqual(fixture.componentInstance.formGroup.get('amount09').value);
        expect('0,123').toEqual(fixture.componentInstance.formGroup.get('amount10').value);
        expect('0.3').toEqual(fixture.componentInstance.formGroup.get('amount11').value);
        expect('0.12').toEqual(fixture.componentInstance.formGroup.get('amount12').value);
        expect('0.123').toEqual(fixture.componentInstance.formGroup.get('amount13').value);
        expect('123').toEqual(fixture.componentInstance.formGroup.get('amount14').value);
        expect('123,0').toEqual(fixture.componentInstance.formGroup.get('amount15').value);
        expect('123,00').toEqual(fixture.componentInstance.formGroup.get('amount16').value);
        expect('123,45').toEqual(fixture.componentInstance.formGroup.get('amount17').value);
      }));

      it('Keine NaN-Werte setzen', fakeAsync(() => {
        fixture.detectChanges();
        expect(fixture.componentInstance.formGroup.get('amount0').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount1').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );
        expect(fixture.componentInstance.formGroup.get('amount2').value).toEqual(
          0,
          `Initial sollte der Wert ein leerer String sein`
        );

        const luxInput0El = fixture.debugElement.query(By.css('#amount0 input'));
        LuxTestHelper.setInputValue(luxInput0El.nativeElement, 'Hi', fixture);

        const luxInput1El = fixture.debugElement.query(By.css('#amount1 input'));
        LuxTestHelper.setInputValue(luxInput1El.nativeElement, 'Ciao', fixture);

        const plainInput2El = fixture.debugElement.query(By.css('#amount2'));
        LuxTestHelper.setInputValue(plainInput2El.nativeElement, 30, fixture);

        LuxTestHelper.wait(fixture);

        expect(null).toEqual(fixture.componentInstance.formGroup.get('amount0').value);
        expect(null).toEqual(fixture.componentInstance.formGroup.get('amount1').value);
        expect(30).toEqual(fixture.componentInstance.formGroup.get('amount2').value);
      }));

      it('Validatoren setzen und die Fehlermeldungen korrekt anzeigen', fakeAsync(() => {
        // Vorbedingungen testen
        testComponent.formGroup.get('amount1').setValidators(Validators.max(10));
        fixture.detectChanges();
        const numberInput = fixture.debugElement.query(By.css('#amount1')).componentInstance;
        let errorEl = fixture.debugElement.query(By.css('mat-error'));
        expect(errorEl).toBeFalsy(`Vorbedingung 1`);

        // Änderungen durchführen
        LuxTestHelper.wait(fixture);
        testComponent.formGroup.get('amount1').setValue(11);
        numberInput.formControl.markAsTouched();
        numberInput.formControl.updateValueAndValidity();
        LuxTestHelper.wait(fixture);

        // Nachbedingungen testen
        errorEl = fixture.debugElement.query(By.css('mat-error'));
        expect(errorEl).toBeTruthy(`Nachbedingung 1`);
        expect(errorEl.nativeElement.innerText.trim()).toEqual('Der Maximalwert ist 10', `Nachbedingung 1`);
        expect(numberInput.formControl.valid).toBeFalsy(`Nachbedingung 2`);
      }));

      it('Sollte einen Startwert setzen', fakeAsync(() => {
        testComponent.formGroup.get('amount0').setValue(100);
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css('input'));

        expect(+inputEl.nativeElement.value).toEqual(100);
      }));

      it('Sollte required sein', fakeAsync(() => {
        // Vorbedingungen prüfen
        fixture.detectChanges();
        const luxInput: LuxInputComponent = fixture.debugElement.query(By.css('#amount0')).componentInstance;
        expect(testComponent.formGroup.get('amount0').valid).toBe(true);

        // Änderungen durchführen
        testComponent.formGroup.get('amount0').setValidators(Validators.required);
        testComponent.formGroup.get('amount0').setValue(null);
        LuxTestHelper.wait(fixture);

        testComponent.formGroup.get('amount0').markAsTouched();
        testComponent.formGroup.get('amount0').updateValueAndValidity();
        LuxTestHelper.wait(fixture);

        // Nachbedingungen prüfen
        expect(luxInput.formControl.valid).toBe(false);
        expect(luxInput.formControl.errors).not.toBe(null);
        expect(luxInput.formControl.errors.required).toBe(true);
        expect(luxInput.luxRequired).toBe(true);

        // Änderungen durchführen
        testComponent.formGroup.get('amount0').setValue(100);
        testComponent.formGroup.get('amount0').updateValueAndValidity();
        LuxTestHelper.wait(fixture);

        // Nachbedingungen prüfen
        expect(luxInput.formControl.valid).toBe(true);
        expect(luxInput.formControl.errors).toBe(null);
      }));
    });
  });

  describe('außerhalb eines Formulars', () => {
    let fixture: ComponentFixture<LuxInputOutsideFormComponent>;
    let testComponent: LuxInputOutsideFormComponent;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(LuxInputOutsideFormComponent);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
    }));

    describe('type="text"', () => {
      it('Wert über die Component setzen', fakeAsync(() => {
        expect(fixture.componentInstance.myText).toEqual('', `Initial sollte der Wert ein leerer String sein`);

        fixture.componentInstance.myText = 'abc';

        LuxTestHelper.wait(fixture);

        const inputEl = fixture.debugElement.query(By.css('#text input'));

        expect('abc').toEqual(inputEl.nativeElement.value);
      }));

      it('Wert über das Textfeld setzen', fakeAsync(() => {
        expect(fixture.componentInstance.myText).toEqual('', `Initial sollte der Wert ein leerer String sein`);

        const inputEl = fixture.debugElement.query(By.css('#text input'));
        LuxTestHelper.setInputValue(inputEl.nativeElement, 'def', fixture);

        LuxTestHelper.wait(fixture);

        expect('def').toEqual(fixture.componentInstance.myText);
      }));

      it('Validatoren setzen und die Fehlermeldungen korrekt anzeigen', fakeAsync(() => {
        // Vorbedingungen testen
        const textInput = fixture.debugElement.query(By.css('#text')).componentInstance;
        let errorEl = fixture.debugElement.query(By.css('mat-error'));
        expect(errorEl).toBeFalsy(`Vorbedingung 1`);
        expect(textInput.formControl.valid).toBeTruthy(`Vorbedingung 2`);

        // Änderungen durchführen
        testComponent.validators = Validators.compose([Validators.required]);
        LuxTestHelper.wait(fixture);
        textInput.formControl.markAsTouched();
        textInput.formControl.updateValueAndValidity();
        LuxTestHelper.wait(fixture);

        // Nachbedingungen testen
        errorEl = fixture.debugElement.query(By.css('mat-error'));
        expect(errorEl).toBeTruthy(`Nachbedingung 1`);
        expect(errorEl.nativeElement.innerText.trim()).toEqual('* Pflichtfeld', `Nachbedingung 1`);
        expect(textInput.formControl.valid).toBeFalsy(`Nachbedingung 2`);
      }));

      it('Sollte einen Startwert setzen', fakeAsync(() => {
        testComponent.myText = 'abc';
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css('#text input'));

        expect(inputEl.nativeElement.value).toEqual('abc');
      }));
    });

    describe('type="number"', () => {
      it('Wert über die Component setzen', fakeAsync(() => {
        expect(fixture.componentInstance.amount0).toEqual(0, `Initial sollte der Wert ein leerer String sein`);

        fixture.componentInstance.amount0 = 5;

        LuxTestHelper.wait(fixture);

        const inputEl = fixture.debugElement.query(By.css('#amount0 input'));

        expect(5).toEqual(+inputEl.nativeElement.value);
      }));

      it('Wert über das Textfeld setzen', fakeAsync(() => {
        expect(fixture.componentInstance.amount0).toEqual(0, `Initial sollte der Wert 0 sein.`);
        expect(fixture.componentInstance.amount1).toEqual(0, `Initial sollte der Wert 0 sein.`);
        expect(fixture.componentInstance.amount2).toEqual(0, `Initial sollte der Wert 0 sein.`);

        const luxInput0El = fixture.debugElement.query(By.css('#amount0 input'));
        LuxTestHelper.setInputValue(luxInput0El.nativeElement, 10, fixture);

        const luxInput1El = fixture.debugElement.query(By.css('#amount1 input'));
        LuxTestHelper.setInputValue(luxInput1El.nativeElement, 20, fixture);

        const plainInput2El = fixture.debugElement.query(By.css('#amount2'));
        LuxTestHelper.setInputValue(plainInput2El.nativeElement, 30, fixture);

        LuxTestHelper.wait(fixture);

        // Testen, ob der Wert stimmt und der Wert vom Typ 'number' ist.
        expect(10).toEqual(fixture.componentInstance.amount0);
        expect(20).toEqual(fixture.componentInstance.amount1);
        expect(30).toEqual(fixture.componentInstance.amount2);
      }));

      it('Validatoren setzen und die Fehlermeldungen korrekt anzeigen', fakeAsync(() => {
        // Vorbedingungen testen
        const numberInput = fixture.debugElement.query(By.css('#amount1')).componentInstance;
        let errorEl = fixture.debugElement.query(By.css('mat-error'));
        expect(errorEl).toBeFalsy(`Vorbedingung 1`);
        expect(numberInput.formControl.valid).toBeTruthy(`Vorbedingung 2`);

        // Änderungen durchführen
        testComponent.validators = Validators.compose([Validators.max(10)]);
        testComponent.amount1 = 11;
        LuxTestHelper.wait(fixture);
        numberInput.formControl.markAsTouched();
        numberInput.formControl.updateValueAndValidity();
        LuxTestHelper.wait(fixture);

        // Nachbedingungen testen
        errorEl = fixture.debugElement.query(By.css('mat-error'));
        expect(errorEl).toBeTruthy(`Nachbedingung 1`);
        expect(errorEl.nativeElement.innerText.trim()).toEqual('Der Maximalwert ist 10', `Nachbedingung 1`);
        expect(numberInput.formControl.valid).toBeFalsy(`Nachbedingung 2`);
      }));

      it('Sollte einen Startwert setzen', fakeAsync(() => {
        testComponent.amount0 = 100;
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css('#amount0 input'));

        expect(+inputEl.nativeElement.value).toEqual(100);
      }));

      it('Keine NaN-Werte setzen', fakeAsync(() => {
        fixture.detectChanges();
        expect(testComponent.amount0).toEqual(0);
        expect(testComponent.amount1).toEqual(0);
        expect(testComponent.amount2).toEqual(0);

        const luxInput0El = fixture.debugElement.query(By.css('#amount0 input'));
        LuxTestHelper.setInputValue(luxInput0El.nativeElement, 'Hi', fixture);

        const luxInput1El = fixture.debugElement.query(By.css('#amount1 input'));
        LuxTestHelper.setInputValue(luxInput1El.nativeElement, 'Ciao', fixture);

        const plainInput2El = fixture.debugElement.query(By.css('#amount2'));
        LuxTestHelper.setInputValue(plainInput2El.nativeElement, 30, fixture);

        LuxTestHelper.wait(fixture);

        expect(<any>testComponent.amount0).toEqual(null);
        expect(<any>testComponent.amount1).toEqual(null);
        expect(<any>testComponent.amount2).toEqual(30);
      }));
    });
  });

  describe('Pre- und Suffix', () => {
    let fixture: ComponentFixture<LuxInputWithPrefixComponent>;
    let testComponent: LuxInputWithPrefixComponent;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(LuxInputWithPrefixComponent);
      testComponent = fixture.componentInstance;
      fixture.detectChanges();
    }));

    it('Sollte sowohl Pre- als auch Suffix darstellen', fakeAsync(() => {
      // Vorbedingungen prüfen
      let suffix = fixture.debugElement.query(By.css('lux-input-suffix'));
      let prefix = fixture.debugElement.query(By.css('lux-input-prefix'));

      expect(prefix).toBeFalsy('Vorbedingung 1');
      expect(suffix).toBeFalsy('Vorbedingung 2');

      // Änderungen durchführen
      testComponent.showPrefix = true;
      testComponent.showSuffix = true;
      fixture.detectChanges();

      // Nachbedingungen prüfen
      suffix = fixture.debugElement.query(By.css('lux-input-suffix'));
      prefix = fixture.debugElement.query(By.css('lux-input-prefix'));

      expect(prefix).toBeDefined('Nachbedingung 1');
      expect(prefix.nativeElement.innerText.trim()).toEqual('prefix', 'Nachbedingung 2');
      expect(suffix).toBeDefined('Nachbedingung 3');
      expect(suffix.nativeElement.innerText.trim()).toEqual('suffix', 'Nachbedingung 4');
    }));
  });

  describe('Input-Attribute', () => {
    let fixture: ComponentFixture<LuxInputAttributesComponent>;
    let testComponent: LuxInputAttributesComponent;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(LuxInputAttributesComponent);
      testComponent = fixture.componentInstance;
      fixture.detectChanges();
    }));

    it('Sollte im Label nicht "undefined" oder "null" anzeigen', fakeAsync(() => {
      // Vorbedingungen prüfen
      const label = fixture.debugElement.query(By.css('.lux-label'));
      expect(label.nativeElement.textContent.trim()).not.toEqual(undefined);
      expect(label.nativeElement.textContent.trim()).not.toEqual(null);

      // Änderungen durchführen
      testComponent.label = null;
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(label.nativeElement.textContent.trim()).not.toEqual(undefined);
      expect(label.nativeElement.textContent.trim()).not.toEqual(null);

      // Änderungen durchführen
      testComponent.label = undefined;
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(label.nativeElement.textContent.trim()).not.toEqual(undefined);
      expect(label.nativeElement.textContent.trim()).not.toEqual(null);
    }));

    it('Sollte das Label anpassen', fakeAsync(() => {
      // Vorbedingungen prüfen
      let label = fixture.debugElement.query(By.css('.lux-label'));
      expect(label.nativeElement.textContent.trim()).toEqual('');

      // Änderungen durchführen
      testComponent.label = 'Lorem Ipsum';
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      label = fixture.debugElement.query(By.css('.lux-label'));
      expect(label.nativeElement.textContent.trim()).toEqual('Lorem Ipsum');
    }));

    it('Sollte den Hint anpassen', fakeAsync(() => {
      // Vorbedingungen prüfen
      let hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();

      // Änderungen durchführen
      testComponent.hint = 'Dolor Sit';
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint.nativeElement.textContent.trim()).toEqual('Dolor Sit');
    }));

    it('Sollte den Placeholder anpassen', fakeAsync(() => {
      // Vorbedingungen prüfen
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.attributes.placeholder).toBeFalsy();

      // Änderungen durchführen
      testComponent.placeholder = 'Amet';
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(input.attributes.placeholder).toEqual('Amet');
    }));

    it('Sollte readonly sein', fakeAsync(() => {
      // Vorbedingungen prüfen
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.attributes.readonly).toBeFalsy();

      // Änderungen durchführen
      testComponent.readonly = true;
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(input.attributes.readonly).toEqual('true');
    }));

    it('Sollte disabled sein', fakeAsync(() => {
      // Vorbedingungen prüfen
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.disabled).toBe(false);

      // Änderungen durchführen
      testComponent.disabled = true;
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(input.nativeElement.disabled).toBe(true);
    }));

    it('Sollte required sein', fakeAsync(() => {
      // Vorbedingungen prüfen
      const luxInput: LuxInputComponent = fixture.debugElement.query(By.directive(LuxInputComponent)).componentInstance;
      const input = fixture.debugElement.query(By.css('input'));
      expect(input.nativeElement.required).toEqual(false);

      // Änderungen durchführen
      testComponent.required = true;
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(input.nativeElement.required).toEqual(true);

      // Änderungen durchführen
      luxInput.formControl.markAsTouched();
      luxInput.formControl.updateValueAndValidity();
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(luxInput.formControl.valid).toBe(false);
      expect(luxInput.formControl.errors).not.toBe(null);
      expect(luxInput.formControl.errors.required).toBe(true);
    }));

    it('Sollte CSS-Class für linksbündige Zahlen einbauen', fakeAsync(() => {
      // Vorbedingungen prüfen
      testComponent.type = 'number';
      LuxTestHelper.wait(fixture);
      let inputLeftNumber = fixture.debugElement.query(By.css('input.lux-number-left'));
      expect(inputLeftNumber).toBe(null);

      // Änderungen durchführen
      testComponent.numberLeft = true;
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      inputLeftNumber = fixture.debugElement.query(By.css('input.lux-number-left'));
      expect(inputLeftNumber).not.toBe(null);
    }));

    it('Sollte luxValueChange angemessen oft aufrufen', fakeAsync(() => {
      // Vorbedingungen prüfen
      const spy = spyOn(testComponent, 'valueChanged');
      LuxTestHelper.wait(fixture);

      expect(spy).toHaveBeenCalledTimes(0);

      // Änderungen durchführen
      testComponent.value = 'a';
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(spy).toHaveBeenCalledTimes(1);

      // Änderungen durchführen
      testComponent.value = 'b';
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(spy).toHaveBeenCalledTimes(2);

      // Änderungen durchführen
      // Absichtlich den selben Wert nochmal, sollte nichts auslösen
      testComponent.value = 'b';
      LuxTestHelper.wait(fixture);

      // Nachbedingungen prüfen
      expect(spy).toHaveBeenCalledTimes(2);
    }));
  });
});

@Component({
  template: `
    <form [formGroup]="formGroup">
      <!-- Inputs vom Typ 'number' -->
      <lux-input [luxType]="fieldType" luxControlBinding="amount01" id="amount01"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount02" id="amount02"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount03" id="amount03"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount04" id="amount04"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount05" id="amount05"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount06" id="amount06"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount07" id="amount07"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount08" id="amount08"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount09" id="amount09"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount10" id="amount10"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount11" id="amount11"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount12" id="amount12"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount13" id="amount13"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount14" id="amount14"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount15" id="amount15"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount16" id="amount16"></lux-input>
      <lux-input [luxType]="fieldType" luxControlBinding="amount17" id="amount17"></lux-input>
    </form>
  `
})
class LuxInputWerteInsideFormComponent {
  fieldType = 'number';

  formGroup = new FormGroup({
    amount01: new FormControl(0),
    amount02: new FormControl(0),
    amount03: new FormControl(0),
    amount04: new FormControl(0),
    amount05: new FormControl(0),
    amount06: new FormControl(0),
    amount07: new FormControl(0),
    amount08: new FormControl(0),
    amount09: new FormControl(0),
    amount10: new FormControl(0),
    amount11: new FormControl(0),
    amount12: new FormControl(0),
    amount13: new FormControl(0),
    amount14: new FormControl(0),
    amount15: new FormControl(0),
    amount16: new FormControl(0),
    amount17: new FormControl(0)
  });
}

@Component({
  template: `
    <form [formGroup]="formGroup">
      <!-- Inputs vom Typ 'number' -->
      <lux-input [luxType]="fieldType" luxControlBinding="amount0" id="amount0"></lux-input>
      <lux-input luxType="number" luxControlBinding="amount1" id="amount1"></lux-input>
      <input matInput type="number" formControlName="amount2" id="amount2" />

      <!-- Inputs vom Typ 'text' -->
      <lux-input luxControlBinding="text" id="text"></lux-input>
    </form>
  `
})
class LuxInputInsideFormComponent {
  fieldType = 'number';

  formGroup = new FormGroup({
    amount0: new FormControl(0),
    amount1: new FormControl(0),
    amount2: new FormControl(0),
    text: new FormControl(null)
  });
}

@Component({
  template: `
    <!-- Inputs vom Typ 'number' -->
    <lux-input
      luxLabel="amount0"
      luxPlaceholder="amount0"
      [luxType]="fieldType"
      [(luxValue)]="amount0"
      id="amount0"
      [luxControlValidators]="validators"
    ></lux-input>
    <lux-input
      luxLabel="amount1"
      luxPlaceholder="amount1"
      luxType="number"
      [(luxValue)]="amount1"
      id="amount1"
      [luxControlValidators]="validators"
    ></lux-input>
    <input matInput placeholder="amount2" type="number" [(ngModel)]="amount2" luxTagId="amount2" id="amount2" />

    <!-- Inputs vom Typ 'text' -->
    <lux-input luxLabel="myText" [(luxValue)]="myText" id="text" [luxControlValidators]="validators"></lux-input>
  `
})
class LuxInputOutsideFormComponent {
  fieldType = 'number';

  amount0 = 0;
  amount1 = 0;
  amount2 = 0;
  myText = '';
  validators;
}

@Component({
  template: `
    <lux-input luxLabel="amount0" luxPlaceholder="amount0">
      <lux-input-prefix *ngIf="showPrefix">prefix</lux-input-prefix>
      <lux-input-suffix *ngIf="showSuffix">suffix</lux-input-suffix>
    </lux-input>
  `
})
class LuxInputWithPrefixComponent {
  showPrefix;
  showSuffix;
}

@Component({
  template: `
    <lux-input
      [luxType]="type"
      [luxLabel]="label"
      [luxHint]="hint"
      [luxReadonly]="readonly"
      [luxPlaceholder]="placeholder"
      [luxDisabled]="disabled"
      [luxRequired]="required"
      [luxNumberAlignLeft]="numberLeft"
      (luxValueChange)="valueChanged()"
      [luxValue]="value"
    >
    </lux-input>
  `
})
class LuxInputAttributesComponent {
  type: string = 'text';
  label: string;
  hint: string;
  placeholder: string;
  readonly: boolean;
  disabled: boolean;
  required: boolean;
  numberLeft: boolean;
  value: string;

  valueChanged() {}
}
