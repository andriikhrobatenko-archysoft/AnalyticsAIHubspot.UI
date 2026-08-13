import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { PasswordInput } from './password-input';

@Component({
  imports: [ReactiveFormsModule, PasswordInput],
  template: `<app-password-input [formControl]="control" />`,
})
class HostComponent {
  readonly control = new FormBuilder().nonNullable.control('');
}

describe('PasswordInput', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function nativeInput(): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  }

  function toggleButton(): HTMLButtonElement {
    return fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
  }

  it('starts masked', () => {
    expect(nativeInput().type).toBe('password');
  });

  it('reveals the value as plain text when the toggle is clicked', () => {
    toggleButton().click();
    fixture.detectChanges();

    expect(nativeInput().type).toBe('text');
  });

  it('masks it again on a second click', () => {
    toggleButton().click();
    toggleButton().click();
    fixture.detectChanges();

    expect(nativeInput().type).toBe('password');
  });

  it('writes the form control value into the input (writeValue)', () => {
    host.control.setValue('hunter2');
    fixture.detectChanges();

    expect(nativeInput().value).toBe('hunter2');
  });

  it('propagates typed input back to the form control (registerOnChange)', () => {
    const input = nativeInput();
    input.value = 'correct-horse-battery-staple';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(host.control.value).toBe('correct-horse-battery-staple');
  });
});
