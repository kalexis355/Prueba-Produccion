import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoGestionProcesosComponent } from './dialogo-gestion-procesos.component';

describe('DialogoGestionProcesosComponent', () => {
  let component: DialogoGestionProcesosComponent;
  let fixture: ComponentFixture<DialogoGestionProcesosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogoGestionProcesosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoGestionProcesosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
