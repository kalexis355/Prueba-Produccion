import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoCompartirComponent } from './dialogo-compartir.component';

describe('DialogoCompartirComponent', () => {
  let component: DialogoCompartirComponent;
  let fixture: ComponentFixture<DialogoCompartirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogoCompartirComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoCompartirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
