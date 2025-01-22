import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackBarProgresoComponent } from './snack-bar-progreso.component';

describe('SnackBarProgresoComponent', () => {
  let component: SnackBarProgresoComponent;
  let fixture: ComponentFixture<SnackBarProgresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SnackBarProgresoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SnackBarProgresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
