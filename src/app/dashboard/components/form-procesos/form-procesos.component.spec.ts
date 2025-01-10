import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormProcesosComponent } from './form-procesos.component';

describe('FormProcesosComponent', () => {
  let component: FormProcesosComponent;
  let fixture: ComponentFixture<FormProcesosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormProcesosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormProcesosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
