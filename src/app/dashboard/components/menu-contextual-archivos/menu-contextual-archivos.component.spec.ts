import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuContextualArchivosComponent } from './menu-contextual-archivos.component';

describe('MenuContextualArchivosComponent', () => {
  let component: MenuContextualArchivosComponent;
  let fixture: ComponentFixture<MenuContextualArchivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuContextualArchivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuContextualArchivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
