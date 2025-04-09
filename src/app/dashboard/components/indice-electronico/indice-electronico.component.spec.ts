import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndiceElectronicoComponent } from './indice-electronico.component';

describe('IndiceElectronicoComponent', () => {
  let component: IndiceElectronicoComponent;
  let fixture: ComponentFixture<IndiceElectronicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IndiceElectronicoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndiceElectronicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
