import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogoDetallesArchivosComponent } from './dialogo-detalles-archivos.component';

describe('DialogoDetallesArchivosComponent', () => {
  let component: DialogoDetallesArchivosComponent;
  let fixture: ComponentFixture<DialogoDetallesArchivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DialogoDetallesArchivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogoDetallesArchivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
