import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoCambiarNombreComponent } from './dialogo-cambiar-nombre.component';

describe('DialogoCambiarNombreComponent', () => {
  let component: DialogoCambiarNombreComponent;
  let fixture: ComponentFixture<DialogoCambiarNombreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogoCambiarNombreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoCambiarNombreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
