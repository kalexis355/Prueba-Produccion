import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesArchivosComponent } from './detalles-archivos.component';

describe('DetallesArchivosComponent', () => {
  let component: DetallesArchivosComponent;
  let fixture: ComponentFixture<DetallesArchivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetallesArchivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesArchivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
