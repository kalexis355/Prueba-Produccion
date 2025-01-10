import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizadorArchivosComponent } from './visualizador-archivos.component';

describe('VisualizadorArchivosComponent', () => {
  let component: VisualizadorArchivosComponent;
  let fixture: ComponentFixture<VisualizadorArchivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisualizadorArchivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualizadorArchivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
