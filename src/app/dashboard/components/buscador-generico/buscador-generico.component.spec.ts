import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscadorGenericoComponent } from './buscador-generico.component';

describe('BuscadorGenericoComponent', () => {
  let component: BuscadorGenericoComponent;
  let fixture: ComponentFixture<BuscadorGenericoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuscadorGenericoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscadorGenericoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
