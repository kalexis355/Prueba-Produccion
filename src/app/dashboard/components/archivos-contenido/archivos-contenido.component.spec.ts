import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivosContenidoComponent } from './archivos-contenido.component';

describe('ArchivosContenidoComponent', () => {
  let component: ArchivosContenidoComponent;
  let fixture: ComponentFixture<ArchivosContenidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ArchivosContenidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchivosContenidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
