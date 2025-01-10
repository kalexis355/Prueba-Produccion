import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoGestionOficinaComponent } from './dialogo-gestion-oficina.component';

describe('DialogoGestionOficinaComponent', () => {
  let component: DialogoGestionOficinaComponent;
  let fixture: ComponentFixture<DialogoGestionOficinaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogoGestionOficinaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoGestionOficinaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
