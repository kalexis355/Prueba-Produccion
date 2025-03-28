import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmaElectronicaPageComponent } from './firma-electronica-page.component';

describe('FirmaElectronicaPageComponent', () => {
  let component: FirmaElectronicaPageComponent;
  let fixture: ComponentFixture<FirmaElectronicaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FirmaElectronicaPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirmaElectronicaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
