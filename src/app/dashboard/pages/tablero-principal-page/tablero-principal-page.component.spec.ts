import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableroPrincipalPageComponent } from './tablero-principal-page.component';

describe('TableroPrincipalPageComponent', () => {
  let component: TableroPrincipalPageComponent;
  let fixture: ComponentFixture<TableroPrincipalPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableroPrincipalPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableroPrincipalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
