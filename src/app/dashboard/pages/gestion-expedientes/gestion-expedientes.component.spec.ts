import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionExpedientesComponent } from './gestion-expedientes.component';

describe('GestionExpedientesComponent', () => {
  let component: GestionExpedientesComponent;
  let fixture: ComponentFixture<GestionExpedientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionExpedientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionExpedientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
