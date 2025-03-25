import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoEditarComponent } from './dialogo-editar.component';

describe('DialogoEditarComponent', () => {
  let component: DialogoEditarComponent;
  let fixture: ComponentFixture<DialogoEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogoEditarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
